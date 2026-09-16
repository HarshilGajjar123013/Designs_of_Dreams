import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { inventoryAdjustSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const userRole = session!.role;
    const userId = session!.id;

    const body = await req.json();
    const validation = inventoryAdjustSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { productId, change, reason } = validation.data;

    let databaseConnected = true;
    let updatedProduct = null;

    try {
      updatedProduct = await prisma.$transaction(async (tx: any) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, sku: true, stock: true }
        });

        if (!product) {
          throw new Error('NOT_FOUND');
        }

        const newStock = product.stock + change;
        if (newStock < 0) {
          throw new Error('INVALID_STOCK');
        }

        const updated = await tx.product.update({
          where: { id: productId },
          data: { stock: newStock }
        });

        // Log stock change
        await tx.inventoryLog.create({
          data: {
            productId,
            productName: product.name,
            sku: product.sku,
            change,
            type: 'MANUAL_ADJUST',
            user: `Admin ID: ${userId} (${reason})`,
          }
        });

        // Log security action
        await tx.securityLog.create({
          data: {
            action: `Inventory Adjusted: ${product.name} SKU: ${product.sku} (${change > 0 ? '+' : ''}${change} units)`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return updated;
      });

    } catch (dbError: any) {
      if (dbError.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      if (dbError.message === 'INVALID_STOCK') {
        return NextResponse.json({ error: 'Insufficient stock levels. Stock cannot go below zero.' }, { status: 400 });
      }
      console.warn('⚠️ Database write failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const products = fallbackDb.getCollection('products');
      const idx = products.findIndex(p => p.id === productId);
      if (idx === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const product = products[idx];
      const newStock = product.stock + change;
      if (newStock < 0) {
        return NextResponse.json({ error: 'Insufficient stock levels. Stock cannot go below zero.' }, { status: 400 });
      }

      product.stock = newStock;
      product.updatedAt = new Date().toISOString();
      products[idx] = product;
      fallbackDb.saveCollection('products', products);

      // Create log in fallback
      const invLogs = fallbackDb.getCollection('inventoryLogs');
      invLogs.push({
        id: randomUUID(),
        productId,
        productName: product.name,
        sku: product.sku,
        change,
        type: 'MANUAL_ADJUST',
        timestamp: new Date().toISOString(),
        user: `Admin ID: ${userId} (${reason})`,
      });
      fallbackDb.saveCollection('inventoryLogs', invLogs);

      // Security Log in fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Inventory Adjusted (Fallback): ${product.name} SKU: ${product.sku} (${change > 0 ? '+' : ''}${change} units)`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      updatedProduct = product;
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct
    });

  } catch (err: any) {
    console.error('Inventory adjust POST error:', err);
    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
