"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { cartCount, readCart } from "@/lib/cart";
import { IconCart, IconSearch, IconUser } from "./icons";
import LogoMark from "./LogoMark";
import MegaNav from "./MegaNav";

export default function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

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
      <div className="container header-top">
        <div className="header-left">
          <button type="button" className="icon-btn" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((v) => !v)}>
            <IconSearch />
          </button>
        </div>
        <Link href="/" className="logo-mark" aria-label="Zack Wears home">
          <LogoMark />
        </Link>
        <div className="header-right">
          <Link href="/account" className="icon-btn" aria-label="Account">
            <IconUser />
          </Link>
          <Link href="/cart" className="icon-btn icon-btn-cart" aria-label="Shopping cart">
            <IconCart />
            <span className="cart-badge" aria-live="polite">
              {count > 99 ? "99+" : count}
            </span>
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="search-pop">
          <div className="container">
            <form action="/" method="get" className="search-pop-form" onSubmit={() => setSearchOpen(false)}>
              <input type="search" name="q" placeholder="Search collections…" className="search-input" aria-label="Search" />
              <button type="submit" className="btn btn-compact">
                Search
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <MegaNav categories={categories} />

      <div className="promo">7% OFF ON ADVANCE PAYMENT ORDERS</div>
    </header>
  );
}
