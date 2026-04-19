import HeroCarousel from "@/components/HeroCarousel";
import HomeCategorySection from "@/components/HomeCategorySection";
import { getCategories, getCollection } from "@/lib/api";
import { buildNavTree } from "@/lib/navTree";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_SECTION = 5;

export default async function HomePage() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  const { roots: treeRoots } = buildNavTree(categories);
  const roots = treeRoots.length > 0 ? treeRoots : categories;

  const sections: { category: Category; products: Product[] }[] = [];
  for (const cat of roots) {
    try {
      const { products } = await getCollection(cat.slug, "bestselling");
      sections.push({ category: cat, products: products.slice(0, PRODUCTS_PER_SECTION) });
    } catch {
      sections.push({ category: cat, products: [] });
    }
  }

  const visible = sections.filter((s) => s.products.length > 0);

  return (
    <>
      <HeroCarousel />
      <main className="home-feed">
        {visible.length === 0 ? (
          <div className="container muted" style={{ padding: "2rem 1.35rem", textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <p style={{ marginTop: 0 }}>
              No published products yet. Add products in the admin, assign them to a <strong>main category</strong>, and publish them — they will appear here in
              rows of five per category.
            </p>
          </div>
        ) : (
          visible.map((s) => <HomeCategorySection key={s.category._id} category={s.category} products={s.products} />)
        )}
      </main>
    </>
  );
}
