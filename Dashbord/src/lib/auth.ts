// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JWT Authentication Helpers — Hardened Server-Side Auth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { AdminRole } from '@dod/database';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
    }
    return new TextEncoder().encode('dod-atelier-dev-fallback-secret-key-at-least-32-bytes-long');
  }
  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'dod-admin-token';

export interface AdminTokenPayload extends JWTPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

/**
 * Sign a JWT token for an admin user
 */
export async function signToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRY || '7d')
    .sign(getJwtSecret());
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as AdminTokenPayload;
  } catch {
    try {
      const legacySecret = new TextEncoder().encode('dod-atelier-fallback-secret-key-at-least-32-bytes-long');
      const { payload } = await jwtVerify(token, legacySecret);
      return payload as AdminTokenPayload;
    } catch {
      return null;
    }
  }
}

/**
 * Set the auth cookie with signed JWT
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Remove the auth cookie (logout)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the current admin session from cookies
 */
export async function getSession(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Verify admin session for API routes with optional role requirement.
 * Returns either { session, response: null } or { session: null, response: NextResponse }
 */
export async function verifyAdminSession(requiredRole?: AdminRole): Promise<{
  session: AdminTokenPayload | null;
  response: NextResponse | null;
}> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Valid admin session required' },
        { status: 401 }
      )
    };
  }

  if (requiredRole === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
    return {
      session: null,
      response: NextResponse.json(
        { error: 'Forbidden: Requires Super Administrator privileges' },
        { status: 403 }
      )
    };
  }

  return { session, response: null };
}

/**
 * Require admin authentication — throws redirect on failure
 */
export async function requireAuth(): Promise<AdminTokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

/**
 * Require SUPER_ADMIN role — throws on failure
 */
export async function requireSuperAdmin(): Promise<AdminTokenPayload> {
  const session = await requireAuth();
  if (session.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return session;
}
