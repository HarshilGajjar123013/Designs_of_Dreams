// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth Page Images Status Toggle API
// Toggle active/inactive status of an image slot
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const body = await request.json();
    const { pageType, slotNumber, isActive } = body;

    if (!pageType || !['login', 'signup'].includes(pageType)) {
      return NextResponse.json({ success: false, error: 'Invalid pageType' }, { status: 400 });
    }

    const slot = Number(slotNumber);
    if (!slot || slot < 1 || slot > 12) {
      return NextResponse.json({ success: false, error: 'Invalid slotNumber (1-12)' }, { status: 400 });
    }

    const newStatus = Boolean(isActive);

    try {
      await (prisma as any).authPageImage.upsert({
        where: {
          pageType_slotNumber: {
            pageType,
            slotNumber: slot,
          },
        },
        update: { isActive: newStatus, updatedAt: new Date() },
        create: {
          pageType,
          slotNumber: slot,
          imageUrl: '',
          isActive: newStatus,
          displayOrder: slot,
          updatedAt: new Date(),
        },
      });
    } catch { }

    try {
      const fallbackItems = fallbackDb.getCollection('auth_page_images') || [];
      const item = fallbackItems.find(
        (i: any) => i.pageType === pageType && i.slotNumber === slot
      );
      if (item) {
        item.isActive = newStatus;
        item.updatedAt = new Date().toISOString();
        fallbackDb.saveCollection('auth_page_images', fallbackItems);
      }
    } catch { }

    return NextResponse.json({
      success: true,
      message: `Slot ${slot} status updated to ${newStatus ? 'Active' : 'Inactive'}`,
      isActive: newStatus,
    });
  } catch (error: any) {
    console.error('[AUTH IMAGES STATUS ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
