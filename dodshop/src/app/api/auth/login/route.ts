import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, fallbackDb } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 10 requests per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 10, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let customer: any = null;
    let databaseConnected = true;

    try {
      // 1. Try querying the database
      customer = await prisma.customer.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.warn('⚠️ Login DB query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const avatar = customer.avatar || customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

    // Sign and set auth cookie
    const token = await signToken({
      id: customer.id,
      email: customer.email,
      name: customer.name
    });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone || '',
        avatar: avatar,
        isLoggedIn: true
      }
    });

  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Failed to complete login' },
      { status: 500 }
    );
  }
}
