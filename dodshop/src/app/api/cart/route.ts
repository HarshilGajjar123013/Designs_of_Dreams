import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { resolveCustomer } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get('userId');
    const customer = await resolveCustomer(req, queryUserId);

    if (!customer) {
      return NextResponse.json({
        success: true,
        cart: []
      });
    }

    const userId = customer.userId;

    let cartItems: any[] = [];
    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database via Prisma
      cartItems = await prisma.cartItem.findMany({
        where: { customerId: userId },
        include: { product: true }
      });
    } catch (dbError) {
      console.warn('⚠️ Cart GET DB query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    let formattedCart: any[] = [];

    if (databaseConnected) {
      formattedCart = cartItems.map(item => ({
        product: {
          id: item.product.id,
          title: item.product.name,
          subtitle: item.product.fabric || item.product.subCategory || '',
          category: 'Saree',
          subcategory: item.product.subCategory,
          desc: item.product.description,
          longDesc: item.product.description,
          price: item.product.sellingPrice,
          mrp: item.product.mrp,
          discountPercent: item.product.discount,
          image: item.product.images?.[0] || '',
          badge: item.product.featured ? "Featured" : item.product.newArrival ? "New Arrival" : item.product.bestSeller ? "Best Seller" : "",
          fabrics: [item.product.fabric],
          features: item.product.features || [],
          sizes: item.product.sizes || [],
          rating: item.product.rating || 5.0,
          images: item.product.images || []
        },
        quantity: item.quantity,
        size: item.size
      }));
    } else {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const customer = customers.find(c => c.id === userId);
      const fallbackCart = customer?.cart || [];
      const products = fallbackDb.getCollection('products');

      formattedCart = fallbackCart.map((c: any) => {
        const p = products.find(prod => prod.id === c.productId);
        return {
          product: p ? {
            id: p.id,
            title: p.name,
            subtitle: p.fabric || p.subCategory || '',
            category: 'Saree',
            subcategory: p.subCategory,
            desc: p.description,
            longDesc: p.description,
            price: p.sellingPrice,
            mrp: p.mrp,
            discountPercent: p.discount,
            image: p.images?.[0] || c.image || '',
            badge: p.featured ? "Featured" : p.newArrival ? "New Arrival" : p.bestSeller ? "Best Seller" : "",
            fabrics: [p.fabric],
            features: p.features || [],
            sizes: p.sizes || [],
            rating: p.rating || 5.0,
            images: p.images || []
          } : {
            id: c.productId,
            title: c.name || '',
            subtitle: '',
            category: 'Saree',
            subcategory: '',
            desc: '',
            longDesc: '',
            price: c.price || 0,
            image: c.image || '',
            badge: '',
            fabrics: [],
            features: [],
            sizes: [],
            rating: 5.0,
            images: []
          },
          quantity: c.quantity || 1,
          size: c.size || 'One Size'
        };
      });
    }

    return NextResponse.json({
      success: true,
      cart: formattedCart
    });

  } catch (err: any) {
    console.error('Error fetching cart:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve cart items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, userId: bodyUserId } = body;
    const customer = await resolveCustomer(req, bodyUserId);

    if (!Array.isArray(cart)) {
      return NextResponse.json(
        { error: 'Cart array is required' },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json({
        success: true,
        message: 'Guest cart acknowledged'
      });
    }

    const userId = customer.userId;

    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database transaction
      await prisma.$transaction(async (tx: any) => {
        // Delete all old cart items
        await tx.cartItem.deleteMany({
          where: { customerId: userId }
        });

        // Insert new cart items
        if (cart.length > 0) {
          await tx.cartItem.createMany({
            data: cart.map((item: any) => ({
              customerId: userId,
              productId: item.product.id,
              quantity: item.quantity,
              size: item.size
            }))
          });
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Cart POST DB transaction failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const index = customers.findIndex(c => c.id === userId);

      if (index > -1) {
        customers[index].cart = cart.map((item: any) => ({
          productId: item.product.id,
          name: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          image: item.product.image
        }));
        fallbackDb.saveCollection('customers', customers);
      } else {
        return NextResponse.json(
          { error: 'User not found in fallback database' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true
    });

  } catch (err: any) {
    console.error('Error updating cart:', err);
    return NextResponse.json(
      { error: 'Failed to sync cart items' },
      { status: 500 }
    );
  }
}
