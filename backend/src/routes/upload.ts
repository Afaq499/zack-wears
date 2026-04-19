import { Router } from "express";
import multer from "multer";
import { randomBytes } from "crypto";
import { requireAdmin, type AuthedRequest } from "../middleware/requireAdmin.js";
import { uploadBuffer, s3Configured } from "../services/s3.js";

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
});

uploadRouter.post("/", requireAdmin, upload.array("files", 12), async (req: AuthedRequest, res) => {
  if (!s3Configured()) {
    res.status(503).json({
      error: "S3 upload is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, and S3_PUBLIC_BASE_URL.",
    });
    return;
  }
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) {
    res.status(400).json({ error: "No files" });
    return;
  }
  const prefix = `products/${new Date().toISOString().slice(0, 10)}`;
  const urls: string[] = [];
  for (const file of files) {
    const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const key = `${prefix}/${randomBytes(16).toString("hex")}.${safeExt}`;
    const url = await uploadBuffer({
      key,
      body: file.buffer,
      contentType: file.mimetype || "application/octet-stream",
    });
    urls.push(url);
  }
  res.json({ urls });
});
