import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

/**
 * List all delivery costs
 * Used by: Admin Delivery Costs tab
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const costs = await ctx.db.query("deliveryCosts").collect();
    
    // Sort by wilayaId
    costs.sort((a, b) => a.wilayaId - b.wilayaId);
    
    return costs;
  },
});

/**
 * Get delivery cost by wilaya ID
 * Used by: Order form - delivery cost calculation
 */
export const getByWilayaId = query({
  args: {
    wilayaId: v.number(),
  },
  handler: async (ctx, args) => {
    const cost = await ctx.db
      .query("deliveryCosts")
      .withIndex("by_wilaya_id", (q) => q.eq("wilayaId", args.wilayaId))
      .first();

    return cost;
  },
});

/**
 * Update delivery cost (manual override)
 * Used by: Admin Delivery Costs tab - Manual edit
 */
export const updateCost = mutation({
  args: {
    wilayaId: v.number(),
    domicileCost: v.optional(v.number()),
    stopdeskCost: v.optional(v.number()),
    isManualOverride: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate: costs must be positive
    if (args.domicileCost !== undefined && args.domicileCost < 0) {
      throw new Error("Domicile cost cannot be negative");
    }
    if (args.stopdeskCost !== undefined && args.stopdeskCost < 0) {
      throw new Error("Stopdesk cost cannot be negative");
    }

    const existing = await ctx.db
      .query("deliveryCosts")
      .withIndex("by_wilaya_id", (q) => q.eq("wilayaId", args.wilayaId))
      .first();

    if (existing) {
      // Update existing
      const updates: any = {
        isManualOverride: args.isManualOverride,
        lastFetched: Date.now(),
      };
      
      if (args.domicileCost !== undefined) {
        updates.domicileCost = args.domicileCost;
      }
      if (args.stopdeskCost !== undefined) {
        updates.stopdeskCost = args.stopdeskCost;
      }

      await ctx.db.patch(existing._id, updates);
    } else {
      throw new Error(`Wilaya ${args.wilayaId} not found`);
    }

    return { success: true };
  },
});

/**
 * Sync costs from ZR Express API
 * Used by: Admin Delivery Costs tab - Sync button
 */
export const syncCosts = action({
  args: {},
  handler: async (ctx) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    let synced = 0;
    const errors: string[] = [];

    // Fetch costs for all 58 wilayas
    for (let wilayaId = 1; wilayaId <= 58; wilayaId++) {
      try {
        // Call mock API (in production, this would call real ZR Express)
        const response = await fetch(`${siteUrl}/api/zr-express/tarification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wilayaId,
            deliveryType: "Domicile",
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = (await response.json()) as { cost: number; wilayaName: string };

        // Update or create in database
        const existing = await ctx.runQuery(api.deliveryCosts.getByWilayaId, { wilayaId });

        if (existing && !existing.isManualOverride) {
          // Update only if not manually overridden
          await ctx.runMutation(api.deliveryCosts.updateCost, {
            wilayaId,
            domicileCost: data.cost,
            stopdeskCost: data.cost - 100, // Stopdesk typically cheaper
            isManualOverride: false,
          });
          synced++;
        } else if (!existing) {
          // Create new entry (internal mutation – only used by this action)
          await ctx.runMutation(internal.deliveryCosts.create, {
            wilayaId,
            wilayaName: data.wilayaName,
            domicileCost: data.cost,
            stopdeskCost: data.cost - 100,
          });
          synced++;
        }
      } catch (error) {
        errors.push(`Wilaya ${wilayaId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      success: true,
      synced,
      errors: errors.length > 0 ? errors.join(", ") : undefined,
    };
  },
});

/**
 * Create delivery cost entry (internal – only used by syncCosts action)
 */
export const create = internalMutation({
  args: {
    wilayaId: v.number(),
    wilayaName: v.string(),
    domicileCost: v.number(),
    stopdeskCost: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("deliveryCosts", {
      wilayaId: args.wilayaId,
      wilayaName: args.wilayaName,
      domicileCost: args.domicileCost,
      stopdeskCost: args.stopdeskCost,
      lastFetched: Date.now(),
      isManualOverride: false,
    });

    return { success: true };
  },
});
