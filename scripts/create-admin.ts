/**
 * Setup script to create initial admin user
 * Run: npm run setup:admin
 */

import { config } from "dotenv";
import { resolve } from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  console.log("\n💡 Your .env.local should contain:");
  console.log("NEXT_PUBLIC_CONVEX_URL=https://valiant-cassowary-87.convex.cloud");
  console.log("\n🔍 Current working directory:", process.cwd());
  console.log("📁 Looking for .env.local at:", resolve(process.cwd(), ".env.local"));
  process.exit(1);
}

console.log("🔗 Using Convex URL:", CONVEX_URL);

const client = new ConvexHttpClient(CONVEX_URL);

async function createAdmin() {
  console.log("🔐 Creating admin user for Gayla...\n");

  const email = "admin@gayla.dz";
  const password = "Gayla2026!"; // Change this after first login!
  const name = "Admin Gayla";

  try {
    // Use action instead of mutation
    const result = await client.action(api.auth.createAdmin, {
      email,
      password,
      name,
    });

    console.log("✅ Admin user created successfully!");
    console.log("\n📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");
    console.log("\n🎯 Next steps:");
    console.log("1. Start dev server: npm run dev");
    console.log("2. Navigate to: http://localhost:3000/admin");
    console.log("3. Login with credentials above");
    console.log("4. Change password in Settings\n");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️  Admin user already exists");
        console.log("\n📧 Email:", email);
        console.log("🔑 Password: Use your existing password");
        console.log("\n💡 To reset, delete the admin from Convex dashboard and run this again\n");
      } else {
        console.error("❌ Error creating admin:", error.message);
      }
    } else {
      console.error("❌ Unknown error:", error);
    }
  }
}

createAdmin();
