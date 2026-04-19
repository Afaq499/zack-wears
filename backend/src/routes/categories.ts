import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/requireAdmin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Category } from "../models/Category.js";
import { uniqueSlug } from "../utils/slug.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  const items = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  res.json(items);
});

categoriesRouter.get("/by-slug/:slug", async (req, res) => {
  const doc = await Category.findOne({ slug: req.params.slug }).lean();
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(doc);
});

const upsertSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  parent: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

categoriesRouter.post("/", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const slug = parsed.data.slug?.trim()
    ? await uniqueSlug(Category, parsed.data.slug)
    : await uniqueSlug(Category, parsed.data.name);
  const parent =
    parsed.data.parent === undefined || parsed.data.parent === null
      ? null
      : new Types.ObjectId(parsed.data.parent);
  const doc = await Category.create({
    name: parsed.data.name,
    slug,
    parent,
    sortOrder: parsed.data.sortOrder ?? 0,
  });
  res.status(201).json(doc);
});

categoriesRouter.patch("/:id", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const doc = await Category.findById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (parsed.data.name !== undefined) doc.name = parsed.data.name;
  if (parsed.data.sortOrder !== undefined) doc.sortOrder = parsed.data.sortOrder;
  if (parsed.data.parent !== undefined) {
    doc.parent =
      parsed.data.parent === null ? null : new Types.ObjectId(parsed.data.parent);
  }
  if (parsed.data.slug !== undefined && parsed.data.slug.trim()) {
    doc.slug = await uniqueSlug(Category, parsed.data.slug, String(doc._id));
  } else if (parsed.data.name !== undefined) {
    doc.slug = await uniqueSlug(Category, parsed.data.name, String(doc._id));
  }
  await doc.save();
  res.json(doc);
});

categoriesRouter.delete("/:id", requireAdmin, async (req, res) => {
  const r = await Category.deleteOne({ _id: req.params.id });
  if (r.deletedCount === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});
