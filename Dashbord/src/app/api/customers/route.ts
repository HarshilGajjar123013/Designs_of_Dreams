import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

const validOrder = (order: any) => !['CANCELLED', 'RETURNED', 'REFUNDED'].includes(String(order.status).toUpperCase());
const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'P';

function formatCustomer(customer: any, orders: any[] = [], productMap: Map<string, any> = new Map()) {
  const customerOrders = orders.filter(order =>
    order.customerId === customer.id ||
    (customer.email && String(order.customerEmail || '').toLowerCase() === String(customer.email).toLowerCase())
  );
  const validOrders = customerOrders.filter(validOrder);
  const addresses = customer.addresses || [];
  return {
    ...customer,
    email: customer.email || '',
    phone: customer.phone || '',
    alternatePhone: customer.alternatePhone || '',
    avatar: customer.avatar || initials(customer.name || 'Patron'),
    customerType: String(customer.customerType || 'NEW').toLowerCase(),
    joinedDate: customer.joinedDate instanceof Date ? customer.joinedDate.toISOString().slice(0, 10) : String(customer.joinedDate || '').slice(0, 10),
    totalOrders: validOrders.length,
    totalSpent: validOrders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0),
    notes: customer.notes || '',
    wishlist: customer.wishlistItems?.map((item: any) => {
      const p = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: p?.name || 'Artisanal Piece',
        price: p?.sellingPrice || 0,
        image: p?.images?.[0] || ''
      };
    }) || customer.wishlist || [],
    cart: customer.cartItems?.map((item: any) => {
      const p = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: p?.name || 'Artisanal Piece',
        price: p?.sellingPrice || 0,
        quantity: item.quantity || 1,
        image: p?.images?.[0] || ''
      };
    }) || customer.cart || [],
    addresses: addresses.map((address: any) => address.address ? address : {
      type: address.label || 'Home',
      address: [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')
    }),
  };
}

function formatOldCustomer(customer: any) {
  const formatted = formatCustomer({
    ...customer,
    customerType: 'OLD',
    avatar: initials(customer.name || 'Patron'),
    wishlist: [],
    cart: [],
    addresses: customer.address ? [{ type: 'Home', address: [customer.address, customer.city, customer.state, customer.pincode, customer.country].filter(Boolean).join(', ') }] : [],
  });
  return {
    ...formatted,
    totalOrders: Math.max(0, Math.trunc(Number(customer.purchaseCount) || 0)),
    totalSpent: Math.max(0, Number(customer.lifetimeValue) || 0),
  };
}

