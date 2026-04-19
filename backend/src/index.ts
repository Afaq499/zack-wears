import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { categoriesRouter } from "./routes/categories.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";
import { uploadRouter } from "./routes/upload.js";

const app = express();

app.use(
  cors({
    origin: [env.storefrontOrigin, env.adminOrigin, env.publicUrl],
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/upload", uploadRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

async function main() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`API listening on ${env.publicUrl} (port ${env.port})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
