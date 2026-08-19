import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@dod/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '6');

    try {
      const where: any = { status: 'ACTIVE' };
      if (category) {
        where.OR = [
          { category: { is: { name: { contains: category, mode: 'insensitive' } } } },
          { subCategory: { contains: category, mode: 'insensitive' } }
        ];
      }

      const dbProducts = await prisma.product.findMany({
        where,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          collection: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (dbProducts && dbProducts.length > 0) {
        return NextResponse.json({ success: true, products: dbProducts });
      }
    } catch (dbErr) {
      console.warn('Prisma query warning, falling back to fallbackDb:', dbErr);
    }

    // Fallback to local JSON fallback database
    const fbProducts = fallbackDb.getCollection('products');
    return NextResponse.json({ success: true, products: fbProducts.slice(0, limit) });
  } catch (error) {
    console.error('API products error:', error);
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}
