import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

const VALID_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    let updatedRequest: any = null;

    try {
      updatedRequest = await (prisma as any).customizationRequest.update({
        where: { id },
        data: { status },
        include: {
          product: { select: { id: true, name: true, sku: true, images: true } }
        }
      });
    } catch (dbErr) {
      const requests = fallbackDb.getCollection('customizationRequests');
      const idx = requests.findIndex((r: any) => r.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Customization request not found' }, { status: 404 });
      }

      requests[idx] = {
        ...requests[idx],
        status,
        updatedAt: new Date().toISOString()
      };
      fallbackDb.saveCollection('customizationRequests', requests);

      const products = fallbackDb.getCollection('products');
      const prod = products.find((p: any) => p.id === requests[idx].productId);
      updatedRequest = {
        ...requests[idx],
        product: prod ? { id: prod.id, name: prod.name, sku: prod.sku, images: prod.images } : null
      };
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (err: any) {
    console.error('Customization PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update customization request' }, { status: 500 });
  }
}
