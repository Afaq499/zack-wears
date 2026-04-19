import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Product } from "../types";

function catName(p: Product) {
  const c = p.category;
  return typeof c === "object" && c && "name" in c ? c.name : "—";
}

function subName(p: Product) {
  const s = p.subcategory;
  if (!s) return "—";
  return typeof s === "object" && "name" in s ? s.name : "—";
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Product[]>("/api/products")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link className="btn" to="/products/new">
          New product
        </Link>
      </div>

      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th />
              <th>Name</th>
              <th>Category</th>
              <th>Sub</th>
              <th>Price</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.images[0] ? (
                    <img src={p.images[0]} alt="" width={44} height={44} style={{ borderRadius: 6, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, background: "#eee", borderRadius: 6 }} />
                  )}
                </td>
                <td>{p.name}</td>
                <td>{catName(p)}</td>
                <td>{subName(p)}</td>
                <td>Rs. {p.price}</td>
                <td>
                  <span className="pill">{p.published ? "Published" : "Draft"}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link className="btn secondary" to={`/products/${p._id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
