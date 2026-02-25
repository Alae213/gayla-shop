import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * LEGACY ORDER MIGRATION TO LINE ITEMS FORMAT
 * 
 * This migration converts old single-product orders to the new lineItems format.
 * 
 * BEFORE:
 * {
 *   productId: Id<"products">,
 *   productName: "T-shirt",
 *   productPrice: 2000,
 *   selectedVariant: { size: "M", color: "Red" },
 *   quantity: 2
 * }
 * 
 * AFTER:
 * {
 *   lineItems: [
 *     {
 *       productId: Id<"products">,
 *       productName: "T-shirt",
 *       unitPrice: 2000,
 *       quantity: 2,
 *       variants: { size: "M", color: "Red" },
 *       lineTotal: 4000,
 *       thumbnail: "https://..."
 *     }
 *   ]
 * }
 * 
 * Run this migration ONCE after deploying the new lineItems feature.
 * Safe to run multiple times - already migrated orders are skipped.
 */

// Query to count orders needing migration
export const countLegacyOrders = internalQuery({
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("orders").collect();
    
    const needsMigration = allOrders.filter(order => {
      // Skip if already has lineItems
      if (order.lineItems && order.lineItems.length > 0) return false;
      
      // Needs migration if has old productId field
      return !!order.productId;
    });
    
    return {
      total: allOrders.length,
      needsMigration: needsMigration.length,
      alreadyMigrated: allOrders.length - needsMigration.length,
    };
  },
});

// Main migration mutation
export const migrateToLineItems = internalMutation({
  args: {
    batchSize: v.optional(v.number()), // Process N orders at a time
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 100;
    
    // Fetch all orders
    const allOrders = await ctx.db.query("orders").collect();
    
    const results = {
      total: allOrders.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    // Process orders in batch
    let processed = 0;
    for (const order of allOrders) {
      // Skip if already migrated
      if (order.lineItems && order.lineItems.length > 0) {
        results.skipped++;
        continue;
      }
      
      // Skip if no product data (invalid order)
      if (!order.productId) {
        results.skipped++;
        continue;
      }
      
      try {
        // Fetch product to get thumbnail
        const product = await ctx.db.get(order.productId);
        
        // Build variants object from selectedVariant
        const variants: Record<string, string> = {};
        if (order.selectedVariant) {
          if (order.selectedVariant.size) variants.size = order.selectedVariant.size;
          if (order.selectedVariant.color) variants.color = order.selectedVariant.color;
        }
        
        // Get thumbnail from product (first image)
        let thumbnail: string | undefined;
        if (product?.images && product.images.length > 0) {
          // Extract URL from image object (images are { storageId, url })
          const firstImage = product.images[0];
          thumbnail = typeof firstImage === 'string' ? firstImage : firstImage.url;
        }
        
        // Calculate quantity (default to 1 if not set)
        const quantity = order.quantity ?? 1;
        const unitPrice = order.productPrice ?? 0;
        const lineTotal = quantity * unitPrice;
        
        // Create lineItems array
        const lineItems = [{
          productId: order.productId,
          productName: order.productName ?? "Unknown Product",
          productSlug: order.productSlug ?? product?.slug ?? "",
          quantity,
          unitPrice,
          variants: Object.keys(variants).length > 0 ? variants : undefined,
          lineTotal,
          thumbnail,
        }];
        
        // Update order with lineItems
        await ctx.db.patch(order._id, {
          lineItems,
          lastUpdated: Date.now(),
        });
        
        results.migrated++;
        processed++;
        
        // Stop if batch size reached
        if (processed >= batchSize) {
          break;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Order ${order.orderNumber ?? order._id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
    
    return results;
  },
});

// Utility to rollback migration (if needed)
export const rollbackLineItemsMigration = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 100;
    
    const allOrders = await ctx.db.query("orders").collect();
    
    const results = {
      total: allOrders.length,
      rolledBack: 0,
      skipped: 0,
    };
    
    let processed = 0;
    for (const order of allOrders) {
      // Skip if no lineItems
      if (!order.lineItems || order.lineItems.length === 0) {
        results.skipped++;
        continue;
      }
      
      // Skip if multiple line items (can't rollback multi-product orders)
      if (order.lineItems.length > 1) {
        results.skipped++;
        continue;
      }
      
      // Remove lineItems field
      await ctx.db.patch(order._id, {
        lineItems: undefined,
        lastUpdated: Date.now(),
      });
      
      results.rolledBack++;
      processed++;
      
      if (processed >= batchSize) {
        break;
      }
    }
    
    return results;
  },
});
