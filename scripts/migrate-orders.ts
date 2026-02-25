#!/usr/bin/env tsx
/**
 * LEGACY ORDER MIGRATION RUNNER
 * 
 * Migrates old single-product orders to new lineItems format.
 * 
 * Usage:
 *   npm run migrate:orders              # Run migration
 *   npm run migrate:orders --dry-run    # Preview without changes
 *   npm run migrate:orders --batch=50   # Process 50 orders at a time
 * 
 * This script uses Convex internal mutations to safely migrate orders.
 * Safe to run multiple times - already migrated orders are skipped.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment variables");
  console.error("Please set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL!);

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const batchArg = args.find(arg => arg.startsWith("--batch="));
const batchSize = batchArg ? parseInt(batchArg.split("=")[1], 10) : 100;

if (isNaN(batchSize) || batchSize < 1) {
  console.error("❌ Error: Invalid batch size. Must be a positive number.");
  process.exit(1);
}

async function runMigration() {
  console.log("\n🔄 LEGACY ORDER MIGRATION\n");
  console.log("────────────────────────────────────────\n");
  
  try {
    // Step 1: Count orders needing migration
    console.log("📊 Analyzing orders...\n");
    
    // TODO: Implement migration API endpoints
    console.log("❌ Migration API endpoints not yet implemented");
    console.log("Please implement the following endpoints in Convex:");
    console.log("- api.migrations.migrateToLineItems.countLegacyOrders");
    console.log("- api.migrations.migrateToLineItems.migrateToLineItems");
    process.exit(1);
    
  } catch (error) {
    console.error("\n❌ Migration failed:\n");
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration().catch(console.error);
