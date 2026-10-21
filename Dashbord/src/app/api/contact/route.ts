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

export async function DELETE(req: Request) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Array of ticket ids is required' }, { status: 400 });
    }

    try {
      await prisma.contactForm.deleteMany({
        where: { id: { in: ids } }
      });
    } catch (dbErr) {
      console.warn('Database bulk contact delete error:', dbErr);
    }

    const forms = fallbackDb.getCollection('contactForms');
    const filtered = forms.filter((f: any) => !ids.includes(f.id));
    fallbackDb.saveCollection('contactForms', filtered);

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error('Contact bulk DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete contact forms' }, { status: 500 });
  }
}