export async function GET() {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    try {
      const [records, oldRecords, products, allOrders] = await Promise.all([
        (prisma as any).customer.findMany({
          include: {
            orders: true,
            addresses: true,
            cartItems: true,
            wishlistItems: true,
          },
          orderBy: { joinedDate: 'desc' },
        }),
        (prisma as any).oldCustomer?.findMany({ orderBy: { joinedDate: 'desc' } }).catch(() => []) || [],
        (prisma as any).product.findMany({
          select: { id: true, name: true, sellingPrice: true, images: true },
        }).catch(() => []),
        (prisma as any).order.findMany({
          select: { id: true, customerId: true, customerName: true, customerEmail: true, grandTotal: true, status: true, shippingAddress: true, createdAt: true },
        }).catch(() => []),
      ]);

      const productMap = new Map<string, any>((products || []).map((p: any) => [p.id, p]));
      const databaseCustomers = records.map((customer: any) => formatCustomer(customer, allOrders, productMap));
      const oldCustomers = (oldRecords || []).map(formatOldCustomer);

      // Synthesize any storefront orders placed by patrons without an explicit Customer account
      const existingEmails = new Set(databaseCustomers.map((c: any) => (c.email || '').toLowerCase()).filter(Boolean));
      const guestCustomers: any[] = [];
      for (const order of (allOrders || [])) {
        const email = (order.customerEmail || '').toLowerCase();
        if (email && !existingEmails.has(email)) {
          existingEmails.add(email);
          const guestOrders = allOrders.filter((o: any) => (o.customerEmail || '').toLowerCase() === email && validOrder(o));
          guestCustomers.push({
            id: `guest-${order.id}`,
            name: order.customerName || 'Guest Patron',
            email: order.customerEmail || '',
            phone: order.shippingAddress?.phone || '',
            alternatePhone: '',
            avatar: initials(order.customerName || 'Guest Patron'),
            customerType: 'new',
            joinedDate: order.createdAt instanceof Date ? order.createdAt.toISOString().slice(0, 10) : String(order.createdAt || '').slice(0, 10),
            totalOrders: guestOrders.length,
            totalSpent: guestOrders.reduce((sum: number, o: any) => sum + Number(o.grandTotal || 0), 0),
            notes: 'Storefront Patron',
            wishlist: [],
            cart: [],
            addresses: order.shippingAddress ? [{
              type: 'Delivery',
              address: [order.shippingAddress.line1, order.shippingAddress.line2, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode, order.shippingAddress.country].filter(Boolean).join(', ')
            }] : [],
          });
        }
      }

      const fallbackOldCustomers = fallbackDb.getCollection('customers')
        .filter((customer: any) => String(customer.customerType || '').toUpperCase() === 'OLD' && !databaseCustomers.some((dbCustomer: any) => dbCustomer.id === customer.id))
        .map(formatOldCustomer);

      const allCombined = [
        ...databaseCustomers,
        ...guestCustomers,
        ...oldCustomers,
        ...fallbackOldCustomers.filter((customer: any) => !oldCustomers.some((oldCustomer: any) => oldCustomer.id === customer.id))
      ].sort((a, b) => String(b.joinedDate || '').localeCompare(String(a.joinedDate || '')));

      return NextResponse.json({
        success: true,
        customers: allCombined
      });
    } catch (databaseError) {
      console.warn('⚠️ Database customer query failed. Falling back to local JSON database:', databaseError);
      const orders = fallbackDb.getCollection('orders');
      return NextResponse.json({
        success: true,
        customers: fallbackDb.getCollection('customers').map((customer: any) => formatCustomer(customer, orders))
      });
    }
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve customer records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;
    const body = await req.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim().toLowerCase() || null;
    const joinedDate = body.joinedDate ? new Date(body.joinedDate) : null;
    if (!name || !phone || !joinedDate || Number.isNaN(joinedDate.getTime())) return NextResponse.json({ error: 'Full name, phone number, and customer-since date are required.' }, { status: 400 });
    const purchaseCount = Math.max(0, Math.trunc(Number(body.purchaseCount) || 0));
    const lifetimeValue = Math.max(0, Number(body.lifetimeValue) || 0);
    const candidate = { name, email, phone, alternatePhone: String(body.alternatePhone || '').trim() || null, notes: String(body.notes || '').trim() || null, joinedDate, purchaseCount, lifetimeValue };
    try {
      const [duplicate, oldDuplicate] = await Promise.all([
        (prisma as any).customer.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] } }),
        (prisma as any).oldCustomer.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] } }),
      ]);
      const existing = duplicate || oldDuplicate;
      if (existing && !body.force) return NextResponse.json({ success: false, duplicate: oldDuplicate ? formatOldCustomer(oldDuplicate) : formatCustomer(duplicate), message: 'This customer may already exist.' }, { status: 409 });
      if (duplicate && email && duplicate.email?.toLowerCase() === email) return NextResponse.json({ error: 'A storefront customer already uses this email. Use the existing customer instead.' }, { status: 409 });
      const customer = await (prisma as any).oldCustomer.create({ data: { ...candidate, address: String(body.address || '').trim() || null, city: String(body.city || '').trim() || null, state: String(body.state || '').trim() || null, country: String(body.country || 'India').trim() || 'India', pincode: String(body.pincode || '').trim() || null } });
      return NextResponse.json({ success: true, customer: formatOldCustomer(customer) }, { status: 201 });
    } catch {
      const customers = fallbackDb.getCollection('customers');
      const duplicate = customers.find((customer: any) => customer.phone === phone || (email && customer.email?.toLowerCase() === email));
      if (duplicate && !body.force) return NextResponse.json({ success: false, duplicate: formatCustomer(duplicate, fallbackDb.getCollection('orders')), message: 'This customer may already exist.' }, { status: 409 });
      if (duplicate && email && duplicate.email?.toLowerCase() === email) return NextResponse.json({ error: 'A customer with this email already exists. Use the existing customer instead.' }, { status: 409 });
      const customer = { id: `old-${randomUUID()}`, ...candidate, customerType: 'OLD', avatar: initials(name), joinedDate: joinedDate.toISOString(), addresses: body.address ? [{ type: 'Home', address: [body.address, body.city, body.state, body.pincode, body.country || 'India'].filter(Boolean).join(', ') }] : [], wishlist: [], cart: [] };
      customers.push(customer); fallbackDb.saveCollection('customers', customers);
      return NextResponse.json({ success: true, customer: formatOldCustomer(customer) }, { status: 201 });
    }
  } catch (error) {
    console.error('Customer POST error:', error);
    return NextResponse.json({ error: 'Failed to create old customer' }, { status: 500 });
  }
}
