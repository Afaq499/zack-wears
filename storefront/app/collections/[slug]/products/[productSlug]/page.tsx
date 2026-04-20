import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import HomeProductTile from "@/components/HomeProductTile";
import ProductGallery from "@/components/ProductGallery";
import { getCollection, getProductBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; productSlug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, productSlug } = await props.params;
  try {
    const p = await getProductBySlug(productSlug);
    const desc = (p.description || "").slice(0, 160);
    return {
      title: p.name,
      description: desc || `Buy ${p.name} at Zack Wears.`,
      alternates: { canonical: `/collections/${slug}/products/${productSlug}` },
      openGraph: {
        title: p.name,
        description: desc,
        images: p.images[0] ? [{ url: p.images[0] }] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage(props: Props) {
  const { slug, productSlug } = await props.params;
  let product: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    product = await getProductBySlug(productSlug);
  } catch {
    notFound();
  }

  const sale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const save = sale ? product.compareAtPrice! - product.price : 0;

  let moreProducts: Awaited<ReturnType<typeof getCollection>>["products"] = [];
  try {
    const col = await getCollection(slug, "bestselling");
    moreProducts = col.products.filter((p) => p.slug !== product.slug).slice(0, 12);
  } catch {
    // ignore (still render product page)
  }

  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <p style={{ marginTop: 0 }}>
        <Link href={`/collections/${slug}`} className="muted">
          ← Back to collection
        </Link>
      </p>

      <div className="product-layout">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <h1 style={{ marginTop: 0, fontSize: "clamp(1.4rem, 2.4vw, 2rem)" }}>{product.name}</h1>
          <div className="price" style={{ fontSize: "1.1rem" }}>
            {sale ? <span className="was">Rs. {product.compareAtPrice}</span> : null}
            <span>Rs. {product.price}</span>
          </div>
          {sale ? (
            <p style={{ color: "#b00020", margin: "0.35rem 0 0", fontWeight: 650 }}>Save Rs. {save}</p>
          ) : null}
          <p className="muted" style={{ marginTop: "0.75rem" }}>Shipping calculated at checkout.</p>

          {product.description ? (
            <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>{product.description}</div>
          ) : null}

          <AddToCart product={product} collectionSlug={slug} />
        </div>
      </div>

      {moreProducts.length ? (
        <section className="home-section" style={{ marginTop: "2.5rem" }} aria-label="Keep shopping">
          <div className="home-section-head">
            <h2 className="home-section-title">YOU MAY ALSO LIKE</h2>
            <Link href={`/collections/${slug}`} className="home-section-all">
              View all
            </Link>
          </div>
          <div className="home-scroll">
            {moreProducts.map((p) => (
              <HomeProductTile key={p._id} product={p} collectionSlug={slug} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
