import type { Category } from "./types";

function parentId(c: Category): string | null {
  const p = c.parent;
  if (p == null) return null;
  if (typeof p === "object" && p && "_id" in p) return String((p as { _id: string })._id);
  return String(p);
}

export function buildNavTree(categories: Category[]) {
  const roots = categories
    .filter((c) => !parentId(c))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const childrenOf = new Map<string, Category[]>();
  for (const c of categories) {
    const pid = parentId(c);
    if (!pid) continue;
    if (!childrenOf.has(pid)) childrenOf.set(pid, []);
    childrenOf.get(pid)!.push(c);
  }
  for (const arr of childrenOf.values()) {
    arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
  return { roots, childrenOf };
}

export function chunkColumns<T>(items: T[], perColumn: number): T[][] {
  const cols: T[][] = [];
  for (let i = 0; i < items.length; i += perColumn) {
    cols.push(items.slice(i, i + perColumn));
  }
  return cols.length ? cols : [[]];
}
