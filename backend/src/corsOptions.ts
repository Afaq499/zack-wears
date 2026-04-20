import type { CorsOptions } from "cors";
import { env } from "./config/env.js";

function normalizeOrigin(url: string) {
  return url.trim().replace(/\/$/, "");
}

/** Treat `localhost` and `127.0.0.1` as the same app origin (browsers send different `Origin` headers). */
function expandLocalhostAliases(url: string): string[] {
  const u = normalizeOrigin(url);
  const out = new Set<string>([u]);

  // Add localhost/127.0.0.1 aliases
  if (u.includes("://localhost:")) out.add(u.replace("://localhost:", "://127.0.0.1:"));
  if (u.includes("://127.0.0.1:")) out.add(u.replace("://127.0.0.1:", "://localhost:"));
  if (u.endsWith("://localhost")) out.add(u.replace("://localhost", "://127.0.0.1"));
  if (u.endsWith("://127.0.0.1")) out.add(u.replace("://127.0.0.1", "://localhost"));
  
  // Always include https://zackskyy.co/ as an allowed origin
  // Always include https://admin.zackskyy.co/ as an allowed origin
  out.add("https://admin.zackskyy.co");
  out.add("https://zackskyy.co");

  return [...out];
}

function buildAllowedOrigins(): Set<string> {
  const set = new Set<string>();
  for (const raw of [env.storefrontOrigin, env.adminOrigin, env.publicUrl]) {
    for (const o of expandLocalhostAliases(raw)) set.add(normalizeOrigin(o));
  }
  return set;
}

const allowedOrigins = buildAllowedOrigins();

function isZackskyyDomainOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const h = u.hostname.toLowerCase();
    return h === "zackskyy.co" || h.endsWith(".zackskyy.co");
  } catch {
    return false;
  }
}

/** In development, Vite may use 5174, 5175, etc. Allow any loopback HTTP origin. */
function isLocalLoopbackDev(origin: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const u = new URL(origin);
    return u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const normalized = normalizeOrigin(origin);
    if (
      allowedOrigins.has(normalized) ||
      isZackskyyDomainOrigin(normalized) ||
      isLocalLoopbackDev(normalized)
    ) {
      callback(null, origin);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};
