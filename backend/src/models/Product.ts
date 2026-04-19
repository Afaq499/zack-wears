import mongoose, { Schema, Types } from "mongoose";

export type ProductVariant = {
  sku?: string;
  color?: string;
  size?: string;
  stock: number;
  price?: number;
};

export type ProductDoc = mongoose.Document & {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category: Types.ObjectId;
  subcategory?: Types.ObjectId | null;
  published: boolean;
  variants: ProductVariant[];
};

const variantSchema = new Schema<ProductVariant>(
  {
    sku: { type: String, trim: true },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    price: { type: Number, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    published: { type: Boolean, default: false },
    variants: { type: [variantSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, published: 1 });
productSchema.index({ subcategory: 1, published: 1 });
productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model<ProductDoc>("Product", productSchema);
