import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const admin = await Admin.findOne({ email: parsed.data.email.toLowerCase() });
  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await admin.comparePassword(parsed.data.password);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ sub: String(admin._id) }, env.jwtSecret, { expiresIn: "7d" });
  res.json({ token, admin: { id: String(admin._id), email: admin.email } });
});
