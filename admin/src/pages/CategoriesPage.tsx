import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { Category } from "../types";

function parentKey(c: Category): string | null {
  const p = c.parent;
  if (p == null) return null;
  return typeof p === "object" && p && "_id" in p ? String((p as { _id: string })._id) : String(p);
}

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [mainName, setMainName] = useState("");
  const [mainSlug, setMainSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");

  const rootCategories = useMemo(() => {
    return items
      .filter((c) => !parentKey(c))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
  }, [items]);

  const childrenOf = useMemo(() => {
    const m = new Map<string, Category[]>();
    for (const c of items) {
      const pk = parentKey(c);
      if (!pk) continue;
      if (!m.has(pk)) m.set(pk, []);
      m.get(pk)!.push(c);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
    }
    return m;
  }, [items]);

  const load = useCallback(async () => {
    const data = await api<Category[]>("/api/categories");
    setItems(data);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [load]);

  const isOpen = (rootId: string) => !collapsed.has(rootId);

  function toggleRoot(rootId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  }

  async function onCreateMain(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: mainName,
          slug: mainSlug.trim() || undefined,
          sortOrder: 0,
          parent: null,
        }),
      });
      setMainName("");
      setMainSlug("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function onCreateSub(e: FormEvent, parentId: string) {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: subName,
          slug: subSlug.trim() || undefined,
          sortOrder: 0,
          parent: parentId,
        }),
      });
      setSubName("");
      setSubSlug("");
      setAddingUnder(null);
      setCollapsed((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
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

  async function moveSubcategory(childId: string, newParentId: string) {
    setError(null);
    try {
      await api(`/api/categories/${childId}`, {
        method: "PATCH",
        body: JSON.stringify({ parent: newParentId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Move failed");
    }
  }

  async function reorderSub(rootId: string, child: Category, dir: -1 | 1) {
    const siblings = [...(childrenOf.get(rootId) ?? [])];
    const idx = siblings.findIndex((s) => s._id === child._id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= siblings.length) return;
    const a = siblings[idx];
    const b = siblings[j];
    const soA = a.sortOrder ?? 0;
    const soB = b.sortOrder ?? 0;
    setError(null);
    try {
      await api(`/api/categories/${a._id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: soB }) });
      await api(`/api/categories/${b._id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: soA }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reorder failed");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Categories</h1>
      <p className="muted">
        Main categories expand to show their subcategories. Use <strong>Add subcategory</strong> under a main category, or{" "}
        <strong>Move to</strong> to reassign a sub to another main category.
      </p>

      <form className="card stack" onSubmit={onCreateMain}>
        <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Add main category</div>
        <div className="row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="stack" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="mainName">Name</label>
            <input id="mainName" value={mainName} onChange={(e) => setMainName(e.target.value)} required />
          </div>
          <div className="stack" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="mainSlug">Slug (optional)</label>
            <input id="mainSlug" value={mainSlug} onChange={(e) => setMainSlug(e.target.value)} placeholder="auto from name" />
          </div>
          <button className="btn" type="submit">
            Add main category
          </button>
        </div>
      </form>

      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

      <div style={{ marginTop: "1.25rem" }}>
        {rootCategories.length === 0 ? (
          <p className="muted">No main categories yet. Add one above.</p>
        ) : (
          rootCategories.map((root) => {
            const kids = childrenOf.get(root._id) ?? [];
            const open = isOpen(root._id);
            return (
              <div key={root._id} className="cat-acc">
                <button type="button" className="cat-acc-head" onClick={() => toggleRoot(root._id)} aria-expanded={open}>
                  <span className={`cat-acc-chev ${open ? "is-open" : ""}`} aria-hidden>
                    ▸
                  </span>
                  <span className="cat-acc-title">{root.name}</span>
                  <span className="pill">{root.slug}</span>
                  <span className="cat-acc-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => {
                        setAddingUnder((u) => (u === root._id ? null : root._id));
                        setSubName("");
                        setSubSlug("");
                        setCollapsed((prev) => {
                          const next = new Set(prev);
                          next.delete(root._id);
                          return next;
                        });
                      }}
                    >
                      {addingUnder === root._id ? "Close form" : "Add subcategory"}
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      disabled={kids.length > 0}
                      title={kids.length > 0 ? "Delete subcategories first" : undefined}
                      onClick={() => remove(root._id)}
                    >
                      Delete
                    </button>
                  </span>
                </button>

                {addingUnder === root._id ? (
                  <form className="cat-inline-form" onSubmit={(e) => onCreateSub(e, root._id)}>
                    <div className="stack" style={{ minWidth: 160 }}>
                      <label htmlFor={`subn-${root._id}`}>Subcategory name</label>
                      <input id={`subn-${root._id}`} value={subName} onChange={(e) => setSubName(e.target.value)} required placeholder="e.g. T-Shirts" />
                    </div>
                    <div className="stack" style={{ minWidth: 160 }}>
                      <label htmlFor={`subs-${root._id}`}>Slug (optional)</label>
                      <input id={`subs-${root._id}`} value={subSlug} onChange={(e) => setSubSlug(e.target.value)} placeholder="auto from name" />
                    </div>
                    <button className="btn" type="submit">
                      Save subcategory
                    </button>
                    <button type="button" className="btn secondary" onClick={() => setAddingUnder(null)}>
                      Cancel
                    </button>
                  </form>
                ) : null}

                {open ? (
                  <div className="cat-acc-body">
                    {kids.length === 0 ? (
                      <p className="muted" style={{ margin: "0.5rem 1rem", fontSize: "0.88rem" }}>
                        No subcategories yet. Use <strong>Add subcategory</strong>.
                      </p>
                    ) : (
                      kids.map((ch, idx) => (
                        <div key={ch._id} className="cat-sub-row">
                          <span className="cat-sub-name">└ {ch.name}</span>
                          <span className="pill">{ch.slug}</span>
                          <select
                            aria-label={`Move ${ch.name} to`}
                            value={root._id}
                            onChange={(e) => moveSubcategory(ch._id, e.target.value)}
                          >
                            {rootCategories.map((r) => (
                              <option key={r._id} value={r._id}>
                                Move to: {r.name}
                              </option>
                            ))}
                          </select>
                          <span className="row" style={{ gap: 4 }}>
                            <button
                              type="button"
                              className="btn secondary"
                              style={{ padding: "0.35rem 0.5rem" }}
                              disabled={idx === 0}
                              title="Move up"
                              onClick={() => reorderSub(root._id, ch, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="btn secondary"
                              style={{ padding: "0.35rem 0.5rem" }}
                              disabled={idx === kids.length - 1}
                              title="Move down"
                              onClick={() => reorderSub(root._id, ch, 1)}
                            >
                              ↓
                            </button>
                          </span>
                          <button type="button" className="btn danger" onClick={() => remove(ch._id)}>
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
