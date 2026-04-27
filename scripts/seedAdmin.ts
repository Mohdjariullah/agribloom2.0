/**
 * Seed (or reset) the single admin user.
 *
 * Run: `npm run seed:admin`
 *
 * Credentials default to `feaker007@gmail.com` / `123456789` and can be
 * overridden via env (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME).
 *
 * Behaviour:
 *   - Upserts the admin user (re-running just resets the password).
 *   - Demotes every OTHER admin to role "farmer" so there is exactly one admin.
 *   - Sets isVerified=true and profileCompleted=true so login goes straight in.
 */

import { ensureDnsResolves } from "./_dnsFix"; // ← also loads .env.local
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../src/models/userModel";

const DEFAULT_EMAIL = "feaker007@gmail.com";
const DEFAULT_PASSWORD = "123456789";
const DEFAULT_NAME = "Admin";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) {
    console.error("❌ MONGODB_URI not set");
    process.exit(1);
  }
  ensureDnsResolves();
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const email = (process.env.ADMIN_EMAIL || DEFAULT_EMAIL).toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const username = process.env.ADMIN_NAME || DEFAULT_NAME;

  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(password, salt);

  const result = await User.updateOne(
    { email },
    {
      $set: {
        username,
        email,
        password: hashed,
        role: "admin",
        isVerified: true,
        profileCompleted: true,
      },
    },
    { upsert: true }
  );

  if (result.upsertedCount) {
    console.log(`✅ Created admin: ${email}`);
  } else {
    console.log(`✅ Updated admin: ${email} (password reset)`);
  }

  // Enforce single admin — demote anyone else with role admin.
  const demote = await User.updateMany(
    { email: { $ne: email }, role: "admin" },
    { $set: { role: "farmer" } }
  );
  if (demote.modifiedCount > 0) {
    console.log(`ℹ️  Demoted ${demote.modifiedCount} other admin(s) to farmer.`);
  }

  console.log(`\nLogin with:\n  Email:    ${email}\n  Password: ${password}\n`);
  if (!process.env.ADMIN_PASSWORD && password === DEFAULT_PASSWORD) {
    console.log("⚠️  Default password in use. Change it from /profile after logging in.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
