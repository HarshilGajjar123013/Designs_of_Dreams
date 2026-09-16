// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Image Upload API — Local File Storage
// Saves to both Dashboard and Storefront public folders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { verifyAdminSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
];

// Magic byte signatures for file type validation
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number; ext: string }[]> = {
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF], offset: 0, ext: '.jpg' }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0, ext: '.png' }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, ext: '.webp' }], // RIFF
  'image/avif': [{ bytes: [0x00, 0x00, 0x00], offset: 0, ext: '.avif' }], // ftyp box
  'video/mp4': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, ext: '.mp4' }], // ftyp
  'video/webm': [{ bytes: [0x1A, 0x45, 0xDF, 0xA3], offset: 0, ext: '.webm' }], // EBML
  'video/quicktime': [
    { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, ext: '.mov' },
    { bytes: [0x6D, 0x6F, 0x6F, 0x76], offset: 4, ext: '.mov' },
  ],
  'video/ogg': [{ bytes: [0x4F, 0x67, 0x67, 0x53], offset: 0, ext: '.ogv' }],
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

  // Fallback extension resolution for video types
  if (declaredType === 'video/mp4') return { valid: true, ext: '.mp4' };
  if (declaredType === 'video/webm') return { valid: true, ext: '.webm' };
  if (declaredType === 'video/quicktime') return { valid: true, ext: '.mov' };
  if (declaredType === 'video/ogg') return { valid: true, ext: '.ogv' };

  return { valid: false, ext: '' };
}

const isReadOnlyEnv = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');

// Dashboard uploads directory (for admin preview)
const DASHBOARD_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Storefront uploads directory (for customer-facing site)
const STOREFRONT_UPLOAD_DIR = path.resolve(process.cwd(), '..', 'dodshop', 'public', 'uploads', 'products');

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authenticated admin session
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WEBP, AVIF, MP4, WEBM, MOV` },
          { status: 400 }
        );
      }
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" exceeds ${isVideo ? '100MB' : '10MB'} limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
          { status: 400 }
        );
      }
    }

    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name';

    if (isReadOnlyEnv && !isCloudinaryConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: 'Local filesystem is read-only on Vercel. Please configure Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) to enable uploads in production.'
        },
        { status: 400 }
      );
    }

    // Save each file (Cloudinary if configured, otherwise local fallback for local development)
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (isCloudinaryConfigured) {
          const isVideo = file.type.startsWith('video/');
          const uploadRes = await uploadToCloudinary(buffer, 'dod_products', isVideo ? 'video' : 'image');
          return {
            url: uploadRes.url,
            originalName: file.name,
          };
        } else {
          // SECURITY: Validate binary magic bytes, don't trust Content-Type
          const { valid, ext } = validateMagicBytes(buffer, file.type);
          if (!valid) {
            return {
              url: '',
              originalName: file.name,
              error: `File "${file.name}" failed binary signature validation for type ${file.type}`,
            };
          }

          // Ensure upload directories exist
          await mkdir(DASHBOARD_UPLOAD_DIR, { recursive: true });
          await mkdir(STOREFRONT_UPLOAD_DIR, { recursive: true });

          // SECURITY: Generate server-side UUID filename to prevent path traversal
          const uniqueName = `${randomUUID()}${ext}`;

          // Save to Dashboard public folder
          const dashboardPath = path.join(DASHBOARD_UPLOAD_DIR, uniqueName);
          await writeFile(dashboardPath, buffer);

          // Also save to Storefront public folder so customers can view images
          try {
            const storefrontPath = path.join(STOREFRONT_UPLOAD_DIR, uniqueName);
            await copyFile(dashboardPath, storefrontPath);
          } catch {
            console.warn('[UPLOAD] Could not copy to storefront directory — images may not show on customer site');
          }

          return {
            url: `/uploads/products/${uniqueName}`,
            originalName: file.name,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      images: uploadResults,
    });
  } catch (error: unknown) {
    console.error('[UPLOAD ERROR]', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
