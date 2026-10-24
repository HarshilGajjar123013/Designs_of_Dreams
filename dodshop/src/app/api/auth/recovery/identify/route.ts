import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { signRecoveryChallengeToken } from '@/lib/recoveryCode';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: max 5 identify requests per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(req), 5, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Please enter a valid username, email, or mobile number' },
        { status: 400 }
      );
    }

    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();
    const digitsOnly = rawId.replace(/\D/g, '');
    let customer: any = null;
    let databaseConnected = true;

    try {
      customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { email: { equals: cleanId, mode: 'insensitive' } },
            { phone: { equals: rawId } },
            ...(digitsOnly.length >= 10 ? [{ phone: { contains: digitsOnly.slice(-10) } }] : []),
            { name: { equals: cleanId, mode: 'insensitive' } }
          ]
        }
      });
    } catch {
      databaseConnected = false;
    }

    if (!customer) {
      const customers = fallbackDb.getCollection('customers');
      customer = customers.find((c: any) =>
        c.email?.toLowerCase() === cleanId ||
        c.phone === rawId ||
        (digitsOnly.length >= 10 && c.phone?.replace(/\D/g, '').endsWith(digitsOnly.slice(-10))) ||
        c.name?.toLowerCase() === cleanId
      );
    }

    // Generic response to prevent account enumeration
    // If user is not found, encode a dummy challenge token with non-existent ID
    const targetCustomerId = customer ? customer.id : `dummy-${Date.now()}`;
    const challengeToken = await signRecoveryChallengeToken({
      customerId: targetCustomerId,
      identifier: cleanId
    });

    return NextResponse.json({
      success: true,
      challengeToken
    });

  } catch (err: any) {
    console.error('Recovery identify error:', err);
    return NextResponse.json(
      { error: 'An error occurred while identifying your account' },
      { status: 500 }
    );
  }
}
