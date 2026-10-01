// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Storefront JWT Customer Authentication Helpers — Hardened
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

const COOKIE_NAME = 'dod-customer-token';

export interface CustomerTokenPayload extends JWTPayload {
  id: string;
  email: string;
  name: string;
}

/**
 * Sign a JWT token for a customer
 */
export async function signToken(payload: Omit<CustomerTokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

/**
 * Verify and decode a customer JWT token
 */
export async function verifyToken(token: string): Promise<CustomerTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    return payload as CustomerTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Set the customer auth cookie with signed JWT
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
 * Remove the customer auth cookie (logout)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the current customer session from cookies
 */
export async function getSession(): Promise<CustomerTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Resolves the verified customer identity from an authenticated session cookie
 * or valid Authorization: Bearer token.
 * 
 * SECURITY GUARANTEE: Never trusts client-supplied query/body identity or fallback IDs.
 * Returns the verified customer ID and session payload, or null if unauthenticated.
 */
export async function resolveCustomer(
  req?: Request,
  _legacyFallbackIgnored?: any
): Promise<{
  userId: string;
  session: CustomerTokenPayload;
} | null> {
  // 1. Check HTTP-only cookie session
  try {
    const session = await getSession();
    if (session?.id) {
      return { userId: session.id, session };
    }
  } catch {}

  // 2. Check Authorization Bearer header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.slice(7).trim();
      const verified = await verifyToken(bearerToken);
      if (verified?.id) {
        return { userId: verified.id, session: verified };
      }
    }
  }

  return null;
}

/**
 * Requires an authenticated customer session.
 * Returns { customer, response: null } on success, or { customer: null, response: 401 NextResponse } on failure.
 */
export async function requireAuthenticatedCustomer(req?: Request): Promise<{
  customer: { userId: string; session: CustomerTokenPayload } | null;
  response: NextResponse | null;
}> {
  const customer = await resolveCustomer(req);
  if (!customer) {
    return {
      customer: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { customer, response: null };
}

/**
 * Verify customer session for API routes.
 * Returns either { session, response: null } or { session: null, response: NextResponse }
 */
export async function verifyCustomerSession(): Promise<{
  session: CustomerTokenPayload | null;
  response: NextResponse | null;
}> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Valid customer session required' },
        { status: 401 }
      )
    };
  }

  return { session, response: null };
}
