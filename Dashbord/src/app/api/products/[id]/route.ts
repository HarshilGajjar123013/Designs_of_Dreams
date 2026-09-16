import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { productSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let product = null;
    let databaseConnected = true;

    try {
      product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true } },
          collection: { select: { id: true, name: true } }
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const products = fallbackDb.getCollection('products');
      const categories = fallbackDb.getCollection('categories');
      const collections = fallbackDb.getCollection('collections');

      const found = products.find(p => p.id === id);
      if (found) {
        const cat = categories.find(c => c.id === found.categoryId);
        const coll = collections.find(c => c.id === found.collectionId);
        product = {
          ...found,
          category: cat ? { id: cat.id, name: cat.name } : null,
          collection: coll ? { id: coll.id, name: coll.name } : null,
        };
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });

  } catch (err: any) {
    console.error('Product GET ID error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve product details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { id } = await params;
    const userRole = session!.role;
    const userId = session!.id;

    const body = await req.json();

    // Partial validate: we can parse the schema partially
    const validation = productSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    let databaseConnected = true;
    let updatedProduct = null;

    try {
      // 1. Try DB transaction
      updatedProduct = await prisma.$transaction(async (tx: any) => {
        // Fetch current product to check stock difference
        const current = await tx.product.findUnique({
          where: { id },
          select: { name: true, sku: true, stock: true }
        });

        if (!current) {
          throw new Error('NOT_FOUND');
        }

        const dataToUpdate: any = { ...data };
        if (data.name) {
          dataToUpdate.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        }

        const product = await tx.product.update({
          where: { id },
          data: dataToUpdate,
          include: {
            category: { select: { id: true, name: true } },
            collection: { select: { id: true, name: true } }
          }
        });

        // If stock level changed, record inventory adjustment
        if (data.stock !== undefined && data.stock !== current.stock) {
          const diff = data.stock - current.stock;
          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              change: diff,
              type: diff > 0 ? 'STOCK_IN' : 'MANUAL_ADJUST',
              user: `User (ID: ${userId})`,
            }
          });
        }

        // Security Log
        try {
          await tx.securityLog.create({
            data: {
              action: `Product Updated: ${product.name} (SKU: ${product.sku})`,
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

    } catch (dbError: any) {
      if (dbError.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      console.warn('⚠️ Database patch failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Fall back to local JSON database
      const products = fallbackDb.getCollection('products');
      const categories = fallbackDb.getCollection('categories');
      const collections = fallbackDb.getCollection('collections');

      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const current = products[index];

      const slug = data.name
        ? data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : current.slug;

      const productObj = {
        ...current,
        ...data,
        slug,
        updatedAt: new Date().toISOString(),
      };

      products[index] = productObj;
      fallbackDb.saveCollection('products', products);

      // Inventory logging for fallback stock change
      if (data.stock !== undefined && data.stock !== current.stock) {
        const diff = data.stock - current.stock;
        const invLogs = fallbackDb.getCollection('inventoryLogs');
        invLogs.push({
          id: randomUUID(),
          productId: id,
          productName: productObj.name,
          sku: productObj.sku,
          change: diff,
          type: diff > 0 ? 'STOCK_IN' : 'MANUAL_ADJUST',
          timestamp: new Date().toISOString(),
          user: `Admin ID: ${userId} (${userRole})`,
        });
        fallbackDb.saveCollection('inventoryLogs', invLogs);
      }

      // Security Log in fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Product Updated (Fallback): ${productObj.name} (SKU: ${productObj.sku})`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      const cat = categories.find(c => c.id === productObj.categoryId);
      const coll = collections.find(c => c.id === productObj.collectionId);

      updatedProduct = {
        ...productObj,
        category: cat ? { id: cat.id, name: cat.name } : null,
        collection: coll ? { id: coll.id, name: coll.name } : null,
      };
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct
    });

  } catch (err: any) {
    console.error('Product PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { id } = await params;
    const userRole = session!.role;
    const userId = session!.id;

    let databaseConnected = true;
    let archivedProduct = null;

    try {
      archivedProduct = await prisma.$transaction(async (tx: any) => {
        // Soft delete by updating status to ARCHIVED
        const product = await tx.product.update({
          where: { id },
          data: { status: 'ARCHIVED' },
        });

        // Security Log
        try {
          await tx.securityLog.create({
            data: {
              action: `Product Archived: ${product.name} (SKU: ${product.sku})`,
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
      console.warn('⚠️ Database delete failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Fall back to local JSON database
      const products = fallbackDb.getCollection('products');
      const index = products.findIndex(p => p.id === id);

      if (index === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const current = products[index];
      current.status = 'ARCHIVED';
      current.updatedAt = new Date().toISOString();
      products[index] = current;
      fallbackDb.saveCollection('products', products);

      // Security Log in fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Product Archived (Fallback): ${current.name} (SKU: ${current.sku})`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      archivedProduct = current;
    }

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully',
      product: archivedProduct
    });

  } catch (err: any) {
    console.error('Product DELETE error:', err);
    return NextResponse.json(
      { error: 'Failed to archive product' },
      { status: 500 }
    );
  }
}
