import Link from "next/link";
import { getCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <main className="container" style={{ padding: "2.25rem 0 3.5rem" }}>
      <p className="muted" style={{ textAlign: "center", fontSize: "0.78rem", letterSpacing: "0.18em", margin: "0 0 1rem" }}>
        NEW SEASON
      </p>
      <h1
        style={{
          textAlign: "center",
          fontSize: "clamp(1.5rem, 3.2vw, 2.25rem)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          margin: "0 0 0.75rem",
        }}
      >
        SHOP COLLECTIONS
      </h1>
      <p className="muted" style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 2rem", fontSize: "0.92rem" }}>
        Pick a category below. Products must be <strong>published</strong> and assigned to that category in admin.
      </p>

      <div className="grid">
        {categories.map((c) => (
          <Link key={c._id} href={`/collections/${c.slug}`} className="product-tile product-tile-link">
            <div className="product-tile-img-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "0.15em", color: "#bbb" }}>{c.name.slice(0, 1)}</span>
            </div>
            <div className="product-tile-meta">
              <div className="product-tile-title">{c.name}</div>
              <div className="product-tile-price muted" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
                View collection
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
