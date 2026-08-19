import React, { Suspense } from "react";
import CollectionCatalog from "@/app/collection/CollectionCatalog";
import { getDbProducts } from "@/lib/db";

export default async function CollectionPage() {
  const dbProducts = await getDbProducts();
  
  const mappedProducts = dbProducts.map((p: any) => ({
    id: p.id,
    title: p.name,
    subtitle: p.fabric || p.subCategory || '',
    category: (p.category as any)?.name || 'Saree',
    subcategory: p.subCategory,
    desc: p.description,
    longDesc: p.description,
    price: p.sellingPrice,
    mrp: p.mrp,
    discountPercent: p.discount,
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600',
    badge: p.featured ? "Featured" : p.newArrival ? "New Arrival" : p.bestSeller ? "Best Seller" : "",
    fabrics: [p.fabric],
    features: p.features || [],
    sizes: p.sizes || ['Free Size'],
    rating: p.rating || 5.0,
    images: p.images || []
  }));

  return (
    <main className="relative pt-25 bg-white min-h-screen">
      {/* Decorative Jali Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} 
      />

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CollectionCatalog initialProducts={mappedProducts} />
      </Suspense>
    </main>
  );
}
