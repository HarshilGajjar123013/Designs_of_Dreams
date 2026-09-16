// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// In-Memory Sliding Window Rate Limiter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit check. Returns null if allowed, or a 429 NextResponse if rate limited.
 * 
 * @param identifier - Unique identifier (e.g., IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  const now = Date.now();
  cleanup(windowMs);

  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(identifier, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const retryAfterMs = entry.timestamps[0] + windowMs - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }

  entry.timestamps.push(now);
  return null; // Allowed
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         '127.0.0.1';
}
