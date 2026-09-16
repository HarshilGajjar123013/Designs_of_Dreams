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
        wishlist: []
      });
    }

    const userId = customer.userId;

    let wishlistItems: any[] = [];
    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database via Prisma
      wishlistItems = await prisma.wishlistItem.findMany({
        where: { customerId: userId },
        include: { product: true }
      });
    } catch (dbError) {
      console.warn('⚠️ Wishlist GET DB query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    let formattedWishlist: any[] = [];

    if (databaseConnected) {
      formattedWishlist = wishlistItems.map(item => ({
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
      }));
    } else {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const customer = customers.find(c => c.id === userId);
      const fallbackWishlist = customer?.wishlist || [];
      const products = fallbackDb.getCollection('products');

      formattedWishlist = fallbackWishlist.map((c: any) => {
        const p = products.find(prod => prod.id === c.productId);
        return p ? {
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
        };
      });
    }

    return NextResponse.json({
      success: true,
      wishlist: formattedWishlist
    });

  } catch (err: any) {
    console.error('Error fetching wishlist:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve wishlist items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wishlist, userId: bodyUserId } = body;
    const customer = await resolveCustomer(req, bodyUserId);

    if (!Array.isArray(wishlist)) {
      return NextResponse.json(
        { error: 'Wishlist array is required' },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json({
        success: true,
        message: 'Guest wishlist acknowledged'
      });
    }

    const userId = customer.userId;

    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database transaction
      await prisma.$transaction(async (tx: any) => {
        // Delete all old wishlist items
        await tx.wishlistItem.deleteMany({
          where: { customerId: userId }
        });

        // Insert new wishlist items
        if (wishlist.length > 0) {
          await tx.wishlistItem.createMany({
            data: wishlist.map((prod: any) => ({
              customerId: userId,
              productId: prod.id
            }))
          });
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Wishlist POST DB transaction failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const index = customers.findIndex(c => c.id === userId);

      if (index > -1) {
        customers[index].wishlist = wishlist.map((prod: any) => ({
          productId: prod.id,
          name: prod.title,
          price: prod.price,
          image: prod.image
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
    console.error('Error updating wishlist:', err);
    return NextResponse.json(
      { error: 'Failed to sync wishlist items' },
      { status: 500 }
    );
  }
}
