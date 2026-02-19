import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByWilayaId = query({
  args: { wilayaId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliveryCosts")
      .withIndex("by_wilayaId", (q) => q.eq("wilayaId", args.wilayaId))
      .first();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("deliveryCosts").collect();
  },
});

export const upsert = mutation({
  args: {
    wilayaId:     v.number(),
    wilayaName:   v.string(),
    stopdeskCost: v.number(),
    domicileCost: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("deliveryCosts")
      .withIndex("by_wilayaId", (q) => q.eq("wilayaId", args.wilayaId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        wilayaName:       args.wilayaName,
        stopdeskCost:     args.stopdeskCost,
        domicileCost:     args.domicileCost,
        isManualOverride: true,
        updatedAt:        Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("deliveryCosts", {
        wilayaId:         args.wilayaId,
        wilayaName:       args.wilayaName,
        stopdeskCost:     args.stopdeskCost,
        domicileCost:     args.domicileCost,
        isManualOverride: true,
        updatedAt:        Date.now(),
      });
    }
  },
});

export const bulkUpsert = mutation({
  args: {
    updates: v.array(v.object({
      wilayaId:     v.number(),
      wilayaName:   v.string(),
      stopdeskCost: v.number(),
      domicileCost: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const results: string[] = [];
    for (const update of args.updates) {
      const existing = await ctx.db
        .query("deliveryCosts")
        .withIndex("by_wilayaId", (q) => q.eq("wilayaId", update.wilayaId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          wilayaName:       update.wilayaName,
          stopdeskCost:     update.stopdeskCost,
          domicileCost:     update.domicileCost,
          isManualOverride: true,
          updatedAt:        Date.now(),
        });
        results.push(existing._id);
      } else {
        const newId = await ctx.db.insert("deliveryCosts", {
          wilayaId:         update.wilayaId,
          wilayaName:       update.wilayaName,
          stopdeskCost:     update.stopdeskCost,
          domicileCost:     update.domicileCost,
          isManualOverride: false,
          updatedAt:        Date.now(),
        });
        results.push(newId);
      }
    }
    return { updated: results.length };
  },
});

export const seedDefaults = mutation({
  args: {
    wilayas: v.array(v.object({
      id:           v.number(),
      name:         v.string(),
      stopdeskCost: v.number(),
      domicileCost: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let seeded = 0;
    for (const wilaya of args.wilayas) {
      const existing = await ctx.db
        .query("deliveryCosts")
        .withIndex("by_wilayaId", (q) => q.eq("wilayaId", wilaya.id))
        .first();
      if (!existing) {
        await ctx.db.insert("deliveryCosts", {
          wilayaId:         wilaya.id,
          wilayaName:       wilaya.name,
          stopdeskCost:     wilaya.stopdeskCost,
          domicileCost:     wilaya.domicileCost,
          isManualOverride: false,
          updatedAt:        Date.now(),
        });
        seeded++;
      }
    }
    return { seeded };
  },
});
