import Hero from "@/components/sections/Hero/Hero";
import Collection from "@/components/sections/Collection/Collection";
import Gallery from "@/components/sections/Gallery/Gallery";
import FAQ from "@/components/sections/FAQ/FAQ";
import { getDbCategories } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const dbCategories = await getDbCategories();

  return (
    <main className="relative">
      <Hero />
      <Collection initialCategories={dbCategories} />
      <Gallery />
      <FAQ />
    </main>
  );
}