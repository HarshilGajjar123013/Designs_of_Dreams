import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { categorySchema } from '@/lib/validators';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    let categories = [];
    let databaseConnected = true;

    try {
      categories = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      categories = fallbackDb.getCollection('categories');
      categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    return NextResponse.json({ success: true, categories });

  } catch (err: any) {
    console.error('Categories GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve categories' },
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
    const validation = categorySchema.safeParse(body);
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
    let newCategory = null;

    try {
      newCategory = await prisma.$transaction(async (tx: any) => {
        const cat = await tx.category.create({
          data: { ...data, slug }
        });

        await tx.securityLog.create({
          data: {
            action: `Category Created: ${cat.name}`,
            adminName: `Admin ID: ${userId}`,
            role: userRole,
            status: 'SUCCESS',
          }
        });

        return cat;
      });
    } catch (dbError) {
      console.warn('⚠️ Database write failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const categories = fallbackDb.getCollection('categories');
      if (categories.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        return NextResponse.json(
          { error: 'Category with name already exists' },
          { status: 400 }
        );
      }

      const catId = randomUUID();
      const catObj = {
        ...data,
        id: catId,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      categories.push(catObj);
      fallbackDb.saveCollection('categories', categories);

      // Log Security
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Category Created (Fallback): ${data.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS',
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      newCategory = catObj;
    }

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });

  } catch (err: any) {
    console.error('Category POST error:', err);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
