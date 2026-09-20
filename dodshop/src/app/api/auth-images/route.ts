// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public Auth Page Images API
// Supplies active images for Login & Sign Up collage grid
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';

const DEFAULT_LOGIN_IMAGES = [
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

const DEFAULT_SIGNUP_IMAGES = [
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page')?.toLowerCase();
    const pageType = (pageParam === 'signup' ? 'signup' : 'login') as 'login' | 'signup';

    const defaultImages = pageType === 'login' ? DEFAULT_LOGIN_IMAGES : DEFAULT_SIGNUP_IMAGES;

    let items: any[] = [];
    let dbSuccess = true;

    try {
      items = await (prisma as any).authPageImage.findMany({
        where: {
          pageType,
          isActive: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { slotNumber: 'asc' },
        ],
      });
    } catch (err) {
      dbSuccess = false;
    }

    if (!dbSuccess || !items || items.length === 0) {
      try {
        const fallbackItems = fallbackDb.getCollection('auth_page_images') || [];
        items = fallbackItems
          .filter((i: any) => i.pageType === pageType && i.isActive !== false)
          .sort((a: any, b: any) => (a.displayOrder || a.slotNumber) - (b.displayOrder || b.slotNumber));
      } catch {
        items = [];
      }
    }

    // Extract image URLs
    let imageUrls: string[] = items
      .map((i: any) => i.imageUrl)
      .filter((url: any) => typeof url === 'string' && url.trim().length > 0);

    // If fewer than 12 images are active, fill remaining slots with defaults
    // to preserve the 3x4 grid collage layout seamlessly
    if (imageUrls.length < 12) {
      const remainingNeeded = 12 - imageUrls.length;
      const fillers = defaultImages.slice(imageUrls.length, imageUrls.length + remainingNeeded);
      imageUrls = [...imageUrls, ...fillers];
    } else if (imageUrls.length > 12) {
      imageUrls = imageUrls.slice(0, 12);
    }

    const response = NextResponse.json({
      success: true,
      pageType,
      images: imageUrls,
      items: items.length > 0 ? items : defaultImages.map((url, idx) => ({
        id: `default-${idx + 1}`,
        pageType,
        slotNumber: idx + 1,
        imageUrl: url,
        isActive: true,
        displayOrder: idx + 1,
      })),
    });

    // Cache headers for performance and rapid revalidation
    response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error: any) {
    console.error('[PUBLIC AUTH-IMAGES GET ERROR]', error);
    const pageParam = request.nextUrl.searchParams.get('page');
    const fallback = pageParam === 'signup' ? DEFAULT_SIGNUP_IMAGES : DEFAULT_LOGIN_IMAGES;
    return NextResponse.json({
      success: true,
      pageType: pageParam === 'signup' ? 'signup' : 'login',
      images: fallback,
      fallback: true,
    });
  }
}
