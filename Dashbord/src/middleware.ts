import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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

// Pages and APIs that require SUPER_ADMIN role
const SUPER_ADMIN_ROUTES = [
  '/analytics',
  '/cms',
  '/gallery',
  '/marketing',
  '/administration',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass public files, login API, logout API, PWA assets, and Next.js internal assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/logo.png' ||
    pathname === '/icon.png' ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next();
  }

  // 2. Fetch the session token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 3. Guards for Login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, getJwtSecret());
        // If already logged in, redirect to overview
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Token is invalid, let them log in again (clear token cookie)
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    return NextResponse.next();
  }

  // 4. Guarantees for all other pages & APIs
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userRole = payload.role as string;

    // 5. Role validation for SUPER_ADMIN restricted sections
    const isSuperAdminRoute = SUPER_ADMIN_ROUTES.some(route => 
      pathname.startsWith(route) || pathname.startsWith(`/api${route}`)
    );

    if (isSuperAdminRoute && userRole !== 'SUPER_ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Set request headers for downstream server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-role', userRole);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Middleware token validation failed:', error);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|logo.png|icon.png|icons).*)',
  ],
};
