/**
 * Shared bootstrap for seed scripts:
 *   1. Load .env.local + .env (Next.js convention) before anything reads env.
 *   2. Patch Node DNS servers if they're loopback-only (Windows quirk that
 *      breaks `mongodb+srv://` SRV lookups with ECONNREFUSED).
 *
 * Importing this file is enough — it runs on import.
 */

import dotenv from "dotenv";
import path from "path";
import dns from "dns";

// Next.js loads in this priority: .env.local > .env. Match that here.
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

export function ensureDnsResolves() {
  // Seed scripts are short-lived processes — setServers is fine here.
  try {
    const servers = dns.getServers();
    const allLoopback =
      servers.length === 0 ||
      servers.every((s) => s === "127.0.0.1" || s === "::1");
    if (allLoopback) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.log("ℹ️  DNS resolvers were loopback only — switched to 8.8.8.8 and 1.1.1.1.");
    }
  } catch (err) {
    console.warn("DNS server check failed (non-fatal):", err);
  }
}
