import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

const editableFields = ['name', 'email', 'phone', 'alternatePhone', 'notes', 'joinedDate', 'purchaseCount', 'lifetimeValue'] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;
    const { id } = await params;
    const body = await req.json();
    const update = Object.fromEntries(editableFields.filter(key => key in body).map(key => [key,
      key === 'email' ? (String(body[key] || '').trim().toLowerCase() || null)
        : key === 'joinedDate' ? new Date(body[key])
          : key === 'purchaseCount' ? Math.max(0, Math.trunc(Number(body[key]) || 0))
            : key === 'lifetimeValue' ? Math.max(0, Number(body[key]) || 0)
              : body[key]
    ]));
    if ('customerType' in body) delete update.customerType;
    try {
      const existing = await (prisma as any).oldCustomer.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'Old customer not found' }, { status: 404 });
      const customer = await (prisma as any).oldCustomer.update({ where: { id }, data: { ...update, address: String(body.address || '').trim() || null, city: String(body.city || '').trim() || null, state: String(body.state || '').trim() || null, country: String(body.country || 'India').trim() || 'India', pincode: String(body.pincode || '').trim() || null } });
      return NextResponse.json({ success: true, customer: { ...customer, customerType: 'old', totalOrders: customer.purchaseCount, totalSpent: customer.lifetimeValue, wishlist: [], cart: [], addresses: customer.address ? [{ type: 'Home', address: [customer.address, customer.city, customer.state, customer.pincode, customer.country].filter(Boolean).join(', ') }] : [] } });
    } catch {
      const customers = fallbackDb.getCollection('customers');
      const index = customers.findIndex((customer: any) => customer.id === id);
      if (index < 0) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      if (String(customers[index].customerType || 'NEW').toUpperCase() !== 'OLD' && Object.keys(update).some(key => key !== 'notes')) return NextResponse.json({ error: 'Only old customers can have their historical records edited.' }, { status: 403 });
      customers[index] = { ...customers[index], ...update, joinedDate: update.joinedDate ? new Date(update.joinedDate).toISOString() : customers[index].joinedDate, ...(body.address ? { addresses: [{ type: 'Home', address: [body.address, body.city, body.state, body.pincode, body.country || 'India'].filter(Boolean).join(', ') }] } : {}) };
      fallbackDb.saveCollection('customers', customers);
      return NextResponse.json({ success: true, customer: { ...customers[index], totalOrders: Number(customers[index].purchaseCount) || 0, totalSpent: Number(customers[index].lifetimeValue) || 0 } });
    }
  } catch (error) {
    console.error('Customer PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;
    const { id } = await params;
    try {
      const customer = await (prisma as any).oldCustomer.findUnique({ where: { id } });
      if (!customer) return NextResponse.json({ error: 'Old customer not found' }, { status: 404 });
      await (prisma as any).oldCustomer.delete({ where: { id } });
    } catch {
      const customers = fallbackDb.getCollection('customers');
      const customer = customers.find((entry: any) => entry.id === id);
      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      if (String(customer.customerType || 'NEW').toUpperCase() !== 'OLD') return NextResponse.json({ error: 'Only manually added old customers can be deleted.' }, { status: 403 });
      if (fallbackDb.getCollection('orders').some((order: any) => order.customerId === id)) return NextResponse.json({ error: 'This customer has orders and cannot be deleted.' }, { status: 409 });
      fallbackDb.saveCollection('customers', customers.filter((entry: any) => entry.id !== id));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
