"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { readCart, writeCart, type CartLine } from "@/lib/cart";

function emitCart() {
  window.dispatchEvent(new Event("zw:cart"));
}

export default function AddToCart({
  product,
  collectionSlug,
}: {
  product: Product;
  collectionSlug: string;
}) {
  const sizes = useMemo(() => {
    const s = new Set<string>();
    for (const v of product.variants || []) {
      if (v.size) s.add(v.size);
    }
    return Array.from(s);
  }, [product.variants]);

  const colors = useMemo(() => {
    const s = new Set<string>();
    for (const v of product.variants || []) {
      if (v.color) s.add(v.color);
    }
    return Array.from(s);
  }, [product.variants]);

  const [size, setSize] = useState(sizes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [qty, setQty] = useState(1);

  const hasMatrix = sizes.length > 0 || colors.length > 0;

  const stock = useMemo(() => {
    if (!hasMatrix) return 999;
    const match = (product.variants || []).find((v) => {
      const okSize = !size || v.size === size;
      const okColor = !color || v.color === color;
      return okSize && okColor;
    });
    return match?.stock ?? 0;
  }, [product.variants, size, color, hasMatrix, sizes.length, colors.length]);

  function add() {
    const lines = readCart();
    const image = product.images[0];
    const line: CartLine = {
      productId: String(product._id),
      slug: product.slug,
      collectionSlug,
      name: product.name,
      image,
      price: product.price,
      quantity: qty,
      size: size || undefined,
      color: color || undefined,
    };
    const key = (l: CartLine) =>
      `${l.productId}|${l.size || ""}|${l.color || ""}`;
    const k = key(line);
    const idx = lines.findIndex((l) => key(l) === k);
    if (idx >= 0) lines[idx] = { ...lines[idx], quantity: lines[idx].quantity + qty };
    else lines.push(line);
    writeCart(lines);
    emitCart();
  }

  const low = stock > 0 && stock <= 10;

  return (
    <div style={{ marginTop: "1rem" }}>
      {colors.length ? (
        <div className="field">
          <label>Color</label>
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {sizes.length ? (
        <div className="field">
          <label>Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="field">
        <label>Quantity</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" className="btn secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>{qty}</span>
          <button type="button" className="btn secondary" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
      </div>

      {hasMatrix && stock <= 0 ? (
        <p style={{ color: "#666" }}>This combination is out of stock.</p>
      ) : hasMatrix && low ? (
        <p style={{ color: "#8a6d00" }}>Low stock — {stock} left.</p>
      ) : null}

      <button className="btn" type="button" onClick={add} disabled={hasMatrix && stock <= 0}>
        Add to cart
      </button>
    </div>
  );
}
