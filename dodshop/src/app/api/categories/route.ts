import { NextResponse } from 'next/server';
import { getDbCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getDbCategories();
    return NextResponse.json(
      { success: true, categories },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('API categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories', categories: [] },
      { status: 500 }
    );
  }
}
