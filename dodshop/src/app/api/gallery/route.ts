import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let items: any[] = [];

    try {
      const rawRes: any = await prisma.$runCommandRaw({
        find: "gallery_items",
        filter: { isActive: { $ne: false } },
        sort: { sortOrder: 1 }
      });

      if (rawRes && rawRes.cursor && Array.isArray(rawRes.cursor.firstBatch)) {
        items = rawRes.cursor.firstBatch.map((item: any) => ({
          id: item._id,
          title: item.title,
          category: item.category,
          filterTag: item.filterTag,
          image: item.image,
          desc: item.desc,
          sortOrder: item.sortOrder || 0
        }));
      }
    } catch (dbErr) {
      console.warn("Could not query gallery_items collection directly, checking CMS singleton:", dbErr);
    }

    // Fallback to cmsConfig if empty
    if (items.length === 0) {
      const cms = await prisma.cMSConfig.findUnique({
        where: { id: 'singleton' }
      });
      if (cms && cms.gallery && Array.isArray(cms.gallery)) {
        items = cms.gallery;
      }
    }

    return NextResponse.json({
      success: true,
      gallery: items
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error('Gallery API error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve gallery',
      gallery: []
    }, { status: 500 });
  }
}
