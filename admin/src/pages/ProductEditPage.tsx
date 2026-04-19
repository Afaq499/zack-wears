import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Category, Product, ProductVariant } from "../types";

const emptyVariant = (): ProductVariant => ({ size: "", color: "", stock: 0 });

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [compareAt, setCompareAt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([emptyVariant()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Category[]>("/api/categories").then((c) => {
      setCategories(c);
      if (!categoryId && c[0]) setCategoryId(c[0]._id);
    });
  }, []);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const all = await api<Product[]>("/api/products");
        const p = all.find((x) => x._id === id);
        if (!p) {
          setError("Product not found");
          return;
        }
        setName(p.name);
        setSlug(p.slug);
        setDescription(p.description);
        setPrice(String(p.price));
        setCompareAt(p.compareAtPrice != null ? String(p.compareAtPrice) : "");
        const cid = typeof p.category === "object" && p.category ? p.category._id : String(p.category);
        setCategoryId(cid);
        setPublished(p.published);
        setImages(p.images || []);
        setVariants(p.variants?.length ? p.variants : [emptyVariant()]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [id, isNew]);

  const compareNum = useMemo(() => {
    const v = compareAt.trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [compareAt]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    try {
      const res = await api<{ urls: string[] }>("/api/upload", { method: "POST", body: fd });
      setImages((prev) => [...prev, ...res.urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      name,
      slug: slug.trim() || undefined,
      description,
      price: Number(price),
      compareAtPrice: compareNum,
      category: categoryId,
      published,
      images,
      variants: variants
        .filter((v) => v.stock > 0 || (v.size && v.size.trim()) || (v.color && v.color.trim()))
        .map((v) => ({
          ...v,
          size: v.size?.trim() || undefined,
          color: v.color?.trim() || undefined,
          stock: Number(v.stock) || 0,
        })),
    };
    try {
      if (isNew) {
        await api("/api/products", { method: "POST", body: JSON.stringify(body) });
      } else {
        await api(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      }
      navigate("/products", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (isNew) return;
    if (!confirm("Delete this product permanently?")) return;
    setError(null);
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      navigate("/products", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: "1rem" }}>
        <Link className="btn secondary" to="/products">
          ← Back
        </Link>
      </div>
      <h1 style={{ marginTop: 0 }}>{isNew ? "New product" : "Edit product"}</h1>
      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

      <form className="card stack" onSubmit={onSubmit}>
        <div className="stack">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="stack">
          <label>Slug (optional)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
        </div>
        <div className="stack">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="row">
          <div className="stack" style={{ flex: 1 }}>
            <label>Price (PKR)</label>
            <input type="number" min={0} step="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="stack" style={{ flex: 1 }}>
            <label>Compare-at price (optional)</label>
            <input type="number" min={0} step="1" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} />
          </div>
        </div>
        <div className="stack">
          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>
        <label className="row" style={{ gap: "0.5rem" }}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published (visible on storefront)
        </label>

        <div className="stack">
          <label>Images</label>
          <div className="thumbs">
            {images.map((u) => (
              <div key={u} style={{ position: "relative" }}>
                <img src={u} alt="" />
                <button
                  type="button"
                  className="btn danger"
                  style={{ position: "absolute", top: -6, right: -6, padding: "0.1rem 0.35rem", fontSize: 12 }}
                  onClick={() => setImages((prev) => prev.filter((x) => x !== u))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="row">
            <input type="file" accept="image/*" multiple onChange={(e) => uploadFiles(e.target.files)} />
          </div>
          <div className="stack">
            <label>Add image URL</label>
            <div className="row">
              <input
                type="text"
                placeholder="https://..."
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (!v) return;
                  setImages((p) => [...p, v]);
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </div>
          </div>
        </div>

        <div className="stack">
          <label>Variants (size / color / stock)</label>
          {variants.map((v, i) => (
            <div key={i} className="row" style={{ alignItems: "flex-end" }}>
              <div className="stack" style={{ minWidth: 100 }}>
                <span className="muted">Size</span>
                <input value={v.size || ""} onChange={(e) => setVariants((prev) => prev.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))} />
              </div>
              <div className="stack" style={{ minWidth: 100 }}>
                <span className="muted">Color</span>
                <input value={v.color || ""} onChange={(e) => setVariants((prev) => prev.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))} />
              </div>
              <div className="stack" style={{ minWidth: 90 }}>
                <span className="muted">Stock</span>
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))
                  }
                />
              </div>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn secondary" onClick={() => setVariants((p) => [...p, emptyVariant()])}>
            Add variant row
          </button>
        </div>

        <div className="row" style={{ gap: "0.75rem" }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          {!isNew ? (
            <button type="button" className="btn danger" onClick={onDelete}>
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
