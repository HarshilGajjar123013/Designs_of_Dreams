import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let orders: any[] = [];
    let databaseConnected = true;

    try {
      const where: any = {};
      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { id: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerEmail: { contains: search, mode: 'insensitive' } },
        ];
      }

      orders = await prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed, using fallback JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      orders = fallbackDb.getCollection('orders');

      // Filter status
      if (status && status !== 'ALL') {
        orders = orders.filter(o => o.status === status);
      }

      // Filter search
      if (search) {
        const query = search.toLowerCase();
        orders = orders.filter(o => 
          o.id.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerEmail.toLowerCase().includes(query) ||
          (o.shippingAddress?.phone || '').includes(query)
        );
      }
      
      // Sort desc
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (err: any) {
    console.error('Orders GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}
