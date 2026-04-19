import type { MetadataRoute } from "next";
import { getCategories, getCollection } from "@/lib/api";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [{ url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 }];

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    return entries;
  }

  for (const c of categories) {
    entries.push({
      url: `${base}/collections/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    try {
      const { products } = await getCollection(c.slug);
      for (const p of products) {
        entries.push({
          url: `${base}/collections/${c.slug}/products/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.65,
        });
      }
    } catch {
      // ignore per-collection failures
    }
  }

  return entries;
}
