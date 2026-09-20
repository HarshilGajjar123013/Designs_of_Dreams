// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth Page Images Reorder API
// Batch update display orders of image slots
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
    const { pageType, slots } = body;

    if (!pageType || !['login', 'signup'].includes(pageType)) {
      return NextResponse.json({ success: false, error: 'Invalid pageType' }, { status: 400 });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ success: false, error: 'Slots list is required' }, { status: 400 });
    }

    // Update orders in DB
    for (const item of slots) {
      const slotNum = Number(item.slotNumber);
      const newOrder = Number(item.displayOrder);
      if (!slotNum || isNaN(newOrder)) continue;

      try {
        await (prisma as any).authPageImage.updateMany({
          where: { pageType, slotNumber: slotNum },
          data: { displayOrder: newOrder, updatedAt: new Date() },
        });
      } catch { }
    }

    // Update orders in Fallback DB
    try {
      const fallbackItems = fallbackDb.getCollection('auth_page_images') || [];
      for (const item of slots) {
        const slotNum = Number(item.slotNumber);
        const newOrder = Number(item.displayOrder);
        const found = fallbackItems.find(
          (i: any) => i.pageType === pageType && i.slotNumber === slotNum
        );
        if (found) {
          found.displayOrder = newOrder;
          found.updatedAt = new Date().toISOString();
        }
      }
      fallbackDb.saveCollection('auth_page_images', fallbackItems);
    } catch { }

    return NextResponse.json({
      success: true,
      message: 'Slots reordered successfully',
    });
  } catch (error: any) {
    console.error('[AUTH IMAGES REORDER ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reorder slots' },
      { status: 500 }
    );
  }
}
