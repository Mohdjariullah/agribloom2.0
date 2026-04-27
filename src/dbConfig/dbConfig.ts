import mongoose from "mongoose";
import { Resolver } from "dns/promises";

let connectPromise: Promise<typeof mongoose> | null = null;
let cachedNonSrvUri: string | null = null;

/**
 * SRV resolution that bypasses Node's default DNS server (which on some
 * Windows / WSL setups is 127.0.0.1 with nothing listening, breaking
 * `mongodb+srv://` lookups). Uses a fresh Resolver instance pointed at
 * public DNS so we never touch global resolver state — that avoids the
 * HMR / EDESTRUCTION pitfalls of `dns.setServers()`.
 */
async function resolveSrvUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) return uri;
  const [, creds, host, path = "/", query = ""] = match;

  const resolver = new Resolver({ timeout: 8000, tries: 2 });
  resolver.setServers(["8.8.8.8", "1.1.1.1", "9.9.9.9"]);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => [] as string[][]),
  ]);

  const hostList = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");

  const txtParams = new URLSearchParams(txtRecords.flat().join("&"));
  const finalParams = new URLSearchParams(query.replace(/^\?/, ""));
  for (const [k, v] of txtParams.entries()) {
    if (!finalParams.has(k)) finalParams.set(k, v);
  }
  if (!finalParams.has("ssl") && !finalParams.has("tls"))
    finalParams.set("ssl", "true");
  if (!finalParams.has("authSource")) finalParams.set("authSource", "admin");

  return `mongodb://${creds}@${hostList}${path}?${finalParams.toString()}`;
}

export const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectPromise) {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Add it to .env.local (see .env.example)."
      );
    }

    connectPromise = (async () => {
      if (!cachedNonSrvUri) cachedNonSrvUri = await resolveSrvUri(uri);
      const m = await mongoose.connect(cachedNonSrvUri, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log("✅ MongoDB connected");
      return m;
    })().catch((err) => {
      connectPromise = null;
      throw err;
    });
  }

  return connectPromise;
};
