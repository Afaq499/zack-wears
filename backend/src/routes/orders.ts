import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/requireAdmin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Order, type OrderStatus } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { generateOrderNumber } from "../utils/orderNumber.js";

export const ordersRouter = Router();

const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  color: z.string().optional(),
  size: z.string().optional(),
});

const shippingSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().min(1),
});

const createOrderSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1),
  shipping: shippingSchema,
  shippingCost: z.number().min(0).optional(),
  currency: z.string().optional(),
});

ordersRouter.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const ids = parsed.data.lineItems.map((l) => l.productId);
  const products = await Product.find({ _id: { $in: ids }, published: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const lines = [];
  for (const li of parsed.data.lineItems) {
    const p = byId.get(li.productId);
    if (!p) {
      res.status(400).json({ error: `Unknown product: ${li.productId}` });
      return;
    }
    const unitPrice = p.price;
    subtotal += unitPrice * li.quantity;
    lines.push({
      productId: new Types.ObjectId(li.productId),
      name: p.name,
      slug: p.slug,
      image: p.images[0],
      quantity: li.quantity,
      unitPrice,
      color: li.color,
      size: li.size,
    });
  }

  const shippingCost = parsed.data.shippingCost ?? 0;
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    status: "pending",
    lineItems: lines,
    shipping: parsed.data.shipping,
    subtotal,
    shippingCost,
    total,
    currency: parsed.data.currency ?? "PKR",
  });

  res.status(201).json(order);
});

ordersRouter.get("/", requireAdmin, async (_req, res) => {
  const items = await Order.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

ordersRouter.get("/:id", requireAdmin, async (req, res) => {
  const doc = await Order.findById(req.params.id).lean();
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(doc);
});

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
});

ordersRouter.patch("/:id/status", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const doc = await Order.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status as OrderStatus },
    { new: true }
  ).lean();
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(doc);
});
