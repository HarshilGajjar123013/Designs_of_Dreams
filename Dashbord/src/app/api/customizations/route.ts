import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    let requests: any[] = [];
    try {
      if (productId) {
        requests = await (prisma as any).customizationRequest.findMany({
          where: { productId },
          orderBy: { createdAt: 'desc' },
          include: {
            product: { select: { id: true, name: true, sku: true, images: true } }
          }
        });
      } else {
        requests = await (prisma as any).customizationRequest.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
          include: {
            product: { select: { id: true, name: true, sku: true, images: true } }
          }
        });
      }
    } catch (dbErr) {
      const allRequests = fallbackDb.getCollection('customizationRequests');
      const products = fallbackDb.getCollection('products');
      requests = (productId
        ? allRequests.filter((r: any) => r.productId === productId)
        : allRequests).map((r: any) => {
          const prod = products.find((p: any) => p.id === r.productId);
          return {
            ...r,
            product: prod ? { id: prod.id, name: prod.name, sku: prod.sku, images: prod.images } : null
          };
        });
    }

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (err: any) {
    console.error('Dashbord Customizations GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve customization requests.' },
      { status: 500 }
    );
  }
}
