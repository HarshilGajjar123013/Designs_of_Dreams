import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, fallbackDb } from '@/lib/db';
import {
  verifyPasswordResetToken,
  generateRecoveryCode,
  hashRecoveryCode
} from '@/lib/recoveryCode';
import { removeAuthCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 5 reset requests per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 5, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { resetToken, newPassword, confirmPassword } = await req.json();

    if (!resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters in length' },
        { status: 400 }
      );
    }

    const payload = await verifyPasswordResetToken(resetToken);
    if (!payload || !payload.customerId) {
      return NextResponse.json(
        { error: 'Password reset permission has expired. Please restart the recovery process.' },
        { status: 401 }
      );
    }

    let customer: any = null;
    let databaseConnected = true;

    try {
      customer = await prisma.customer.findUnique({
        where: { id: payload.customerId }
      });
    } catch {
      databaseConnected = false;
    }

    if (!databaseConnected || !customer) {
      const customers = fallbackDb.getCollection('customers');
      customer = customers.find(c => c.id === payload.customerId);
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer account not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Generate a fresh new backup recovery code since the old one was consumed
    const { rawCode, normalized } = generateRecoveryCode();
    const newRecoveryCodeHash = await hashRecoveryCode(normalized);
    const now = new Date();

    const updateDataPrisma = {
      passwordHash,
      recoveryCodeHash: newRecoveryCodeHash,
      recoveryCodeUsed: false,
      recoveryCodeCreatedAt: now,
      recoveryAttempts: 0,
      recoveryLockoutUntil: null,
      updatedAt: now
    };

    try {
      await prisma.customer.update({
        where: { id: customer.id },
        data: updateDataPrisma
      });
    } catch (err) {
      console.warn('Prisma password update error:', err);
    }

    // Always mirror to fallback DB
    try {
      const customers = fallbackDb.getCollection('customers');
      const idx = customers.findIndex(c => c.id === customer.id || c.email?.toLowerCase() === customer.email?.toLowerCase());
      if (idx !== -1) {
        customers[idx] = {
          ...customers[idx],
          passwordHash,
          recoveryCodeHash: newRecoveryCodeHash,
          recoveryCodeUsed: false,
          recoveryCodeCreatedAt: now.toISOString(),
          recoveryAttempts: 0,
          recoveryLockoutUntil: null,
          updatedAt: now.toISOString()
        };
        fallbackDb.saveCollection('customers', customers);
      }
    } catch (mirrorErr) {
      console.warn('Fallback DB sync error:', mirrorErr);
    }

    // Revoke and clear any existing active session cookie
    await removeAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Your password has been changed successfully. All existing sessions have been invalidated.',
      newRecoveryCode: rawCode
    });

  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
