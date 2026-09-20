import { NextResponse } from 'next/server';
import { prisma, fallbackDb, sendOrderWhatsAppNotifications } from '@dod/database';
import { verifyAdminSession } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json().catch(() => ({}));
    const recipient: 'admin' | 'customer' | 'all' = body.recipient || 'all';

    let order: any = null;
    let databaseConnected = true;

    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!order) {
      const orders = fallbackDb.getCollection('orders');
      order = orders.find((o: any) => o.id === id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Force retry the requested recipient (admin, customer, or all)
    const updatedDetails = await sendOrderWhatsAppNotifications(order, recipient, { force: true });

    // Reload the updated order
    let updatedOrder: any = null;
    if (databaseConnected) {
      try {
        updatedOrder = await prisma.order.findUnique({
          where: { id },
          include: { items: true },
        });
      } catch {
        // ignore
      }
    }

    if (!updatedOrder) {
      const orders = fallbackDb.getCollection('orders');
      updatedOrder = orders.find((o: any) => o.id === id) || { ...order, whatsappDetails: updatedDetails };
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      whatsappDetails: updatedDetails,
    });
  } catch (err: any) {
    console.error('WhatsApp retry error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to retry WhatsApp notification' }, { status: 500 });
  }
}
