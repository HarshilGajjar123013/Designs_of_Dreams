// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Contact Form API — Save submissions to database
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // Rate limit: max 5 contact submissions per 15 minutes per IP
  const rateLimitRes = checkRateLimit(getClientIp(request), 5, 15 * 60 * 1000);
  if (rateLimitRes) return rateLimitRes;

  try {
    const body = await request.json();
    const { name, email, phone, interest, date, message } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Build subject from interest and date
    const subject = `${interest || 'General'} Inquiry${date ? ` — Preferred Date: ${date}` : ''}`;

    let databaseConnected = true;
    let contactId = '';

    try {
      // Save to database
      const contactForm = await prisma.contactForm.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject,
          message: message || '',
          status: 'UNREAD',
        },
      });
      contactId = contactForm.id;
    } catch (dbError) {
      console.warn('⚠️ Contact API DB save failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      contactId = randomUUID();
      const contactForms = fallbackDb.getCollection('contactForms');
      const contactFormObj = {
        id: contactId,
        name,
        email,
        phone: phone || null,
        subject,
        message: message || '',
        status: 'UNREAD',
        createdAt: new Date().toISOString(),
      };
      contactForms.push(contactFormObj);
      fallbackDb.saveCollection('contactForms', contactForms);
    }

    return NextResponse.json({ success: true, id: contactId });
  } catch (error: unknown) {
    console.error('[CONTACT FORM ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save contact form';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
