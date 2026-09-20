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
        orders: []
      });
    }

    const userId = customer.userId;

    let userOrders: any[] = [];
    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database via Prisma
      userOrders = await prisma.order.findMany({
        where: { customerId: userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbError) {
      console.warn('⚠️ Orders DB query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const orders = fallbackDb.getCollection('orders');
      userOrders = orders.filter(o => o.customerId === userId);
      // Sort fallback orders descending by createdAt
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Collect product IDs to resolve product images from catalog
    const productIds = [...new Set(userOrders.flatMap(o => (o.items || []).map((i: any) => i.productId)).filter(Boolean))];
    const productMap = new Map<string, string>();
    if (productIds.length > 0) {
      try {
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, images: true }
        });
        products.forEach(p => {
          if (p.images && p.images[0]) {
            productMap.set(p.id, p.images[0]);
          }
        });
      } catch (e) {
        console.warn('⚠️ Could not resolve product images for orders:', e);
      }
    }

    // Format orders for frontend use
    const formattedOrders = userOrders.map(o => {
      // Format date
      const dateObj = new Date(o.createdAt);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Format status to lowercase to match CSS classes
      const status = o.status.toLowerCase();

      // Format payment mode
      let paymentMode = o.paymentMethod;
      if (o.paymentMethod === 'COD') paymentMode = 'Cash On Delivery (COD)';
      else if (o.paymentMethod === 'UPI') paymentMode = 'UPI Payment';
      else paymentMode = `${String(o.paymentMethod).replace('_', ' ')} Payment`;

      // Format address
      let addressStr = '';
      if (o.shippingAddress) {
        const addr = typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress;
        addressStr = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country]
          .filter(Boolean)
          .join(', ');
      }

      return {
        id: o.id,
        date: formattedDate,
        status,
        amount: o.grandTotal,
        items: (o.items || []).map((item: any) => ({
          productId: item.productId,
          title: item.name,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
          image: productMap.get(item.productId) || item.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300"
        })),
        address: addressStr,
        paymentMode
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });

  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}
