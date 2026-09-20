// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth Page Images Admin API
// Manage Login & Sign Up collage image slots
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

const DEFAULT_LOGIN_SLOT_URLS = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610030470298-4058fbb6190c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=400&q=80"
];

const DEFAULT_SIGNUP_SLOT_URLS = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80"
];

function getDefaultSlots(pageType: 'login' | 'signup') {
  const urls = pageType === 'login' ? DEFAULT_LOGIN_SLOT_URLS : DEFAULT_SIGNUP_SLOT_URLS;
  return urls.map((url, index) => ({
    id: `default-${pageType}-${index + 1}`,
    pageType,
    slotNumber: index + 1,
    imageUrl: url,
    storagePath: null,
    isActive: true,
    displayOrder: index + 1,
    title: `${pageType === 'login' ? 'Login' : 'Sign Up'} Collage ${index + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * GET /api/admin/auth-images?page=login|signup
 * Retrieve all 12 configurable slots for the selected authentication page
 */
export async function GET(request: NextRequest) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page')?.toLowerCase();
    const pageType = (pageParam === 'signup' ? 'signup' : 'login') as 'login' | 'signup';

    let dbSlots: any[] = [];
    let isDbConnected = true;

    try {
      dbSlots = await (prisma as any).authPageImage.findMany({
        where: { pageType },
        orderBy: { slotNumber: 'asc' },
      });
    } catch {
      isDbConnected = false;
    }

    if (!isDbConnected || !dbSlots || dbSlots.length === 0) {
      const fallbackCollection = fallbackDb.getCollection('auth_page_images') || [];
      dbSlots = fallbackCollection.filter((item: any) => item.pageType === pageType);
    }

    // Merge with defaults so all 12 slots always exist
    const defaultSlots = getDefaultSlots(pageType);
    const finalSlots = defaultSlots.map((defaultSlot) => {
      const match = dbSlots.find((s: any) => s.slotNumber === defaultSlot.slotNumber);
      if (match) {
        return {
          id: match.id,
          pageType: match.pageType,
          slotNumber: match.slotNumber,
          imageUrl: match.imageUrl || defaultSlot.imageUrl,
          storagePath: match.storagePath || null,
          isActive: match.isActive !== undefined ? match.isActive : true,
          displayOrder: match.displayOrder || defaultSlot.displayOrder,
          title: match.title || defaultSlot.title,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt,
        };
      }
      return defaultSlot;
    });

    // Sort by slotNumber
    finalSlots.sort((a, b) => a.slotNumber - b.slotNumber);

    return NextResponse.json({
      success: true,
      pageType,
      images: finalSlots,
    });
  } catch (error: any) {
    console.error('[ADMIN AUTH-IMAGES GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve auth images' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/auth-images
 * Upsert/save single image slot
 */
export async function POST(request: NextRequest) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const body = await request.json();
    const { pageType, slotNumber, imageUrl, storagePath, isActive, displayOrder, title } = body;

    if (!pageType || !['login', 'signup'].includes(pageType)) {
      return NextResponse.json({ success: false, error: 'Invalid pageType (must be login or signup)' }, { status: 400 });
    }
    const slot = Number(slotNumber);
    if (!slot || slot < 1 || slot > 12) {
      return NextResponse.json({ success: false, error: 'Slot number must be between 1 and 12' }, { status: 400 });
    }
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid image URL is required' }, { status: 400 });
    }

    const itemData = {
      pageType,
      slotNumber: slot,
      imageUrl: imageUrl.trim(),
      storagePath: storagePath || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: displayOrder ? Number(displayOrder) : slot,
      title: title ? String(title).trim() : `Collage ${slot}`,
      updatedAt: new Date(),
    };

    let result = null;
    let savedInDb = false;

    try {
      result = await (prisma as any).authPageImage.upsert({
        where: {
          pageType_slotNumber: {
            pageType,
            slotNumber: slot,
          },
        },
        update: itemData,
        create: {
          ...itemData,
          createdAt: new Date(),
        },
      });
      savedInDb = true;
    } catch (dbErr) {
      console.warn('[AUTH IMAGES] Database write failed, saving to fallback DB:', dbErr);
    }

    // Always update fallback DB for parity
    try {
      const fallbackItems = fallbackDb.getCollection('auth_page_images') || [];
      const existingIdx = fallbackItems.findIndex(
        (i: any) => i.pageType === pageType && i.slotNumber === slot
      );
      if (existingIdx >= 0) {
        fallbackItems[existingIdx] = {
          ...fallbackItems[existingIdx],
          ...itemData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        fallbackItems.push({
          id: `auth-${pageType}-slot-${slot}`,
          ...itemData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      fallbackDb.saveCollection('auth_page_images', fallbackItems);
    } catch (fbErr) {
      console.warn('[AUTH IMAGES] Failed to sync fallback DB:', fbErr);
    }

    // Record Security Audit Log
    try {
      await (prisma as any).securityLog.create({
        data: {
          action: `Updated ${pageType.toUpperCase()} Page Image Slot ${slot}`,
          adminName: session?.name || 'Administrator',
          role: session?.role || 'SUPER_ADMIN',
          status: 'SUCCESS',
        },
      });
    } catch {
      // ignore log failure
    }

    return NextResponse.json({
      success: true,
      message: `Image for Slot ${slot} saved successfully`,
      image: result || itemData,
    });
  } catch (error: any) {
    console.error('[ADMIN AUTH-IMAGES POST ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save auth image' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/auth-images
 * Bulk save/update all slots for a page
 */
export async function PUT(request: NextRequest) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const body = await request.json();
    const { pageType, slots } = body;

    if (!pageType || !['login', 'signup'].includes(pageType)) {
      return NextResponse.json({ success: false, error: 'Invalid pageType' }, { status: 400 });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ success: false, error: 'Slots array is required' }, { status: 400 });
    }

    for (const slotItem of slots) {
      const slot = Number(slotItem.slotNumber);
      if (!slot || slot < 1 || slot > 12) continue;

      const itemData = {
        pageType,
        slotNumber: slot,
        imageUrl: slotItem.imageUrl || '',
        storagePath: slotItem.storagePath || null,
        isActive: slotItem.isActive !== undefined ? Boolean(slotItem.isActive) : true,
        displayOrder: slotItem.displayOrder !== undefined ? Number(slotItem.displayOrder) : slot,
        title: slotItem.title || `Collage ${slot}`,
        updatedAt: new Date(),
      };

      try {
        await (prisma as any).authPageImage.upsert({
          where: {
            pageType_slotNumber: {
              pageType,
              slotNumber: slot,
            },
          },
          update: itemData,
          create: {
            ...itemData,
            createdAt: new Date(),
          },
        });
      } catch (err) {
        // Continue and save to fallback
      }
    }

    // Sync fallback DB
    try {
      const fallbackItems = fallbackDb.getCollection('auth_page_images') || [];
      const filteredOther = fallbackItems.filter((i: any) => i.pageType !== pageType);
      const updatedThisPage = slots.map((s: any) => ({
        id: s.id || `auth-${pageType}-slot-${s.slotNumber}`,
        pageType,
        slotNumber: Number(s.slotNumber),
        imageUrl: s.imageUrl,
        storagePath: s.storagePath || null,
        isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
        displayOrder: s.displayOrder !== undefined ? Number(s.displayOrder) : Number(s.slotNumber),
        title: s.title || `Collage ${s.slotNumber}`,
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      fallbackDb.saveCollection('auth_page_images', [...filteredOther, ...updatedThisPage]);
    } catch { }

    return NextResponse.json({
      success: true,
      message: `All ${pageType} slots updated successfully`,
    });
  } catch (error: any) {
    console.error('[ADMIN AUTH-IMAGES PUT ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update slots' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth-images
 * Delete / reset a slot back to default
 */
export async function DELETE(request: NextRequest) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const slotParam = searchParams.get('slot');
    const idParam = searchParams.get('id');

    const pageType = pageParam === 'signup' ? 'signup' : 'login';
    const slot = slotParam ? Number(slotParam) : null;

    if (slot && (slot < 1 || slot > 12)) {
      return NextResponse.json({ success: false, error: 'Invalid slot' }, { status: 400 });
    }

    // Reset or delete record
    try {
      if (idParam && !idParam.startsWith('default-')) {
        await (prisma as any).authPageImage.delete({
          where: { id: idParam },
        });
      } else if (slot) {
        await (prisma as any).authPageImage.deleteMany({
          where: { pageType, slotNumber: slot },
        });
      }
    } catch {
      // If DB fails, proceed with fallback cleanup
    }

    // Reset slot in fallback DB back to default image
    const defaultSlots = getDefaultSlots(pageType);
    const defaultForSlot = defaultSlots.find((s) => s.slotNumber === slot);

    try {
      const fallbackItems = fallbackDb.getCollection('auth_page_images') || [];
      const itemIdx = fallbackItems.findIndex(
        (i: any) => i.pageType === pageType && (i.slotNumber === slot || i.id === idParam)
      );
      if (itemIdx >= 0 && defaultForSlot) {
        fallbackItems[itemIdx] = {
          ...defaultForSlot,
          updatedAt: new Date().toISOString(),
        };
        fallbackDb.saveCollection('auth_page_images', fallbackItems);
      }
    } catch { }

    return NextResponse.json({
      success: true,
      message: `Slot ${slot || idParam} has been reset to default`,
      defaultImage: defaultForSlot?.imageUrl,
    });
  } catch (error: any) {
    console.error('[ADMIN AUTH-IMAGES DELETE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete/reset slot' },
      { status: 500 }
    );
  }
}
