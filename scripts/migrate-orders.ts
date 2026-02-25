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
  
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    // Step 1: Count orders needing migration
    console.log("📊 Analyzing orders...\n");
    
    const stats: any = await client.query(
      api.migrations.migrateToLineItems.countLegacyOrders as any
    );
    
    console.log(`Total orders:          ${stats.total}`);
    console.log(`Already migrated:      ${stats.alreadyMigrated} ✓`);
    console.log(`Needs migration:       ${stats.needsMigration}`);
    console.log(`Batch size:            ${batchSize}\n`);
    
    if (stats.needsMigration === 0) {
      console.log("✅ All orders already migrated. Nothing to do!\n");
      return;
    }
    
    if (isDryRun) {
      console.log("🔍 DRY RUN MODE - No changes will be made\n");
      console.log(`Would migrate ${Math.min(stats.needsMigration, batchSize)} orders\n`);
      return;
    }
    
    // Step 2: Run migration
    console.log("⚙️  Running migration...\n");
    
    const result: any = await client.mutation(
      api.migrations.migrateToLineItems.migrateToLineItems as any,
      { batchSize }
    );
    
    console.log("\n────────────────────────────────────────\n");
    console.log("📊 MIGRATION RESULTS\n");
    console.log(`Total orders:          ${result.total}`);
    console.log(`✅ Migrated:           ${result.migrated}`);
    console.log(`⏭️  Skipped:            ${result.skipped}`);
    console.log(`❌ Failed:             ${result.failed}\n`);
    
    if (result.errors && result.errors.length > 0) {
      console.log("⚠️  ERRORS:\n");
      result.errors.forEach((error: string) => {
        console.log(`   ${error}`);
      });
      console.log("");
    }
    
    if (result.migrated > 0) {
      console.log("✅ Migration completed successfully!\n");
    } else if (result.failed > 0) {
      console.log("⚠️  Migration completed with errors\n");
      process.exit(1);
    } else {
      console.log("ℹ️  No orders were migrated\n");
    }
    
    // Check if more batches needed
    const remaining = stats.needsMigration - result.migrated;
    if (remaining > 0) {
      console.log(`ℹ️  ${remaining} orders remaining. Run migration again to continue.\n");
    }
    
  } catch (error) {
    console.error("\n❌ Migration failed:\n");
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration().catch(console.error);
