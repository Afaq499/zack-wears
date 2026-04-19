export type CartLine = {
  productId: string;
  slug: string;
  collectionSlug: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
};

const KEY = "zw_cart_v1";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as CartLine[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.price * l.quantity, 0);
}
