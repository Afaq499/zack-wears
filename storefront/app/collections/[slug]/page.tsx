import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getCollection } from "@/lib/api";

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
  const sort = sp.sort || "newest";

  let data: Awaited<ReturnType<typeof getCollection>>;
  try {
    data = await getCollection(slug, sort);
  } catch {
    notFound();
  }
  const { category, products } = data;

  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <div className="toolbar">
        <div>
          <h1 style={{ margin: 0 }}>{category.name}</h1>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <form method="get" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label className="muted" htmlFor="sort" style={{ fontSize: 14 }}>
            Sort
          </label>
          <select id="sort" name="sort" defaultValue={sort}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <button className="btn secondary" type="submit">
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
        <p className="muted">
          No products yet. Publish products in the admin portal for this category.
        </p>
      ) : null}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/" className="muted">
          ← Continue shopping
        </Link>
      </p>
    </main>
  );
}
