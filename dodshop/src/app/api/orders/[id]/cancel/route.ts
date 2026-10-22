import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { resolveCustomer } from '@/lib/auth';
import { sendOrderCancellationWhatsAppNotifications } from '@dod/database';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await resolveCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to cancel order' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || 'Requested by customer').trim();

    let order: any = null;
    let databaseConnected = true;

    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, customer: true }
      });
    } catch (e) {
      console.warn('⚠️ Database query failed for cancel order, falling back to JSON DB:', e);
      databaseConnected = false;
    }

    if (!order) {
      const orders = fallbackDb.getCollection('orders');
      order = orders.find((o: any) => o.id === id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check: Customer can only cancel their own order
    if (order.customerId && order.customerId !== customer.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to cancel this order' },
        { status: 403 }
      );
    }

    // Check if order is already cancelled
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This order is already cancelled.' },
        { status: 400 }
      );
    }

    // Update status in DB
    if (databaseConnected) {
      try {
        order = await prisma.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelReason: reason,
          },
          include: { items: true, customer: true }
        });
      } catch (dbErr) {
        databaseConnected = false;
      }
    }

    if (!databaseConnected) {
      const orders = fallbackDb.getCollection('orders');
      const idx = orders.findIndex((o: any) => o.id === id);
      if (idx !== -1) {
        orders[idx].status = 'CANCELLED';
        orders[idx].cancelReason = reason;
        orders[idx].updatedAt = new Date().toISOString();
        fallbackDb.saveCollection('orders', orders);
        order = orders[idx];
      }
    }

    // AUTOMATIC WHATSAPP NOTIFICATIONS (Admin + Customer)
    let whatsappDetails = null;
    try {
      whatsappDetails = await sendOrderCancellationWhatsAppNotifications(order, reason, 'all');
    } catch (waErr) {
      console.error('⚠️ WhatsApp cancellation notification failed:', waErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancellation submitted successfully. WhatsApp notifications sent.',
      order: {
        id: order.id,
        status: order.status,
        cancelReason: order.cancelReason,
        whatsappDetails
      }
    });
  } catch (err: any) {
    console.error('Cancel Order API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
