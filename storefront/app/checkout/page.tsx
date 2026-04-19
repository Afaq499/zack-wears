"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { readCart, writeCart, type CartLine } from "@/lib/cart";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export default function CheckoutPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setLines(readCart());
    setReady(true);
  }, []);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [shippingCost] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => lines.reduce((n, l) => n + l.price * l.quantity, 0), [lines]);
  const total = subtotal + shippingCost;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          lineItems: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            color: l.color,
            size: l.size,
          })),
          shippingCost,
          shipping: {
            email,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: phone || undefined,
            address1,
            address2: address2 || undefined,
            city,
            postalCode: postalCode || undefined,
            country,
          },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      writeCart([]);
      window.dispatchEvent(new Event("zw:cart"));
      setDone(data.orderNumber as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (ready && !done && lines.length === 0) {
    return (
      <main className="container" style={{ padding: "2rem 0" }}>
        <h1 style={{ marginTop: 0 }}>Checkout</h1>
        <p className="muted">Your cart is empty.</p>
        <Link href="/">Continue shopping</Link>
      </main>
    );
  }

  if (!ready && !done) {
    return (
      <main className="container" style={{ padding: "2rem 0" }}>
        <h1 style={{ marginTop: 0 }}>Checkout</h1>
        <p className="muted">Loading…</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="container" style={{ padding: "2rem 0", maxWidth: 720 }}>
        <h1 style={{ marginTop: 0 }}>Thank you</h1>
        <p>Your order <strong>{done}</strong> was placed.</p>
        <p className="muted">You will receive updates when the order ships.</p>
        <Link href="/">Continue shopping</Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
      <h1 style={{ marginTop: 0 }}>Checkout</h1>

      <div className="checkout">
        <form onSubmit={onSubmit} className="card" style={{ padding: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Contact</h2>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <h2>Delivery</h2>
          <div className="field">
            <label htmlFor="country">Country / region</label>
            <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="firstName">First name (optional)</label>
            <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="address1">Address</label>
            <input id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="address2">Apartment, suite, etc. (optional)</label>
            <input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="postal">Postal code (optional)</label>
            <input id="postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Placing order…" : "Place order"}
          </button>
        </form>

        <aside className="aside">
          <h2 style={{ marginTop: 0 }}>Order summary</h2>
          {lines.map((l) => (
            <div key={`${l.productId}-${l.size}-${l.color}`} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ position: "relative", width: 64, height: 64, flex: "0 0 auto" }}>
                {l.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }} />
                ) : null}
                <span
                  className="pill"
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "#111",
                    minWidth: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {l.quantity}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{l.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {[l.color, l.size].filter(Boolean).join(" / ")}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>Rs. {l.price * l.quantity}</div>
            </div>
          ))}
          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "1rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Subtotal</span>
            <span>Rs. {subtotal}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span className="muted">Shipping</span>
            <span>Rs. {shippingCost}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 900 }}>
            <span>Total</span>
            <span>PKR Rs. {total}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
