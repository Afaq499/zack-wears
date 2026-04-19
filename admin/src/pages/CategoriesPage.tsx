import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { Category } from "../types";

function parentLabel(items: Category[], parentId: string | null | undefined) {
  if (!parentId) return "—";
  const p = items.find((x) => x._id === parentId);
  return p ? p.name : parentId;
}

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const rootCategories = useMemo(() => items.filter((c) => !c.parent), [items]);

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
        body: JSON.stringify({
          name,
          slug: slug.trim() || undefined,
          sortOrder: 0,
          parent: parentId || null,
        }),
      });
      setName("");
      setSlug("");
      setParentId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Child categories must be removed first.")) return;
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
      <p className="muted">
        <strong>Main categories</strong> have no parent. <strong>Subcategories</strong> choose a main category as parent — they appear in the storefront mega menu and
        get their own URL <code>/collections/your-sub-slug</code>.
      </p>

      <form className="card stack" onSubmit={onCreate}>
        <div className="row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="stack" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="stack" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="slug">Slug (optional)</label>
            <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
          </div>
          <div className="stack" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="parent">Parent (optional)</label>
            <select id="parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">None — main category</option>
              {rootCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  Under: {c.name}
                </option>
              ))}
            </select>
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
              <th>Parent</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.parent ? `↳ ${c.name}` : c.name}</td>
                <td>
                  <span className="pill">{c.slug}</span>
                </td>
                <td className="muted">{parentLabel(items, c.parent)}</td>
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
