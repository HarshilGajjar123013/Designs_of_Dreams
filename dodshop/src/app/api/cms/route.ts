import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';

function formatCmsResponse(config: any) {
  if (!config) return config;
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
      cmsConfig = fallbackDb.getCmsConfig();
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
