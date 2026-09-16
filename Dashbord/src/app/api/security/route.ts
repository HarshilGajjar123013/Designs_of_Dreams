import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { session, response } = await verifyAdminSession('SUPER_ADMIN');
    if (response) return response;

    let securityLogs: any[] = [];
    let databaseConnected = true;

    try {
      securityLogs = await prisma.securityLog.findMany({
        orderBy: {
          timestamp: 'desc'
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed, using fallback JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      securityLogs = fallbackDb.getCollection('securityLogs');
      // Sort desc
      securityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return NextResponse.json({
      success: true,
      securityLogs
    });

  } catch (err: any) {
    console.error('Security logs GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve security audit logs' },
      { status: 500 }
    );
  }
}
