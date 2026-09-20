import { NextResponse } from 'next/server';
import { prisma, fallbackDb, generateInvoicePdfBuffer, generateInvoiceFileName } from '@dod/database';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    let order: any = null;
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
    } catch {
      // Prisma error or disconnected
    }

    if (!order) {
      const orders = fallbackDb.getCollection('orders');
      order = orders.find((o: any) => o.id === id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const pdfBuffer = await generateInvoicePdfBuffer(order);
    const filename = generateInvoiceFileName(order);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Failed to generate/serve admin invoice PDF:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
