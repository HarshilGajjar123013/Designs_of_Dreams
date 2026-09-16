import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { categorySchema } from '@/lib/validators';
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
    const validation = categorySchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    let databaseConnected = true;
    let updatedCategory = null;

    try {
      updatedCategory = await prisma.$transaction(async (tx: any) => {
        const dataToUpdate: any = { ...data };
        if (data.name) {
          dataToUpdate.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        }

        const cat = await tx.category.update({
          where: { id },
          data: dataToUpdate
        });

        await tx.securityLog.create({
          data: {
            action: `Category Updated: ${cat.name}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return cat;
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const categories = fallbackDb.getCollection('categories');
      const idx = categories.findIndex(c => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      const current = categories[idx];
      const slug = data.name
        ? data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : current.slug;

      const catObj = {
        ...current,
        ...data,
        slug,
        updatedAt: new Date().toISOString(),
      };

      categories[idx] = catObj;
      fallbackDb.saveCollection('categories', categories);

      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Category Updated (Fallback): ${catObj.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      updatedCategory = catObj;
    }

    return NextResponse.json({ success: true, category: updatedCategory });

  } catch (err: any) {
    console.error('Category PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update category' },
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
    let deletedCategory = null;

    try {
      // Check if there are active products in this category before deleting
      const productsCount = await prisma.product.count({
        where: { categoryId: id, status: { not: 'ARCHIVED' } }
      });

      if (productsCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete category with active products. Reassign or delete products first.' },
          { status: 400 }
        );
      }

      deletedCategory = await prisma.$transaction(async (tx: any) => {
        const cat = await tx.category.delete({
          where: { id }
        });

        await tx.securityLog.create({
          data: {
            action: `Category Deleted: ${cat.name}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return cat;
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const categories = fallbackDb.getCollection('categories');
      const products = fallbackDb.getCollection('products');

      const idx = categories.findIndex(c => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      const activeProductsInCat = products.filter(p => p.categoryId === id && p.status !== 'ARCHIVED');
      if (activeProductsInCat.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete category with active products. Reassign or delete products first.' },
          { status: 400 }
        );
      }

      const current = categories[idx];
      categories.splice(idx, 1);
      fallbackDb.saveCollection('categories', categories);

      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Category Deleted (Fallback): ${current.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      deletedCategory = current;
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully', category: deletedCategory });

  } catch (err: any) {
    console.error('Category DELETE error:', err);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
