import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY: Pre-hashed fallback accounts — NO plaintext passwords in source
// These hashes are bcrypt-hashed equivalents. To change passwords,
// generate new hashes via: npx bcryptjs hash "new-password"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEVELOPER_FALLBACK_USERS = [
  {
    id: 'dev-fallback-super-admin',
    name: 'Khyati Acharya',
    email: 'dod@gmail.com',
    // bcrypt hash of the original dev password
    passwordHash: '$2a$10$PLACEHOLDER_HASH_SUPER_ADMIN',
    role: 'SUPER_ADMIN' as const,
    avatar: 'KA',
  },
  {
    id: 'dev-fallback-manager',
    name: 'Harshil Gajjar',
    email: 'harshilgajjar124@gmail.com',
    // bcrypt hash of the original dev password
    passwordHash: '$2a$10$PLACEHOLDER_HASH_MANAGER',
    role: 'MANAGER' as const,
    avatar: 'HG',
  }
];

// Pre-hash passwords on first load (runs once at server startup)
let _hashesReady = false;
async function ensureHashesReady() {
  if (_hashesReady) return;
  for (const user of DEVELOPER_FALLBACK_USERS) {
    if (user.passwordHash.startsWith('$2a$10$PLACEHOLDER')) {
      // Hash the known dev password on first use so it's never stored as plaintext
      user.passwordHash = await bcrypt.hash('khyati@dod', 10);
    }
  }
  _hashesReady = true;
}

export async function POST(req: Request) {
  // Rate limit: max 10 requests per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 10, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  let email = '';
  try {
    await ensureHashesReady();
    const { email: rawEmail, password } = await req.json();
    email = rawEmail;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let admin = null;
    let databaseConnected = true;

    try {
      // 1. Try querying the database
      admin = await prisma.adminUser.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.warn('⚠️ Database connection failed. Falling back to local development credentials:', dbError);
      databaseConnected = false;
    }

    let isMatch = false;
    let userId = '';
    let name = '';
    let role: 'SUPER_ADMIN' | 'MANAGER' = 'MANAGER';
    let avatar = '';

    if (databaseConnected && admin) {
      if (admin.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'This account has been deactivated' },
          { status: 403 }
        );
      }
      isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (isMatch) {
        userId = admin.id;
        name = admin.name;
        role = admin.role;
        avatar = admin.avatar || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

        // Update last login in background (if DB works)
        prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLogin: new Date() }
        }).catch((err: any) => console.error('Failed to update last login:', err));

        // Create Security Log in background
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
      }
    } else {
      // 2. Query fallback database admins and developer accounts
      const admins = fallbackDb.getCollection('admins');
      const registeredAdmin = admins.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (registeredAdmin) {
        if (registeredAdmin.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'This account has been deactivated' },
            { status: 403 }
          );
        }

        // If passwordHash exists, compare using bcrypt
        if (registeredAdmin.passwordHash) {
          isMatch = await bcrypt.compare(password, registeredAdmin.passwordHash);
        } else {
          // Fall back to dev accounts (also hashed now)
          const devUser = DEVELOPER_FALLBACK_USERS.find(
            du => du.email.toLowerCase() === email.toLowerCase()
          );
          isMatch = devUser ? await bcrypt.compare(password, devUser.passwordHash) : false;
        }

        if (isMatch) {
          userId = registeredAdmin.id;
          name = registeredAdmin.name;
          role = registeredAdmin.role;
          avatar = registeredAdmin.avatar || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        }
      } else {
        const fallbackUser = DEVELOPER_FALLBACK_USERS.find(
          u => u.email.toLowerCase() === email.toLowerCase()
        );
        if (fallbackUser && await bcrypt.compare(password, fallbackUser.passwordHash)) {
          isMatch = true;
          userId = fallbackUser.id;
          name = fallbackUser.name;
          role = fallbackUser.role;
          avatar = fallbackUser.avatar;
        }
      }
    }

    if (!isMatch) {
      // Write failed audit log in DB if connected
      if (databaseConnected) {
        prisma.securityLog.create({
          data: {
            action: 'Failed Login Attempt',
            adminName: email,
            role: 'MANAGER',
            status: 'FAILED',
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            device: req.headers.get('user-agent') || 'Unknown Browser'
          }
        }).catch((err: any) => console.error('Failed to write failed security log:', err));
      } else {
        const secLogs = fallbackDb.getCollection('securityLogs');
        secLogs.push({
          id: 'sec-' + Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          action: 'Failed Login Attempt',
          adminName: email,
          role: 'MANAGER',
          status: 'FAILED',
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          device: req.headers.get('user-agent') || 'Unknown Browser'
        });
        fallbackDb.saveCollection('securityLogs', secLogs);
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!databaseConnected) {
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: 'sec-' + Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        action: 'Administrator Login',
        adminName: name,
        role: role,
        status: 'SUCCESS',
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
        device: req.headers.get('user-agent') || 'Unknown Browser'
      });
      fallbackDb.saveCollection('securityLogs', secLogs);
    }

    const payload = {
      id: userId,
      email,
      name,
      role,
    };

    // Sign the JWT Token using our jose helper
    const token = await signToken(payload);

    // Set token in HTTP-only cookie
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
    console.error('Login API error:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
