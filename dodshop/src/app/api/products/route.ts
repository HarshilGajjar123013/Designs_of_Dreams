import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@dod/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
      const where: any = { status: 'ACTIVE' };
      if (category && category !== 'All') {
        where.OR = [
          { category: { is: { name: { contains: category, mode: 'insensitive' } } } },
          { subCategory: { contains: category, mode: 'insensitive' } }
        ];
      }

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
      if (Array.isArray(dbProducts) && category && category !== 'All') {
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

      return NextResponse.json({ success: true, products: mapped.slice(0, limit) });
    }

    return NextResponse.json({ success: true, products: [] });
  } catch (error) {
    console.error('API products error:', error);
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}
