import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { productSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    let products: any[] = [];
    let total = 0;
    let databaseConnected = true;

    try {
      // 1. Try querying the database
      const where: any = {};
      if (categoryId) where.categoryId = categoryId;
      if (status && status !== 'ALL') {
        where.status = status;
      } else if (!status) {
        where.status = { not: 'ARCHIVED' };
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Query products
      products = await prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          collection: { select: { id: true, name: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      });

      total = await prisma.product.count({ where });

    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Fall back to local JSON database
      let allProducts = fallbackDb.getCollection('products');
      const categories = fallbackDb.getCollection('categories');
      const collections = fallbackDb.getCollection('collections');

      // Filtering
      if (categoryId) {
        allProducts = allProducts.filter(p => p.categoryId === categoryId);
      }
      if (status && status !== 'ALL') {
        allProducts = allProducts.filter(p => p.status === status);
      } else if (!status) {
        allProducts = allProducts.filter(p => p.status !== 'ARCHIVED');
      }
      if (search) {
        const query = search.toLowerCase();
        allProducts = allProducts.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      // Sorting
      allProducts.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Fallback for missing properties
        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortOrder === 'asc'
            ? (valA as number) - (valB as number)
            : (valB as number) - (valA as number);
        }
      });

      total = allProducts.length;

      // Slice for pagination
      const slicedProducts = allProducts.slice(skip, skip + limit);

      // Map categories and collections to match relation structure
      products = slicedProducts.map(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        const coll = collections.find(c => c.id === p.collectionId);
        return {
          ...p,
          category: cat ? { id: cat.id, name: cat.name } : null,
          collection: coll ? { id: coll.id, name: coll.name } : null,
        };
      });
    }

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (err: any) {
    console.error('Products GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve products list' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;
    const userRole = session!.role;
    const userId = session!.id;

    const body = await req.json();

    // Validate inputs with Zod schema
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate slug from product name if not provided
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let databaseConnected = true;
    let newProduct = null;

    try {
      // 1. Try to save to DB
      newProduct = await prisma.$transaction(async (tx: any) => {
        const product = await tx.product.create({
          data: {
            ...data,
            slug,
            collectionId: data.collectionId || null,
          },
          include: {
            category: { select: { id: true, name: true } },
            collection: { select: { id: true, name: true } }
          }
        });

        // Create initial stock in log if stock > 0
        if (data.stock > 0) {
          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              change: data.stock,
              type: 'STOCK_IN',
              user: `User (ID: ${userId})`,
            }
          });
        }

        // Write to security audit log
        try {
          await tx.securityLog.create({
            data: {
              action: `Product Created: ${product.name} (SKU: ${product.sku})`,
              adminName: `Admin ID: ${userId}`,
              role: userRole,
              ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
              device: req.headers.get('user-agent') || 'Unknown Browser',
              status: 'SUCCESS',
            }
          });
        } catch (secErr) {
          console.warn('Security log write failed:', secErr);
        }

        return product;
      });

    } catch (dbError) {
      console.warn('⚠️ Database write failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Fall back to local JSON database
      const products = fallbackDb.getCollection('products');
      const categories = fallbackDb.getCollection('categories');
      const collections = fallbackDb.getCollection('collections');

      // Verify SKU uniqueness in fallback
      if (products.some(p => p.sku === data.sku)) {
        return NextResponse.json(
          { error: 'Product with SKU already exists' },
          { status: 400 }
        );
      }

      const pId = randomUUID();
      const productObj = {
        ...data,
        id: pId,
        slug,
        collectionId: data.collectionId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 5.0,
        reviewCount: 0,
      };

      products.push(productObj);
      fallbackDb.saveCollection('products', products);

      // Save Inventory Log in fallback
      if (data.stock > 0) {
        const invLogs = fallbackDb.getCollection('inventoryLogs');
        invLogs.push({
          id: randomUUID(),
          productId: pId,
          productName: data.name,
          sku: data.sku,
          change: data.stock,
          type: 'STOCK_IN',
          timestamp: new Date().toISOString(),
          user: `Admin ID: ${userId} (${userRole})`,
        });
        fallbackDb.saveCollection('inventoryLogs', invLogs);
      }

      // Save Security Log in fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Product Created (Fallback): ${data.name} (SKU: ${data.sku})`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      const cat = categories.find(c => c.id === data.categoryId);
      const coll = collections.find(c => c.id === data.collectionId);

      newProduct = {
        ...productObj,
        category: cat ? { id: cat.id, name: cat.name } : null,
        collection: coll ? { id: coll.id, name: coll.name } : null,
      };
    }

    return NextResponse.json({
      success: true,
      product: newProduct
    }, { status: 201 });

  } catch (err: any) {
    console.error('Product POST error:', err);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
