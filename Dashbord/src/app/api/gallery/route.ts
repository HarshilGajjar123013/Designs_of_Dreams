import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let items: any[] = [];

    try {
      const rawRes: any = await prisma.$runCommandRaw({
        find: "gallery_items",
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
          sortOrder: item.sortOrder || 0,
          isActive: item.isActive !== false
        }));
      }
    } catch (dbErr) {
      console.warn("Could not query gallery_items collection directly, checking CMS singleton:", dbErr);
    }

    const cms = await prisma.cMSConfig.findUnique({
      where: { id: 'singleton' }
    });

    if (items.length === 0 && cms && cms.gallery && Array.isArray(cms.gallery)) {
      items = cms.gallery;
    }

    return NextResponse.json({
      success: true,
      gallery: items,
      galleryFilterTags: (cms as any)?.galleryFilterTags || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error('Admin Gallery GET error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve gallery items',
      gallery: []
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = body.id || `gallery-${randomUUID().slice(0, 8)}`;

    const newItem = {
      _id: id,
      title: body.title,
      category: body.category,
      filterTag: body.filterTag || 'weaving',
      image: body.image,
      desc: body.desc || '',
      sortOrder: body.sortOrder || 0,
      isActive: body.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 1. Insert into gallery_items
    await prisma.$runCommandRaw({
      insert: "gallery_items",
      documents: [newItem]
    });

    // 2. Also sync with cms_config
    const cms = await prisma.cMSConfig.findUnique({ where: { id: 'singleton' } });
    const existingGallery: any[] = Array.isArray(cms?.gallery) ? cms.gallery : [];
    const updatedGallery = [
      ...existingGallery,
      {
        id,
        title: newItem.title,
        category: newItem.category,
        filterTag: newItem.filterTag,
        image: newItem.image,
        desc: newItem.desc
      }
    ];

    await prisma.cMSConfig.upsert({
      where: { id: 'singleton' },
      update: { gallery: updatedGallery },
      create: {
        id: 'singleton',
        heroTitle: 'Designs of Dreams — Heritage & Couture Atelier',
        heroSubtitle: 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
        heroImage: '/assets/hero/hero_1.png',
        featuredCollections: [],
        gallery: updatedGallery,
        seoTitle: 'Designs of Dreams',
        seoDescription: 'Luxury Indian Ethnic Wear'
      }
    });

    return NextResponse.json({ success: true, item: { ...newItem, id } });
  } catch (err: any) {
    console.error('Admin Gallery POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to save gallery item' }, { status: 500 });
  }
}
