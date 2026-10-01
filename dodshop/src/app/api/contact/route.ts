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
    const { name, email, phone, interest, categoryName, categoryId, productId, productName, date, message } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    const selectedCategory = categoryName || interest || 'General';
    const selectedItem = productName ? ` — Item: ${productName}` : '';
    // Build subject from category, item and date
    const subject = `${selectedCategory}${selectedItem} Inquiry${date ? ` — Preferred Date: ${date}` : ''}`;

    // Include category & product metadata if provided
    const metadataLines = [
      categoryId ? `Category: ${selectedCategory} (ID: ${categoryId})` : (selectedCategory !== 'General' ? `Category: ${selectedCategory}` : ''),
      productId ? `Item / Product: ${productName || productId} (ID: ${productId})` : (productName ? `Item: ${productName}` : '')
    ].filter(Boolean).join(' | ');

    const formattedMessage = metadataLines
      ? `[${metadataLines}]\n${message || ''}`.trim()
      : (message || '');

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
          message: formattedMessage,
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
        categoryId: categoryId || null,
        categoryName: selectedCategory,
        productId: productId || null,
        productName: productName || null,
        subject,
        message: formattedMessage,
        status: 'UNREAD',
        createdAt: new Date().toISOString(),
      };
      contactForms.push(contactFormObj);
      fallbackDb.saveCollection('contactForms', contactForms);
    }

    return NextResponse.json({ success: true, id: contactId });
  } catch (error: unknown) {
    console.error('[CONTACT FORM ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while submitting your message. Please try again later.' },
      { status: 500 }
    );
  }
}
