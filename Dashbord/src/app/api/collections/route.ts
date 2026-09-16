import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { collectionSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    let collections = [];
    let databaseConnected = true;

    try {
      collections = await prisma.collection.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      collections = fallbackDb.getCollection('collections');
      collections.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({ success: true, collections });

  } catch (err: any) {
    console.error('Collections GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve collections' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const userRole = session!.role;
    const userId = session!.id;

    const body = await req.json();
    const validation = collectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let databaseConnected = true;
    let newCollection = null;

    try {
      newCollection = await prisma.$transaction(async (tx: any) => {
        const coll = await tx.collection.create({
          data: {
            ...data,
            slug,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
          }
        });

        await tx.securityLog.create({
          data: {
            action: `Collection Created: ${coll.name}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return coll;
      });
    } catch (dbError) {
      console.warn('⚠️ Database write failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const collections = fallbackDb.getCollection('collections');
      if (collections.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        return NextResponse.json(
          { error: 'Collection with name already exists' },
          { status: 400 }
        );
      }

      const collId = randomUUID();
      const collObj = {
        ...data,
        id: collId,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      collections.push(collObj);
      fallbackDb.saveCollection('collections', collections);

      // Log Security
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Collection Created (Fallback): ${data.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      newCollection = collObj;
    }

    return NextResponse.json({ success: true, collection: newCollection }, { status: 201 });

  } catch (err: any) {
    console.error('Collection POST error:', err);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
