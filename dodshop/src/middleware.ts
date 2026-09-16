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

const COOKIE_NAME = 'dod-customer-token';

const PROTECTED_ROUTES = [
  '/profile',
  '/order',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass public files, sitemaps, robots, favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/~offline'
  ) {
    return NextResponse.next();
  }

  // 2. Fetch the customer session token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 3. Guards for Login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, getJwtSecret());
        // If already logged in, redirect to profile
        return NextResponse.redirect(new URL('/profile', request.url));
      } catch {
        // Token is invalid, let them log in again (clear token cookie)
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    return NextResponse.next();
  }

  // 4. Guards for protected customer pages
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());

      // Allow access, pass down user details in headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-customer-id', payload.id as string);
      requestHeaders.set('x-customer-email', payload.email as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('Customer middleware token validation failed:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
