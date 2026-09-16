import { prisma, fallbackDb } from '@dod/database';

export { prisma, fallbackDb };

export async function getDbProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collection: { select: { id: true, name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (err) {
    console.warn('⚠️ Website: Database query failed, using fallback JSON DB.');
    const products = fallbackDb.getCollection('products');
    const categories = fallbackDb.getCollection('categories');
    const collections = fallbackDb.getCollection('collections');
    
    return products
      .filter(p => p.status === 'ACTIVE')
      .map(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        const coll = collections.find(c => c.id === p.collectionId);
        return {
          ...p,
          category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
          collection: coll ? { id: coll.id, name: coll.name, slug: coll.slug } : null,
        };
      });
  }
}

export async function getDbProductById(idOrSlug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collection: { select: { id: true, name: true, slug: true } }
      }
    });
    return product;
  } catch (err) {
    console.warn(`⚠️ Website: Database query failed for ${idOrSlug}, using fallback JSON DB.`);
    const products = fallbackDb.getCollection('products');
    const categories = fallbackDb.getCollection('categories');
    const collections = fallbackDb.getCollection('collections');
    
    const p = products.find(prod => prod.id === idOrSlug || prod.slug === idOrSlug);
    if (!p) return null;
    
    const cat = categories.find(c => c.id === p.categoryId);
    const coll = collections.find(c => c.id === p.collectionId);
    return {
      ...p,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      collection: coll ? { id: coll.id, name: coll.name, slug: coll.slug } : null,
    };
  }
}

export async function getDbCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            subCategory: true,
            fabric: true,
            occasion: true,
            images: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return categories.map((c: any) => {
      const subcategories = Array.from(
        new Set(
          (c.products || [])
            .map((p: any) => p.subCategory)
            .filter(Boolean)
        )
      );
      const fabrics = Array.from(
        new Set(
          (c.products || [])
            .map((p: any) => p.fabric)
            .filter(Boolean)
        )
      );
      const firstImage = (c.products || []).find((p: any) => p.images && p.images.length > 0)?.images?.[0];

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image || firstImage || null,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        productCount: (c.products || []).length,
        subcategories,
        fabrics
      };
    });
  } catch (err) {
    console.warn('⚠️ Website: Database category query failed, using fallback JSON DB.');
    const categories = fallbackDb.getCollection('categories');
    const products = fallbackDb.getCollection('products');

    return categories
      .filter((c: any) => c.isActive !== false)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((c: any) => {
        const catProds = products.filter(
          (p: any) => p.categoryId === c.id && p.status === 'ACTIVE'
        );
        const subcategories = Array.from(
          new Set(catProds.map((p: any) => p.subCategory).filter(Boolean))
        );
        const fabrics = Array.from(
          new Set(catProds.map((p: any) => p.fabric).filter(Boolean))
        );
        const firstImage = catProds.find((p: any) => p.images && p.images.length > 0)?.images?.[0];

        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image || firstImage || null,
          sortOrder: c.sortOrder || 0,
          isActive: c.isActive !== false,
          productCount: catProds.length,
          subcategories,
          fabrics
        };
      });
  }
}

