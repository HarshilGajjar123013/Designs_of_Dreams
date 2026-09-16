import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, fallbackDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 5 signup attempts per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 5, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { firstName, lastName, email, mobileNumber, password } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

    let databaseConnected = true;
    let newCustomer: any = null;

    try {
      // 1. Try DB read to check if user already exists
      const existing = await prisma.customer.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Try DB Write
      newCustomer = await prisma.customer.create({
        data: {
          name: fullName,
          email,
          passwordHash,
          phone: mobileNumber || null,
          avatar: avatar,
          isVerified: true, // Default to true as per UI mockup
          customerType: 'NEW',
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Signup DB write failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Local Fallback DB Write
      const customers = fallbackDb.getCollection('customers');

      // Check if email already exists in fallback
      const existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      const custId = 'cust-' + randomUUID();
      newCustomer = {
        id: custId,
        name: fullName,
        email,
        passwordHash, // Store hash in fallback too for verification on login
        phone: mobileNumber || null,
        avatar: avatar,
        notes: '',
        customerType: 'NEW',
        isVerified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        wishlist: [],
        cart: [],
        addresses: [],
      };

      customers.push(newCustomer);
      fallbackDb.saveCollection('customers', customers);
    }

    // Sign and set auth cookie
    const token = await signToken({
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name
    });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        phone: newCustomer.phone || '',
        avatar: newCustomer.avatar || avatar,
        isLoggedIn: true
      }
    });

  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}
