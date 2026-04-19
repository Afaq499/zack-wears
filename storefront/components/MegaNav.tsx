"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Category } from "@/lib/types";
import { buildNavTree, chunkColumns } from "@/lib/navTree";
import { IconChevronDown } from "./icons";

export default function MegaNav({ categories }: { categories: Category[] }) {
  const { roots, childrenOf } = useMemo(() => buildNavTree(categories), [categories]);

  if (roots.length === 0) {
    return (
      <nav className="mega-nav-row container" aria-label="Shop">
        {categories.map((c) => (
          <Link key={c._id} href={`/collections/${c.slug}`} className="mega-trigger mega-trigger--solo">
            {c.name.toUpperCase()}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="mega-nav-row container" aria-label="Shop">
      {roots.map((root) => {
        const kids = childrenOf.get(root._id) ?? [];
        const cols = chunkColumns(kids, 7);
        return (
          <div key={root._id} className="mega-wrap">
            <Link href={`/collections/${root.slug}`} className="mega-trigger">
              <span>{root.name.toUpperCase()}</span>
              {kids.length > 0 ? <IconChevronDown className="nav-chevron" /> : null}
            </Link>
            {kids.length > 0 ? (
              <div className="mega-panel" role="region" aria-label={`${root.name} categories`}>
                <div className="mega-panel-grid container">
                  <div className="mega-col mega-col--head">
                    <span className="mega-col-title">Shop</span>
                    <Link href={`/collections/${root.slug}`} className="mega-all-link">
                      All {root.name}
                    </Link>
                  </div>
                  {cols.map((col, ci) => (
                    <div key={ci} className="mega-col">
                      {col.map((ch) => (
                        <Link key={ch._id} href={`/collections/${ch.slug}`} className="mega-link">
                          {ch.name.toUpperCase()}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
