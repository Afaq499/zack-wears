import mongoose, { Schema, Types } from "mongoose";

export type CategoryDoc = mongoose.Document & {
  name: string;
  slug: string;
  parent?: Types.ObjectId | null;
  sortOrder: number;
};

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, sortOrder: 1 });

export const Category = mongoose.model<CategoryDoc>("Category", categorySchema);
