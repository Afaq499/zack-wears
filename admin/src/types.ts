export type Category = {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  sortOrder: number;
};

export type ProductVariant = {
  sku?: string;
  color?: string;
  size?: string;
  stock: number;
  price?: number;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category: Category | string;
  subcategory?: Category | string | null;
  published: boolean;
  variants: ProductVariant[];
};

export type OrderLine = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  color?: string;
  size?: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  lineItems: OrderLine[];
  shipping: Record<string, string | undefined>;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  createdAt: string;
};
