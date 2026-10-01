import { NextResponse } from 'next/server';
import { prisma, fallbackDb, generateInvoicePdfBuffer, generateInvoiceFileName } from '@dod/database';
import { resolveCustomer } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await resolveCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to download invoices' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Valid Order ID required' }, { status: 400 });
    }

    let order: any = null;
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
    } catch (dbErr) {
      console.warn('⚠️ Order query failed via Prisma for invoice, checking fallback DB:', dbErr);
    }

    if (!order) {
      const orders = fallbackDb.getCollection('orders');
      order = orders.find((o: any) => o.id === id);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Server-Side Authorization: Verify that the authenticated customer actually owns this order
    if (order.customerId !== customer.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this invoice' },
        { status: 403 }
      );
    }

    const pdfBuffer = await generateInvoicePdfBuffer(order);
    const filename = generateInvoiceFileName(order);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        // Invoices contain sensitive PII (name, phone, full address); MUST be private and never cached publicly
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Failed to generate/serve invoice PDF:', err);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
