export type Category = {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  sortOrder?: number;
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
  variants: { size?: string; color?: string; stock: number; price?: number }[];
  createdAt?: string;
};

export type CollectionResponse = {
  category: Category;
  products: Product[];
};
