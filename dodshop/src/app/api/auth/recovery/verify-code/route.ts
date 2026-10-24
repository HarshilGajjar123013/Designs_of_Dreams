import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import {
  verifyRecoveryChallengeToken,
  verifyRecoveryCode,
  signPasswordResetToken
} from '@/lib/recoveryCode';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 10 verification requests per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 10, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { challengeToken, recoveryCode } = await req.json();

    if (!challengeToken || !recoveryCode) {
      return NextResponse.json(
        { error: 'Please enter your backup recovery code' },
        { status: 400 }
      );
    }

    const challenge = await verifyRecoveryChallengeToken(challengeToken);
    if (!challenge || !challenge.customerId) {
      return NextResponse.json(
        { error: 'Your session has expired. Please restart the password reset process.' },
        { status: 401 }
      );
    }

    // If challenge was for dummy account
    if (challenge.customerId.startsWith('dummy-')) {
      return NextResponse.json(
        { error: 'Invalid backup recovery code. Please check and try again.' },
        { status: 400 }
      );
    }

    let customer: any = null;
    let databaseConnected = true;

    try {
      customer = await prisma.customer.findUnique({
        where: { id: challenge.customerId }
      });
    } catch {
      databaseConnected = false;
    }

    if (!databaseConnected || !customer) {
      const customers = fallbackDb.getCollection('customers');
      customer = customers.find(c => c.id === challenge.customerId);
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid backup recovery code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Check account lockout
    if (customer.recoveryLockoutUntil) {
      const lockoutTime = new Date(customer.recoveryLockoutUntil).getTime();
      if (Date.now() < lockoutTime) {
        const minutesLeft = Math.ceil((lockoutTime - Date.now()) / (60 * 1000));
        return NextResponse.json(
          { error: `Too many failed attempts. Account locked. Please wait ${minutesLeft} minute(s) before trying again.` },
          { status: 429 }
        );
      }
    }

    // Check if code was already used
    if (customer.recoveryCodeUsed) {
      return NextResponse.json(
        { error: 'This recovery code has already been used and is no longer valid.' },
        { status: 400 }
      );
    }

    if (!customer.recoveryCodeHash) {
      return NextResponse.json(
        { error: 'No recovery code is registered for this account. Please contact support.' },
        { status: 400 }
      );
    }

    const isValid = await verifyRecoveryCode(recoveryCode, customer.recoveryCodeHash);

    if (!isValid) {
      const attempts = (customer.recoveryAttempts || 0) + 1;
      const lockoutDate = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      const prismaUpdates: any = {
        recoveryAttempts: attempts,
        recoveryLockoutUntil: lockoutDate
      };

      // Save failed attempts to Prisma
      try {
        await prisma.customer.update({
          where: { id: customer.id },
          data: prismaUpdates
        });
      } catch (err) {
        console.warn('Could not update recovery attempts in Prisma:', err);
      }

      // Always sync to fallback DB
      const customers = fallbackDb.getCollection('customers');
      const idx = customers.findIndex(c => c.id === customer.id || c.email?.toLowerCase() === customer.email?.toLowerCase());
      if (idx !== -1) {
        customers[idx] = {
          ...customers[idx],
          recoveryAttempts: attempts,
          recoveryLockoutUntil: lockoutDate ? lockoutDate.toISOString() : null
        };
        fallbackDb.saveCollection('customers', customers);
      }

      const remaining = Math.max(0, 5 - attempts);
      return NextResponse.json(
        {
          error: remaining > 0
            ? `Invalid backup recovery code. ${remaining} attempt(s) remaining before temporary lockout.`
            : 'Invalid backup recovery code. Maximum attempts reached. Account locked for 15 minutes.'
        },
        { status: 400 }
      );
    }

    // Code is valid! Mark as used and reset failed attempts
    const now = new Date();
    const successUpdatesPrisma = {
      recoveryCodeUsed: true,
      recoveryAttempts: 0,
      recoveryLockoutUntil: null,
      recoveryCodeUsedAt: now
    };

    try {
      await prisma.customer.update({
        where: { id: customer.id },
        data: successUpdatesPrisma
      });
    } catch (err) {
      console.warn('Could not mark recovery code used in Prisma:', err);
    }

    // Always sync to fallback DB
    const customers = fallbackDb.getCollection('customers');
    const idx = customers.findIndex(c => c.id === customer.id || c.email?.toLowerCase() === customer.email?.toLowerCase());
    if (idx !== -1) {
      customers[idx] = {
        ...customers[idx],
        recoveryCodeUsed: true,
        recoveryAttempts: 0,
        recoveryLockoutUntil: null,
        recoveryCodeUsedAt: now.toISOString()
      };
      fallbackDb.saveCollection('customers', customers);
    }

    // Generate single-use, short-lived reset token (valid for 10 minutes)
    const resetToken = await signPasswordResetToken({
      customerId: customer.id
    });

    return NextResponse.json({
      success: true,
      resetToken
    });

  } catch (err: any) {
    console.error('Verify recovery code error:', err);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
