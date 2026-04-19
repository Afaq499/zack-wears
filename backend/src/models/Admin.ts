import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

export type AdminDoc = mongoose.Document & {
  email: string;
  passwordHash: string;
  comparePassword: (plain: string) => Promise<boolean>;
};

const adminSchema = new Schema<AdminDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

adminSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const Admin = mongoose.model<AdminDoc>("Admin", adminSchema);

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}
