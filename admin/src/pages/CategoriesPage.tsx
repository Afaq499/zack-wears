import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import type { Category } from "../types";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api<Category[]>("/api/categories");
    setItems(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name, slug: slug.trim() || undefined, sortOrder: 0 }),
      });
      setName("");
      setSlug("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    setError(null);
    try {
      await api(`/api/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Categories</h1>
      <p className="muted">Create slugs like <code>men</code>, <code>woman</code>, <code>kids</code> for storefront URLs.</p>

      <form className="card stack" onSubmit={onCreate}>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div className="stack" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="stack" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="slug">Slug (optional)</label>
            <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
          </div>
          <button className="btn" type="submit">
            Add
          </button>
        </div>
      </form>

      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>
                  <span className="pill">{c.slug}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="btn danger" onClick={() => remove(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
