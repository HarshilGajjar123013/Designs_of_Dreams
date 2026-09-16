import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    let contactForms: any[] = [];
    let databaseConnected = true;

    try {
      contactForms = await prisma.contactForm.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('⚠️ Database GET failed, falling back to JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      contactForms = fallbackDb.getCollection('contactForms');
      contactForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ success: true, contactForms });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch contact forms' }, { status: 500 });
  }
}
