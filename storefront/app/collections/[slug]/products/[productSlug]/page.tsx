import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import { getProductBySlug } from "@/lib/api";

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

  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <p style={{ marginTop: 0 }}>
        <Link href={`/collections/${slug}`} className="muted">
          ← Back to collection
        </Link>
      </p>

      <div className="product-layout">
        <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: "0.75rem", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {product.images.slice(0, 4).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", border: "1px solid var(--border)" }}
              />
            ))}
          </div>
          <div style={{ aspectRatio: "4 / 5", background: "#f4f4f4", border: "1px solid var(--border)" }}>
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>
        </div>

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
    </main>
  );
}
