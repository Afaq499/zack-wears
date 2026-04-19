import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import HomeProductTile from "./HomeProductTile";

export default function HomeCategorySection({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="home-section" aria-labelledby={`home-sec-${category._id}`}>
      <div className="home-section-head">
        <h2 id={`home-sec-${category._id}`} className="home-section-title">
          {category.name.toUpperCase()}
        </h2>
        <Link href={`/collections/${category.slug}`} className="home-section-all">
          View all
        </Link>
      </div>
      <div className="home-scroll">
        {products.map((p) => (
          <HomeProductTile key={p._id} product={p} collectionSlug={category.slug} />
        ))}
      </div>
    </section>
  );
}
