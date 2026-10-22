import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { resolveCustomer } from '@/lib/auth';
import { sendOrderExchangeWhatsAppNotifications } from '@dod/database';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await resolveCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to request exchange' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || 'Exchange requested by customer').trim();

    let order: any = null;
    let databaseConnected = true;

    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, customer: true }
      });
    } catch (e) {
      console.warn('⚠️ Database query failed for exchange order, falling back to JSON DB:', e);
      databaseConnected = false;
    }

    if (!order) {
      const orders = fallbackDb.getCollection('orders');
      order = orders.find((o: any) => o.id === id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check: Customer can only request exchange on their own order
    if (order.customerId && order.customerId !== customer.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to request an exchange for this order' },
        { status: 403 }
      );
    }

    let returnRequest = null;

    // Record Return / Exchange Request in DB
    if (databaseConnected) {
      try {
        returnRequest = await prisma.returnRequest.create({
          data: {
            id: `EXC-${Date.now().toString().slice(-6)}`,
            orderId: id,
            customerId: order.customerId,
            reason: 'EXCHANGE',
            description: reason,
            status: 'PENDING',
          }
        });

        order = await prisma.order.update({
          where: { id },
          data: {
            returnReason: reason,
          },
          include: { items: true, customer: true }
        });
      } catch (dbErr) {
        databaseConnected = false;
      }
    }

    if (!databaseConnected) {
      const returnRequests = fallbackDb.getCollection('returnRequests');
      returnRequest = {
        id: `EXC-${Date.now().toString().slice(-6)}`,
        orderId: id,
        customerId: order.customerId,
        reason: 'EXCHANGE',
        description: reason,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      returnRequests.push(returnRequest);
      fallbackDb.saveCollection('returnRequests', returnRequests);

      const orders = fallbackDb.getCollection('orders');
      const idx = orders.findIndex((o: any) => o.id === id);
      if (idx !== -1) {
        orders[idx].returnReason = reason;
        orders[idx].updatedAt = new Date().toISOString();
        fallbackDb.saveCollection('orders', orders);
        order = orders[idx];
      }
    }

    // AUTOMATIC WHATSAPP NOTIFICATIONS (Admin + Customer)
    let whatsappDetails = null;
    try {
      whatsappDetails = await sendOrderExchangeWhatsAppNotifications(order, reason, 'all');
    } catch (waErr) {
      console.error('⚠️ WhatsApp exchange notification failed:', waErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Exchange request submitted successfully. WhatsApp notifications sent.',
      returnRequest,
      order: {
        id: order.id,
        returnReason: order.returnReason,
        whatsappDetails
      }
    });
  } catch (err: any) {
    console.error('Exchange Order API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to submit exchange request' },
      { status: 500 }
    );
  }
}
