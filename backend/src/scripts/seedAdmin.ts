import { env } from "../config/env.js";
import { connectDb } from "../db.js";
import { Admin, hashPassword } from "../models/Admin.js";

async function run() {
  await connectDb();
  const email = env.adminEmail.toLowerCase();
  const password = env.adminPassword;
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
    return;
  }
  await Admin.create({ email, passwordHash: await hashPassword(password) });
  console.log("Created admin:", email);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
