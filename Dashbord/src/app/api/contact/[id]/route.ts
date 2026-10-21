import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { status, reply } = body;

    let databaseConnected = true;
    let updatedForm = null;

    try {
      updatedForm = await prisma.contactForm.update({
        where: { id },
        data: {
          status: status || 'REPLIED',
          reply,
          repliedAt: new Date()
        }
      });
    } catch (e) {
      console.warn('⚠️ Database PATCH failed, falling back to JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const forms = fallbackDb.getCollection('contactForms');
      const idx = forms.findIndex(f => f.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Contact form not found' }, { status: 404 });
      }

      forms[idx].status = status || 'REPLIED';
      forms[idx].reply = reply;
      forms[idx].repliedAt = new Date().toISOString();
      
      fallbackDb.saveCollection('contactForms', forms);
      updatedForm = forms[idx];
    }

    return NextResponse.json({ success: true, contactForm: updatedForm });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update contact form' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    try {
      await prisma.contactForm.delete({
        where: { id }
      });
    } catch (dbErr) {
      console.warn('Database contact delete error:', dbErr);
    }

    const forms = fallbackDb.getCollection('contactForms');
    const filtered = forms.filter((f: any) => f.id !== id);
    fallbackDb.saveCollection('contactForms', filtered);

    return NextResponse.json({ success: true, message: 'Contact ticket deleted' });
  } catch (err: any) {
    console.error('Contact DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete contact form' }, { status: 500 });
  }
}

