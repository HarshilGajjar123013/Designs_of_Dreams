import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';

function formatCmsResponse(config: any) {
  if (!config) {
    return {
      heroTitle: 'Designs of Dreams — Heritage & Couture Atelier',
      heroSubtitle: 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
      heroImage: '/assets/hero/hero_1.png',
      announcementText: '',
      announcementLink: '',
      announcementActive: false,
      featuredCollections: [],
      gallery: [],
      bannerMiddle: '',
      footerBio: 'Designs of Dreams is a curated marketplace celebrating premium Indian heritage textiles.',
      seoTitle: 'Designs of Dreams — Luxury Indian Ethnic Wear',
      seoDescription: 'Discover hand-woven luxury Indian ethnic wear.',
      galleryFilterTags: []
    };
  }
  const galleryRaw = config.gallery;
  let galleryItems: any[] = [];
  let galleryFilterTags: any[] = config.galleryFilterTags || [];

  if (Array.isArray(galleryRaw)) {
    galleryItems = galleryRaw;
  } else if (galleryRaw && typeof galleryRaw === 'object') {
    galleryItems = Array.isArray(galleryRaw.items) ? galleryRaw.items : [];
    if (!galleryFilterTags.length && Array.isArray(galleryRaw.filterTags)) {
      galleryFilterTags = galleryRaw.filterTags;
    }
  }

  return {
    ...config,
    featuredCollections: Array.isArray(config.featuredCollections) ? config.featuredCollections : [],
    gallery: galleryItems,
    galleryFilterTags: galleryFilterTags
  };
}

export async function GET() {
  try {
    let cmsConfig = null;
    let databaseConnected = true;

    try {
      cmsConfig = await prisma.cMSConfig.findUnique({
        where: { id: 'singleton' }
      });
    } catch (dbError) {
      databaseConnected = false;
    }

    if (!databaseConnected || !cmsConfig) {
      if (process.env.ALLOW_FALLBACK_DB === 'false') {
        cmsConfig = null;
      } else {
        cmsConfig = fallbackDb.getCmsConfig();
      }
    }

    return NextResponse.json({
      success: true,
      cms: formatCmsResponse(cmsConfig)
    });
  } catch (err: any) {
    console.error('[CMS CONFIG GET ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve CMS configuration' },
      { status: 500 }
    );
  }
}
