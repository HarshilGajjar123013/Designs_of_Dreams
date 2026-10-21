import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@dod/database';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
      const conditions: any[] = [{ status: 'ACTIVE' }];

      if (category && category !== 'All') {
        conditions.push({
          OR: [
            { category: { is: { name: { contains: category, mode: 'insensitive' } } } },
            { subCategory: { contains: category, mode: 'insensitive' } }
          ]
        });
      }

      if (search && search.trim()) {
        const s = search.trim();
        conditions.push({
          OR: [
            { name: { contains: s, mode: 'insensitive' } },
            { description: { contains: s, mode: 'insensitive' } },
            { subCategory: { contains: s, mode: 'insensitive' } },
            { fabric: { contains: s, mode: 'insensitive' } },
            { category: { is: { name: { contains: s, mode: 'insensitive' } } } }
          ]
        });
      }

      const where: any = conditions.length === 1 ? conditions[0] : { AND: conditions };

      const dbProducts = await prisma.product.findMany({
        where,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          collection: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        return NextResponse.json({ success: true, products: dbProducts });
      }
      if (Array.isArray(dbProducts) && ((category && category !== 'All') || (search && search.trim()))) {
        return NextResponse.json({ success: true, products: [] });
      }
    } catch (dbErr) {
      console.warn('Prisma query warning, falling back to fallbackDb:', dbErr);
      const fbProducts = fallbackDb.getCollection('products');
      const categories = fallbackDb.getCollection('categories');
      const collections = fallbackDb.getCollection('collections');

      let mapped = fbProducts
        .filter((p: any) => p.status === 'ACTIVE')
        .map((p: any) => {
          const cat = categories.find((c: any) => c.id === p.categoryId);
          const coll = collections.find((c: any) => c.id === p.collectionId);
          return {
            ...p,
            category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
            collection: coll ? { id: coll.id, name: coll.name, slug: coll.slug } : null,
          };
        });

      if (category && category !== 'All') {
        const catLower = category.toLowerCase();
        mapped = mapped.filter((p: any) => {
          const catName = (p.category?.name || '').toLowerCase();
          const subCat = (p.subCategory || '').toLowerCase();
          return catName.includes(catLower) || subCat.includes(catLower);
        });
      }

      if (search && search.trim()) {
        const sLower = search.trim().toLowerCase();
        mapped = mapped.filter((p: any) => {
          const name = (p.name || p.title || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const catName = (p.category?.name || '').toLowerCase();
          const subCat = (p.subCategory || '').toLowerCase();
          const fabric = (p.fabric || '').toLowerCase();
          return (
            name.includes(sLower) ||
            desc.includes(sLower) ||
            catName.includes(sLower) ||
            subCat.includes(sLower) ||
            fabric.includes(sLower)
          );
        });
      }

      return NextResponse.json({ success: true, products: mapped.slice(0, limit) });
    }

    return NextResponse.json({ success: true, products: [] });
  } catch (error) {
    console.error('API products error:', error);
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}
