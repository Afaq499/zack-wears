import Link from "next/link";
import type { Product } from "@/lib/types";

function firstImage(p: Product) {
  return p.images[0];
}

function isSoldOut(p: Product) {
  if (!p.variants?.length) return false;
  const total = p.variants.reduce((n, v) => n + (v.stock || 0), 0);
  return total <= 0;
}

function onSale(p: Product) {
  return p.compareAtPrice != null && p.compareAtPrice > p.price;
}

export default function ProductCard({ product, collectionSlug }: { product: Product; collectionSlug: string }) {
  const img = firstImage(product);
  const soldOut = isSoldOut(product);
  const sale = onSale(product);
  const href = `/collections/${collectionSlug}/products/${product.slug}`;

  return (
    <article className="card" style={{ position: "relative" }}>
      <Link href={href} style={{ display: "block" }}>
        <div style={{ aspectRatio: "1 / 1", background: "#f4f4f4" }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
        </div>
        <div className="meta">
          <div style={{ fontWeight: 650 }}>{product.name}</div>
          <div className="price" style={{ marginTop: 6 }}>
            {sale ? <span className="was">Rs. {product.compareAtPrice}</span> : null}
            <span>Rs. {product.price}</span>
          </div>
        </div>
      </Link>
      {soldOut ? (
        <span className="badge" style={{ background: "#666" }}>
          Sold out
        </span>
      ) : sale ? (
        <span className="badge">Sale</span>
      ) : null}
    </article>
  );
}
