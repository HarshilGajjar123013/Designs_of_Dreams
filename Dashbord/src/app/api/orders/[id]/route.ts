import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';
import {
  sendOrderCancellationWhatsAppNotifications,
  sendOrderExchangeWhatsAppNotifications
} from '@dod/database';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { status, carrier, trackingId, estimatedDelivery } = body;

    const userRole = session!.role;
    const userId = session!.id;

    let updatedOrder = null;
    let databaseConnected = true;

    try {
      // 1. Try DB Write
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
          updateData.paymentStatus = 'PAID';
        }
      }

      if (carrier !== undefined || trackingId !== undefined || estimatedDelivery !== undefined) {
        const currentTracking = (order.trackingDetails as any) || {};
        const logs = currentTracking.logs || [];
        
        if (status && status !== order.status) {
          logs.push({
            status: `Order status changed to ${status}`,
            timestamp: new Date().toISOString(),
            location: 'Atelier Hub'
          });
        }

        updateData.trackingDetails = {
          carrier: carrier !== undefined ? carrier : currentTracking.carrier,
          trackingId: trackingId !== undefined ? trackingId : currentTracking.trackingId,
          estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : currentTracking.estimatedDelivery,
          logs
        };
      }

      updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: { items: true }
      });

      // Audit Log
      await prisma.securityLog.create({
        data: {
          action: `Order ${id} Updated (Status: ${status || 'N/A'}, Tracking: ${trackingId || 'N/A'})`,
          adminName: `Admin ID: ${userId}`,
          role: userRole,
          status: 'SUCCESS'
        }
      });

    } catch (dbError) {
      console.warn('⚠️ Database patch failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Fallback DB Write
      const orders = fallbackDb.getCollection('orders');
      const orderIndex = orders.findIndex(o => o.id === id);

      if (orderIndex === -1) {
        return NextResponse.json({ error: 'Order not found in fallback' }, { status: 404 });
      }

      const order = orders[orderIndex];

      if (status) {
        order.status = status;
        if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
          order.paymentStatus = 'PAID';
        }
      }

      if (carrier !== undefined || trackingId !== undefined || estimatedDelivery !== undefined) {
        const currentTracking = order.trackingDetails || {};
        const logs = currentTracking.logs || [];

        if (status && status !== order.status) {
          logs.push({
            status: `Order status changed to ${status}`,
            timestamp: new Date().toISOString(),
            location: 'Atelier Hub'
          });
        }

        order.trackingDetails = {
          carrier: carrier !== undefined ? carrier : currentTracking.carrier,
          trackingId: trackingId !== undefined ? trackingId : currentTracking.trackingId,
          estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : currentTracking.estimatedDelivery,
          logs
        };
      }

      order.updatedAt = new Date().toISOString();
      orders[orderIndex] = order;
      fallbackDb.saveCollection('orders', orders);

      // Audit Log Fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Order ${id} Updated (Fallback) (Status: ${status || 'N/A'}, Tracking: ${trackingId || 'N/A'})`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS'
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      updatedOrder = order;
    }

    // Trigger WhatsApp notification for CANCELLED or RETURNED status change
    if (status === 'CANCELLED' && updatedOrder) {
      try {
        sendOrderCancellationWhatsAppNotifications(
          updatedOrder,
          updatedOrder.cancelReason || 'Cancelled by Atelier Administrator',
          'all'
        ).catch(e => console.warn('Admin WhatsApp cancel error:', e));
      } catch {}
    } else if (status === 'RETURNED' && updatedOrder) {
      try {
        sendOrderExchangeWhatsAppNotifications(
          updatedOrder,
          updatedOrder.returnReason || 'Exchange/Return processed by Atelier Administrator',
          'all'
        ).catch(e => console.warn('Admin WhatsApp return/exchange error:', e));
      } catch {}
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (err: any) {
    console.error('Order PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update order' },
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

    try {
      await prisma.order.delete({
        where: { id },
      });

      // Security Audit Log
      try {
        await prisma.securityLog.create({
          data: {
            action: `Order Deleted: ${id}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            device: req.headers.get('user-agent') || 'Unknown Browser',
          }
        });
      } catch (secErr) {
        console.warn('Security log write failed:', secErr);
      }
    } catch (dbError) {
      console.warn('⚠️ Database order delete failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const orders = fallbackDb.getCollection('orders');
      const filtered = orders.filter((o: any) => o.id !== id);
      fallbackDb.saveCollection('orders', filtered);

      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Order ${id} Deleted (Fallback)`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS'
      });
      fallbackDb.saveCollection('securityLogs', secLogs);
    }

    return NextResponse.json({ success: true, message: `Order ${id} deleted successfully` });
  } catch (err: any) {
    console.error('Order DELETE error:', err);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

