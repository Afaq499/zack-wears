import slugify from "slugify";
import type { Model } from "mongoose";

export function toSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug<T extends { slug: string }>(
  model: Model<T>,
  base: string,
  excludeId?: string
) {
  let slug = toSlug(base);
  let suffix = 0;
  for (;;) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await model.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!existing) return candidate;
    suffix += 1;
  }
}
