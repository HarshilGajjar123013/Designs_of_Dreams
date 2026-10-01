// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth Page Image Upload API
// Saves to /public/uploads/auth/ in Dashbord and dodshop
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { verifyAdminSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number; ext: string }[]> = {
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF], offset: 0, ext: '.jpg' }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0, ext: '.png' }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, ext: '.webp' }],
  'image/avif': [{ bytes: [0x00, 0x00, 0x00], offset: 0, ext: '.avif' }],
};

function validateMagicBytes(buffer: Buffer, declaredType: string): { valid: boolean; ext: string } {
  const signatures = MAGIC_BYTES[declaredType];
  if (signatures) {
    for (const sig of signatures) {
      if (buffer.length >= sig.offset + sig.bytes.length) {
        const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
        if (sig.bytes.every((byte, i) => slice[i] === byte)) {
          return { valid: true, ext: sig.ext };
        }
      }
    }
  }
  return { valid: false, ext: '' };
}

const isReadOnlyEnv = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');

const DASHBOARD_AUTH_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'auth');
const STOREFRONT_AUTH_UPLOAD_DIR = path.resolve(process.cwd(), '..', 'dodshop', 'public', 'uploads', 'auth');

export async function POST(request: NextRequest) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pageType = (formData.get('pageType') as string) || 'auth';
    const slotNumber = (formData.get('slotNumber') as string) || '0';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, AVIF` },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: `Image exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // SECURITY: Validate binary magic bytes, don't trust Content-Type header alone
    const { valid, ext } = validateMagicBytes(buffer, file.type);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'File failed binary signature validation' },
        { status: 400 }
      );
    }

    if (isReadOnlyEnv) {
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        originalName: file.name,
      });
    }

    await mkdir(DASHBOARD_AUTH_UPLOAD_DIR, { recursive: true });
    await mkdir(STOREFRONT_AUTH_UPLOAD_DIR, { recursive: true });

    const uniqueFilename = `${pageType}-slot${slotNumber}-${randomUUID().slice(0, 8)}${ext}`;

    const dashboardPath = path.join(DASHBOARD_AUTH_UPLOAD_DIR, uniqueFilename);
    await writeFile(dashboardPath, buffer);

    try {
      const storefrontPath = path.join(STOREFRONT_AUTH_UPLOAD_DIR, uniqueFilename);
      await copyFile(dashboardPath, storefrontPath);
    } catch {
      console.warn('[AUTH UPLOAD] Could not mirror image to storefront folder');
    }

    const relativeUrl = `/uploads/auth/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      originalName: file.name,
    });
  } catch (error: any) {
    console.error('[AUTH IMAGE UPLOAD ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
