"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { cartCount, readCart } from "@/lib/cart";

export default function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() {
      setCount(cartCount(readCart()));
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("zw:cart", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("zw:cart", refresh);
    };
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo" aria-label="Home">
          ZACK WEARS
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>Search</span>
          <Link href="/cart" style={{ position: "relative", fontWeight: 600 }}>
            Cart
            {count > 0 ? (
              <span className="pill" style={{ position: "absolute", top: -10, right: -14 }}>
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
      <div className="container nav">
        {categories.map((c) => (
          <Link key={c._id} href={`/collections/${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </div>
      <div className="promo">7% OFF ON ADVANCE PAYMENT ORDERS</div>
    </header>
  );
}
