import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const adminCount = await prisma.adminUser.count();
    const productCount = await prisma.product.count();
    return NextResponse.json({
      status: 'CONNECTED',
      database: 'MongoDB Atlas',
      adminCount,
      productCount,
      databaseUrlSet: !!process.env.DATABASE_URL,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'DISCONNECTED',
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      databaseUrlSet: !!process.env.DATABASE_URL,
    }, { status: 500 });
  }
}
