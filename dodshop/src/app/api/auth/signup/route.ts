import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, fallbackDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { generateRecoveryCode, hashRecoveryCode } from '@/lib/recoveryCode';

export async function POST(req: Request) {
  // Rate limit: max 5 signup attempts per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 5, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { firstName, lastName, email, mobileNumber, password } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanFirstName = typeof firstName === 'string' ? firstName.trim() : '';
    const cleanLastName = typeof lastName === 'string' ? lastName.trim() : '';
    const cleanPhone = typeof mobileNumber === 'string' ? mobileNumber.trim() : '';
    const fullName = `${cleanFirstName} ${cleanLastName}`.trim();

    if (!cleanEmail || !password || !cleanFirstName || !cleanLastName) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = fullName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P';

    // Generate high-entropy single-use backup recovery code
    const { rawCode, normalized } = generateRecoveryCode();
    const recoveryCodeHash = await hashRecoveryCode(normalized);

    let databaseConnected = true;
    let newCustomer: any = null;

    try {
      // 1. Try DB read to check if user already exists
      const existing = await prisma.customer.findFirst({
        where: {
          email: { equals: cleanEmail, mode: 'insensitive' }
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Check fallback collection to prevent duplicate accounts
      const customers = fallbackDb.getCollection('customers');
      const fallbackExisting = customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);
      if (fallbackExisting) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Try DB Write
      newCustomer = await prisma.customer.create({
        data: {
          name: fullName,
          email: cleanEmail,
          passwordHash,
          phone: cleanPhone || null,
          avatar: avatar,
          isVerified: true,
          customerType: 'NEW',
          recoveryCodeHash,
          recoveryCodeUsed: false,
          recoveryCodeCreatedAt: new Date(),
          recoveryAttempts: 0,
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Signup DB write failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected || !newCustomer) {
      // 2. Local Fallback DB Write
      const customers = fallbackDb.getCollection('customers');

      const existing = customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);
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
        email: cleanEmail,
        passwordHash,
        phone: cleanPhone || null,
        avatar: avatar,
        notes: '',
        customerType: 'NEW',
        isVerified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        recoveryCodeHash,
        recoveryCodeUsed: false,
        recoveryCodeCreatedAt: new Date().toISOString(),
        recoveryAttempts: 0,
        wishlist: [],
        cart: [],
        addresses: [],
      };

      customers.push(newCustomer);
      fallbackDb.saveCollection('customers', customers);
    } else {
      // Keep local fallbackDb synced with newly registered customer
      try {
        const customers = fallbackDb.getCollection('customers');
        const idx = customers.findIndex((c: any) => c.id === newCustomer.id || c.email?.toLowerCase() === cleanEmail);
        const fallbackRecord = {
          id: newCustomer.id,
          name: fullName,
          email: cleanEmail,
          passwordHash,
          phone: cleanPhone || null,
          avatar: avatar,
          notes: '',
          customerType: 'NEW',
          isVerified: true,
          joinedDate: new Date().toISOString().split('T')[0],
          recoveryCodeHash,
          recoveryCodeUsed: false,
          recoveryCodeCreatedAt: new Date().toISOString(),
          recoveryAttempts: 0,
          wishlist: [],
          cart: [],
          addresses: [],
        };
        if (idx !== -1) {
          customers[idx] = { ...customers[idx], ...fallbackRecord };
        } else {
          customers.push(fallbackRecord);
        }
        fallbackDb.saveCollection('customers', customers);
      } catch (mirrorErr) {
        console.warn('Non-fatal: could not mirror to fallback DB:', mirrorErr);
      }
    }

    // Sign and set auth cookie
    const token = await signToken({
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name
    });
    await setAuthCookie(token);

    // Return raw recovery code ONLY ONCE during initial registration response
    return NextResponse.json({
      success: true,
      recoveryCode: rawCode,
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
