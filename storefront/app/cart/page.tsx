"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cartSubtotal, readCart, writeCart, type CartLine } from "@/lib/cart";

function emitCart() {
  window.dispatchEvent(new Event("zw:cart"));
}

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(readCart());
  }, []);

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);

  function updateQty(i: number, q: number) {
    const next = [...lines];
    if (q <= 0) next.splice(i, 1);
    else next[i] = { ...next[i], quantity: q };
    setLines(next);
    writeCart(next);
    emitCart();
  }

  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <h1 style={{ marginTop: 0, textAlign: "center", letterSpacing: "0.12em" }}>CART</h1>
      <p style={{ textAlign: "center", marginTop: "-0.25rem" }}>
        <Link href="/" className="muted">
          Continue shopping
        </Link>
      </p>

      {lines.length === 0 ? (
        <p className="muted" style={{ textAlign: "center" }}>
          Your cart is empty.
        </p>
      ) : (
        <div className="cart-layout">
          <div>
            {lines.map((l, i) => (
              <div
                key={`${l.productId}-${l.size}-${l.color}`}
                className="card"
                style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "1rem", padding: "1rem", marginBottom: "0.75rem" }}
              >
                <Link href={`/collections/${l.collectionSlug}/products/${l.slug}`}>
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt="" width={96} height={96} style={{ objectFit: "cover", borderRadius: 2 }} />
                  ) : (
                    <div style={{ width: 96, height: 96, background: "#eee" }} />
                  )}
                </Link>
                <div>
                  <div style={{ fontWeight: 800 }}>{l.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {[l.color, l.size].filter(Boolean).join(" / ")}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                    <button type="button" className="btn secondary" onClick={() => updateQty(i, l.quantity - 1)}>
                      −
                    </button>
                    <span style={{ fontWeight: 700 }}>{l.quantity}</span>
                    <button type="button" className="btn secondary" onClick={() => updateQty(i, l.quantity + 1)}>
                      +
                    </button>
                    <span style={{ marginLeft: "auto", fontWeight: 700 }}>Rs. {l.price * l.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="aside">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>Taxes and shipping calculated at checkout.</p>
            <Link className="btn" href="/checkout" style={{ width: "100%", marginTop: "0.75rem" }}>
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
