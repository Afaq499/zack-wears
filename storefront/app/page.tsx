import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import { getCategories } from "@/lib/api";
import { buildNavTree } from "@/lib/navTree";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  const { roots } = buildNavTree(categories);

  return (
    <>
      <HeroCarousel />
      <main className="container" style={{ padding: "2.5rem 0 3.5rem" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            margin: "0 0 1.5rem",
          }}
        >
          SHOP BY COLLECTION
        </h2>
        <div className="grid">
          {roots.length > 0
            ? roots.map((c) => (
                <Link key={c._id} href={`/collections/${c.slug}`} className="product-tile product-tile-link">
                  <div
                    className="product-tile-img-wrap"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}
                  >
                    <span style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "0.12em", color: "#ccc" }}>
                      {c.name.slice(0, 1)}
                    </span>
                  </div>
                  <div className="product-tile-meta">
                    <div className="product-tile-title">{c.name}</div>
                    <div className="product-tile-price muted" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
                      View all
                    </div>
                  </div>
                </Link>
              ))
            : categories.map((c) => (
                <Link key={c._id} href={`/collections/${c.slug}`} className="product-tile product-tile-link">
                  <div
                    className="product-tile-img-wrap"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}
                  >
                    <span style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "0.12em", color: "#ccc" }}>
                      {c.name.slice(0, 1)}
                    </span>
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
        <p className="muted" style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.88rem", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Use the menu above: hover a main category to open subcategories, or click through to product lists. Assign a <strong>main category</strong> and optional{" "}
          <strong>subcategory</strong> when editing products in admin.
        </p>
      </main>
    </>
  );
}
