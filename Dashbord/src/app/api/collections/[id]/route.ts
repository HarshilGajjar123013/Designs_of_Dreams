import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { collectionSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { id } = await params;
    const userRole = session!.role;
    const userId = session!.id;

    const body = await req.json();
    const validation = collectionSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    let databaseConnected = true;
    let updatedCollection = null;

    try {
      updatedCollection = await prisma.$transaction(async (tx: any) => {
        const dataToUpdate: any = { ...data };
        if (data.name) {
          dataToUpdate.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        }

        if (data.startDate !== undefined) {
          dataToUpdate.startDate = data.startDate ? new Date(data.startDate) : null;
        }
        if (data.endDate !== undefined) {
          dataToUpdate.endDate = data.endDate ? new Date(data.endDate) : null;
        }

        const coll = await tx.collection.update({
          where: { id },
          data: dataToUpdate
        });

        await tx.securityLog.create({
          data: {
            action: `Collection Updated: ${coll.name}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return coll;
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const collections = fallbackDb.getCollection('collections');
      const idx = collections.findIndex(c => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      const current = collections[idx];
      const slug = data.name
        ? data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : current.slug;

      const collObj = {
        ...current,
        ...data,
        slug,
        updatedAt: new Date().toISOString(),
      };

      collections[idx] = collObj;
      fallbackDb.saveCollection('collections', collections);

      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Collection Updated (Fallback): ${collObj.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      updatedCollection = collObj;
    }

    return NextResponse.json({ success: true, collection: updatedCollection });

  } catch (err: any) {
    console.error('Collection PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const { id } = await params;
    const userRole = session!.role;
    const userId = session!.id;

    let databaseConnected = true;
    let deletedCollection = null;

    try {
      deletedCollection = await prisma.$transaction(async (tx: any) => {
        // Soft unlink collection from products
        await tx.product.updateMany({
          where: { collectionId: id },
          data: { collectionId: null }
        });

        const coll = await tx.collection.delete({
          where: { id }
        });

        await tx.securityLog.create({
          data: {
            action: `Collection Deleted: ${coll.name}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return coll;
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const collections = fallbackDb.getCollection('collections');
      const products = fallbackDb.getCollection('products');

      const idx = collections.findIndex(c => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
      }

      const current = collections[idx];

      // Unlink products in fallback
      products.forEach(p => {
        if (p.collectionId === id) {
          p.collectionId = null;
        }
      });
      fallbackDb.saveCollection('products', products);

      collections.splice(idx, 1);
      fallbackDb.saveCollection('collections', collections);

      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Collection Deleted (Fallback): ${current.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      deletedCollection = current;
    }

    return NextResponse.json({ success: true, message: 'Collection deleted successfully', collection: deletedCollection });

  } catch (err: any) {
    console.error('Collection DELETE error:', err);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
