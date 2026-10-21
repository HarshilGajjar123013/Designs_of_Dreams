import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

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

export async function DELETE(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Array of order ids is required' }, { status: 400 });
    }

    let databaseConnected = true;

    try {
      await prisma.order.deleteMany({
        where: { id: { in: ids } },
      });

      try {
        await prisma.securityLog.create({
          data: {
            action: `Bulk Orders Deleted (${ids.length} orders): ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''}`,
            adminName: `Admin ID: ${session!.id}`,
            role: session!.role,
            status: 'SUCCESS',
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            device: req.headers.get('user-agent') || 'Unknown Browser',
          }
        });
      } catch (secErr) {
        console.warn('Security log write failed:', secErr);
      }
    } catch (dbError) {
      console.warn('⚠️ Database bulk delete failed, using fallback JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const orders = fallbackDb.getCollection('orders');
      const filtered = orders.filter((o: any) => !ids.includes(o.id));
      fallbackDb.saveCollection('orders', filtered);
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error('Orders bulk DELETE error:', err);
    return NextResponse.json(
      { error: 'Failed to delete orders' },
      { status: 500 }
    );
  }
}

