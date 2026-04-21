import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getCollection } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ sort?: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const cat = await getCategoryBySlug(slug);
    return {
      title: cat.name,
      description: `Shop ${cat.name} at Zack Wears.`,
      alternates: { canonical: `/collections/${slug}` },
    };
  } catch {
    return { title: "Collection" };
  }
}

export default async function CollectionPage(props: Props) {
  const { slug } = await props.params;
  const sp = (await props.searchParams) ?? {};
  const sort = sp.sort || "bestselling";

  let data: Awaited<ReturnType<typeof getCollection>>;
  try {
    data = await getCollection(slug, sort);
  } catch {
    notFound();
  }
  const { category, products } = data;

  return (
    <main className="container" style={{ paddingTop: "0.5rem", paddingBottom: "3rem" }}>
      <div className="toolbar">
        <div>
          <h1 className="collection-title">{category.name}</h1>
          <p className="collection-count">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <form method="get" className="sort-row">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" className="sort-select" defaultValue={sort}>
            <option value="bestselling">Best selling</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
          <button type="submit" className="btn secondary btn-compact">
            Apply
          </button>
        </form>
      </div>

      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} collectionSlug={category.slug} />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="muted" style={{ maxWidth: 520 }}>
          No products in this collection. In the admin, set the product category to <strong>{category.name}</strong> and
          enable <strong>Published</strong>, then open this page again (updates appear immediately).
        </p>
      ) : null}

      <p style={{ marginTop: "2.5rem" }}>
        <Link href="/" className="muted" style={{ fontSize: "0.88rem" }}>
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
