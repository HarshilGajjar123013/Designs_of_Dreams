import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    let customer: any = null;
    let databaseConnected = true;

    try {
      customer = await prisma.customer.findUnique({
        where: { id: session.id },
      });
    } catch {
      databaseConnected = false;
    }

    if (!databaseConnected || !customer) {
      const customers = fallbackDb.getCollection('customers');
      customer = customers.find(c => c.id === session.id || c.email?.toLowerCase() === session.email?.toLowerCase());
    }

    if (!customer) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const avatar = customer.avatar || customer.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

    return NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone || '',
        avatar: avatar,
        isLoggedIn: true,
      },
    });
  } catch (err: any) {
    console.error('Session verification error:', err);
    return NextResponse.json({ success: false, user: null }, { status: 200 });
  }
}
