import Link from "next/link";
import { getCategories } from "@/lib/api";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <main className="container" style={{ padding: "2rem 0 3rem" }}>
      <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", margin: "0 0 0.5rem" }}>New arrivals</h1>
      <p className="muted" style={{ maxWidth: 640, marginTop: 0 }}>
        Browse collections for men, women, and kids. Product pages are server-rendered with clean URLs for SEO.
      </p>

      <div className="grid" style={{ marginTop: "1.5rem" }}>
        {categories.map((c) => (
          <Link key={c._id} href={`/collections/${c.slug}`} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontWeight: 800, letterSpacing: "0.06em" }}>{c.name}</div>
            <div className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              Shop /collections/{c.slug}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
