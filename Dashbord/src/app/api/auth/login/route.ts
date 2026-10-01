import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 10 requests per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 10, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { email: rawEmail, password } = await req.json();
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!email || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let admin = null;

    try {
      // 1. Authoritative Database Query
      admin = await prisma.adminUser.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error('CRITICAL: Database connection error during admin login attempt:', dbError);
      // FAIL CLOSED: Never authenticate users or grant access when the database is unavailable
      return NextResponse.json(
        { error: 'Authentication service temporarily unavailable' },
        { status: 503 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This account has been deactivated' },
        { status: 403 }
      );
    }

    // 2. Constant-time Bcrypt Password Comparison
    const isMatch = admin.passwordHash ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!isMatch) {
      // Record failed audit log in database
      prisma.securityLog.create({
        data: {
          action: 'Failed Login Attempt',
          adminName: email,
          role: 'MANAGER',
          status: 'FAILED',
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          device: req.headers.get('user-agent') || 'Unknown Browser'
        }
      }).catch((err: any) => console.error('Failed to write security log:', err));

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = admin.id;
    const name = admin.name;
    const role = admin.role;
    const avatar = admin.avatar || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    // 3. Update Last Login Timestamp
    prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    }).catch((err: any) => console.error('Failed to update last login:', err));

    // 4. Record Successful Login in Audit Log
    prisma.securityLog.create({
      data: {
        action: 'Administrator Login',
        adminName: admin.name,
        role: admin.role,
        status: 'SUCCESS',
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
        device: req.headers.get('user-agent') || 'Unknown Browser'
      }
    }).catch((err: any) => console.error('Failed to write security log:', err));

    // 5. Sign Cryptographically Verified JWT (HS256)
    const payload = {
      id: userId,
      email,
      name,
      role,
    };

    const token = await signToken(payload);

    // 6. Set HTTP-Only, Secure, SameSite Cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role,
        avatar
      }
    });

  } catch (err: any) {
    console.error('Unhandled admin login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
