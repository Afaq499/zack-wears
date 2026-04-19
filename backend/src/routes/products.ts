import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/requireAdmin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { uniqueSlug } from "../utils/slug.js";

export const productsRouter = Router();

const variantSchema = z.object({
  sku: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.number().int().min(0),
  price: z.number().min(0).optional(),
});

const productBody = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),
  images: z.array(z.string().min(1)).optional(),
  category: z.string().min(1),
  published: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
});

productsRouter.get("/by-slug/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, published: true })
    .populate("category")
    .lean();
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(product);
});

productsRouter.get("/collection/:categorySlug", async (req, res) => {
  const cat = await Category.findOne({ slug: req.params.categorySlug }).lean();
  if (!cat) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }
  const sort = (req.query.sort as string) || "newest";
  const sortKey =
    sort === "price-asc"
      ? { price: 1 as const }
      : sort === "price-desc"
        ? { price: -1 as const }
        : sort === "bestselling"
          ? { createdAt: -1 as const }
          : { createdAt: -1 as const };
  const items = await Product.find({ category: cat._id, published: true })
    .sort(sortKey)
    .populate("category")
    .lean();
  res.json({ category: cat, products: items });
});

productsRouter.get("/", requireAdmin, async (_req, res) => {
  const items = await Product.find().sort({ updatedAt: -1 }).populate("category").lean();
  res.json(items);
});

productsRouter.post("/", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = productBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const category = await Category.findById(parsed.data.category);
  if (!category) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  const slug = parsed.data.slug?.trim()
    ? await uniqueSlug(Product, parsed.data.slug)
    : await uniqueSlug(Product, parsed.data.name);
  const doc = await Product.create({
    name: parsed.data.name,
    slug,
    description: parsed.data.description ?? "",
    price: parsed.data.price,
    compareAtPrice: parsed.data.compareAtPrice ?? null,
    images: parsed.data.images ?? [],
    category: category._id,
    published: parsed.data.published ?? false,
    variants: parsed.data.variants ?? [],
  });
  res.status(201).json(await doc.populate("category"));
});

productsRouter.patch("/:id", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = productBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const doc = await Product.findById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (parsed.data.category) {
    const category = await Category.findById(parsed.data.category);
    if (!category) {
      res.status(400).json({ error: "Invalid category" });
      return;
    }
    doc.category = category._id;
  }
  if (parsed.data.name !== undefined) doc.name = parsed.data.name;
  if (parsed.data.description !== undefined) doc.description = parsed.data.description;
  if (parsed.data.price !== undefined) doc.price = parsed.data.price;
  if (parsed.data.compareAtPrice !== undefined) doc.compareAtPrice = parsed.data.compareAtPrice;
  if (parsed.data.images !== undefined) doc.images = parsed.data.images;
  if (parsed.data.published !== undefined) doc.published = parsed.data.published;
  if (parsed.data.variants !== undefined) doc.variants = parsed.data.variants;
  if (parsed.data.slug !== undefined && parsed.data.slug.trim()) {
    doc.slug = await uniqueSlug(Product, parsed.data.slug, String(doc._id));
  } else if (parsed.data.name !== undefined) {
    doc.slug = await uniqueSlug(Product, parsed.data.name, String(doc._id));
  }
  await doc.save();
  res.json(await doc.populate("category"));
});

productsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const r = await Product.deleteOne({ _id: req.params.id });
  if (r.deletedCount === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});
