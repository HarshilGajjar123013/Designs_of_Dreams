import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@dod/database';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, 
      email,
      phone, 
      address, 
      city, 
      state = '',
      pincode, 
      paymentMethod, 
      cart, 
      customerEmail = 'guest@luxury.in', 
      customerId = 'cust-1' 
    } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderId = 'DOD-' + Math.floor(100000 + Math.random() * 900000);

    const subtotal = cart.reduce((acc: number, item: any) => acc + item.product.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
    const grandTotal = subtotal + tax + shipping;

    const shippingAddress = {
      line1: address,
      line2: '',
      city,
      state, 
      postalCode: pincode,
      country: 'India',
      phone,
    };

    let databaseConnected = true;
    let newOrder = null;

    try {
      // 1. Try DB Write
      newOrder = await prisma.$transaction(async (tx: any) => {
        // Create Order
        const order = await tx.order.create({
          data: {
            id: orderId,
            customerId,
            customerName: fullName,
            customerEmail,
            totalAmount: subtotal,
            discountAmount: 0,
            gstAmount: tax,
            shippingAmount: shipping,
            grandTotal,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            paymentMethod: paymentMethod === 'COD' ? 'COD' : paymentMethod === 'UPI' ? 'UPI' : 'CREDIT_CARD',
            shippingAddress,
            trackingDetails: {
              carrier: 'DHL Express Luxury Cargo',
              trackingId: `DHL-${orderId}`,
              estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              logs: [{ status: 'Order accepted at Atelier', timestamp: new Date().toISOString(), location: 'Atelier Head Office' }]
            },
            items: {
              create: cart.map((item: any) => ({
                productId: item.product.id,
                name: item.product.title,
                sku: item.product.sku || `DOD-SKU-${item.product.id}`,
                price: item.product.price,
                quantity: item.quantity,
                size: item.size,
                color: item.product.colors?.[0] || '#C5A059',
                image: item.product.image
              }))
            }
          }
        });

        // Update Stock & Create Inventory Logs
        for (const item of cart) {
          await tx.product.update({
            where: { id: item.product.id },
            data: { stock: { decrement: item.quantity } }
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.product.id,
              productName: item.product.title,
              sku: item.product.sku || `DOD-SKU-${item.product.id}`,
              change: -item.quantity,
              type: 'SALE',
              user: `${fullName} (Customer)`
            }
          });
        }

        return order;
      });
    } catch (dbError) {
      console.warn('⚠️ Checkout DB transaction failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Local Fallback DB Write
      const orders = fallbackDb.getCollection('orders');
      const products = fallbackDb.getCollection('products');
      const invLogs = fallbackDb.getCollection('inventoryLogs');

      const items = cart.map((item: any) => ({
        id: randomUUID(),
        orderId,
        productId: item.product.id,
        name: item.product.title,
        sku: item.product.sku || `DOD-SKU-${item.product.id}`,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.product.colors?.[0] || '#C5A059',
        image: item.product.image
      }));

      const orderObj = {
        id: orderId,
        customerId,
        customerName: fullName,
        customerEmail,
        totalAmount: subtotal,
        discountAmount: 0,
        gstAmount: tax,
        shippingAmount: shipping,
        grandTotal,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: paymentMethod === 'COD' ? 'COD' : paymentMethod === 'UPI' ? 'UPI' : 'CREDIT_CARD',
        shippingAddress,
        trackingDetails: {
          carrier: 'DHL Express Luxury Cargo',
          trackingId: `DHL-${orderId}`,
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          logs: [{ status: 'Order accepted at Atelier', timestamp: new Date().toISOString(), location: 'Atelier Head Office' }]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items
      };

      orders.push(orderObj);
      fallbackDb.saveCollection('orders', orders);

      // Update Stock & Inventory Logs in fallback
      for (const item of cart) {
        const prod = products.find(p => p.id === item.product.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }

        invLogs.push({
          id: randomUUID(),
          productId: item.product.id,
          productName: item.product.title,
          sku: item.product.sku || `DOD-SKU-${item.product.id}`,
          change: -item.quantity,
          type: 'SALE',
          timestamp: new Date().toISOString(),
          user: `${fullName} (Customer)`
        });
      }

      fallbackDb.saveCollection('products', products);
      fallbackDb.saveCollection('inventoryLogs', invLogs);

      newOrder = orderObj;
    }

    return NextResponse.json({ success: true, orderId });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
