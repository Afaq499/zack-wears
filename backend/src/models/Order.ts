import mongoose, { Schema, Types } from "mongoose";

export type OrderLine = {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  color?: string;
  size?: string;
};

export type ShippingAddress = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode?: string;
  country: string;
};

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderDoc = mongoose.Document & {
  orderNumber: string;
  status: OrderStatus;
  lineItems: OrderLine[];
  shipping: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  notes?: string;
};

const lineSchema = new Schema<OrderLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    color: { type: String },
    size: { type: String },
  },
  { _id: false }
);

const shippingSchema = new Schema<ShippingAddress>(
  {
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    lineItems: { type: [lineSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<OrderDoc>("Order", orderSchema);
