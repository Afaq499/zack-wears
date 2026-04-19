import type { Category, CollectionResponse, Product } from "./types";

const base = () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${base()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function getCategories() {
  return getJson<Category[]>("/api/categories");
}

export function getCategoryBySlug(slug: string) {
  return getJson<Category>(`/api/categories/by-slug/${encodeURIComponent(slug)}`);
}

export function getCollection(slug: string, sort?: string) {
  const q = sort ? `?sort=${encodeURIComponent(sort)}` : "";
  return getJson<CollectionResponse>(`/api/products/collection/${encodeURIComponent(slug)}${q}`);
}

export function getProductBySlug(slug: string) {
  return getJson<Product>(`/api/products/by-slug/${encodeURIComponent(slug)}`);
}
