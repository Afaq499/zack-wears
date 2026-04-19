import Link from "next/link";
import type { Product } from "@/lib/types";

function fmtRs(n: number) {
  return `Rs.${n.toLocaleString("en-PK")}`;
}

export default function HomeProductTile({
  product,
  collectionSlug,
}: {
  product: Product;
  collectionSlug: string;
}) {
  const img = product.images[0];
  const sale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const save = sale ? product.compareAtPrice! - product.price : 0;
  const href = `/collections/${collectionSlug}/products/${product.slug}`;

  return (
    <article className="home-tile">
      <Link href={href} className="home-tile-link">
        <div className="home-tile-img-wrap">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.name} className="home-tile-img" />
          ) : (
            <div className="home-tile-ph" />
          )}
          {sale ? <span className="home-tile-badge">Sale</span> : null}
        </div>
        <div className="home-tile-body">
          <div className="home-tile-title">{product.name}</div>
          <div className="home-tile-prices">
            {sale ? <span className="home-tile-was">{fmtRs(product.compareAtPrice!)}</span> : null}
            <span className="home-tile-now">{fmtRs(product.price)}</span>
            {sale ? <span className="home-tile-save">Save {fmtRs(save)}</span> : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
