import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Perform lightweight read to test connection health
    await prisma.product.count();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // Log detailed diagnostics securely to server logs only — never return to client
    console.error('Database health probe failed:', error?.message || error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Database service unavailable'
      },
      { status: 503 }
    );
  }
}
