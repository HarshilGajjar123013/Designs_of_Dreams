import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getJwtSecret } from './auth';

// Crockford Base32-inspired charset (excludes easily confused chars: 0, O, 1, I, L)
const RECOVERY_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate a cryptographically secure, high-entropy backup recovery code
 * Formatted into human-readable 4-character blocks: e.g. K7PX-9MRT-4WQH-8VNC
 * Minimum 16 characters from 30+ alphabet entropy, backed by crypto.randomBytes(24)
 */
export function generateRecoveryCode(): { rawCode: string; normalized: string } {
  const bytes = crypto.randomBytes(24);
  let codeChars = '';
  for (let i = 0; i < 16; i++) {
    const randomIndex = bytes[i] % RECOVERY_CHARSET.length;
    codeChars += RECOVERY_CHARSET[randomIndex];
  }

  // Format into 4 groups of 4 characters: XXXX-XXXX-XXXX-XXXX
  const rawCode = `${codeChars.slice(0, 4)}-${codeChars.slice(4, 8)}-${codeChars.slice(8, 12)}-${codeChars.slice(12, 16)}`;
  return {
    rawCode,
    normalized: codeChars
  };
}

/**
 * Normalize any input code by stripping whitespace, hyphens, and converting to uppercase
 */
export function normalizeRecoveryCode(code: string): string {
  if (!code || typeof code !== 'string') return '';
  return code.replace(/[-\s]/g, '').trim().toUpperCase();
}

/**
 * Hash normalized recovery code using bcrypt
 */
export async function hashRecoveryCode(normalizedCode: string): Promise<string> {
  return bcrypt.hash(normalizedCode, 10);
}

/**
 * Verify input recovery code against stored bcrypt hash
 */
export async function verifyRecoveryCode(inputCode: string, storedHash: string): Promise<boolean> {
  const normalized = normalizeRecoveryCode(inputCode);
  if (!normalized || !storedHash) return false;
  return bcrypt.compare(normalized, storedHash);
}

/**
 * Sign a short-lived recovery challenge token (Step 1 -> Step 2)
 * Valid for 15 minutes
 */
export async function signRecoveryChallengeToken(payload: { customerId: string; identifier: string }): Promise<string> {
  return new SignJWT({ ...payload, purpose: 'recovery-challenge' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getJwtSecret());
}

/**
 * Verify recovery challenge token
 */
export async function verifyRecoveryChallengeToken(token: string): Promise<{ customerId: string; identifier: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (payload.purpose !== 'recovery-challenge') return null;
    return payload as any;
  } catch {
    return null;
  }
}

/**
 * Sign a single-use short-lived password reset permission token (Step 2 -> Step 3)
 * Valid for 10 minutes
 */
export async function signPasswordResetToken(payload: { customerId: string }): Promise<string> {
  return new SignJWT({ ...payload, purpose: 'password-reset-permission' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(getJwtSecret());
}

/**
 * Verify password reset permission token
 */
export async function verifyPasswordResetToken(token: string): Promise<{ customerId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (payload.purpose !== 'password-reset-permission') return null;
    return payload as any;
  } catch {
    return null;
  }
}
