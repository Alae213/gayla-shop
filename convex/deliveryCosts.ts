import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all delivery costs
export const list = query({
  handler: async (ctx) => {
    const costs = await ctx.db.query("deliveryCosts").collect();
    return costs.sort((a, b) => a.wilayaId - b.wilayaId);
  },
});

// Get cost for specific wilaya
export const getByWilayaId = query({
  args: { wilayaId: v.number() },
  handler: async (ctx, args) => {
    const cost = await ctx.db
      .query("deliveryCosts")
      .withIndex("by_wilaya_id", (q) => q.eq("wilayaId", args.wilayaId))
      .first();
    return cost;
  },
});

// Get cost for specific wilaya by name
export const getByWilayaName = query({
  args: { wilayaName: v.string() },
  handler: async (ctx, args) => {
    const costs = await ctx.db.query("deliveryCosts").collect();
    return costs.find((c) => c.wilayaName.toLowerCase() === args.wilayaName.toLowerCase());
  },
});

// Update delivery cost
export const update = mutation({
  args: {
    id: v.id("deliveryCosts"),
    domicileCost: v.optional(v.number()),
    stopdeskCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      isManualOverride: true,
      lastFetched: Date.now(),
    });

    return { success: true };
  },
});

// Bulk update all delivery costs
export const bulkUpdate = mutation({
  args: {
    updates: v.array(
      v.object({
        wilayaId: v.number(),
        domicileCost: v.number(),
        stopdeskCost: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const update of args.updates) {
      const existing = await ctx.db
        .query("deliveryCosts")
        .withIndex("by_wilaya_id", (q) => q.eq("wilayaId", update.wilayaId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          domicileCost: update.domicileCost,
          stopdeskCost: update.stopdeskCost,
          isManualOverride: true,
          lastFetched: Date.now(),
        });
      } else {
        await ctx.db.insert("deliveryCosts", {
          wilayaId: update.wilayaId,
          wilayaName: `Wilaya ${update.wilayaId}`,
          domicileCost: update.domicileCost,
          stopdeskCost: update.stopdeskCost,
          isManualOverride: true,
          lastFetched: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Initialize default costs for all wilayas
export const initializeDefaults = mutation({
  handler: async (ctx) => {
    const wilayas = [
      { id: 1, name: "Adrar" },
      { id: 2, name: "Chlef" },
      { id: 3, name: "Laghouat" },
      { id: 4, name: "Oum El Bouaghi" },
      { id: 5, name: "Batna" },
      { id: 6, name: "Béjaïa" },
      { id: 7, name: "Biskra" },
      { id: 8, name: "Béchar" },
      { id: 9, name: "Blida" },
      { id: 10, name: "Bouira" },
      { id: 11, name: "Tamanrasset" },
      { id: 12, name: "Tébessa" },
      { id: 13, name: "Tlemcen" },
      { id: 14, name: "Tiaret" },
      { id: 15, name: "Tizi Ouzou" },
      { id: 16, name: "Alger" },
      { id: 17, name: "Djelfa" },
      { id: 18, name: "Jijel" },
      { id: 19, name: "Sétif" },
      { id: 20, name: "Saïda" },
      { id: 21, name: "Skikda" },
      { id: 22, name: "Sidi Bel Abbès" },
      { id: 23, name: "Annaba" },
      { id: 24, name: "Guelma" },
      { id: 25, name: "Constantine" },
      { id: 26, name: "Médéa" },
      { id: 27, name: "Mostaganem" },
      { id: 28, name: "M'Sila" },
      { id: 29, name: "Mascara" },
      { id: 30, name: "Ouargla" },
      { id: 31, name: "Oran" },
      { id: 32, name: "El Bayadh" },
      { id: 33, name: "Illizi" },
      { id: 34, name: "Bordj Bou Arréridj" },
      { id: 35, name: "Boumerdès" },
      { id: 36, name: "El Tarf" },
      { id: 37, name: "Tindouf" },
      { id: 38, name: "Tissemsilt" },
      { id: 39, name: "El Oued" },
      { id: 40, name: "Khenchela" },
      { id: 41, name: "Souk Ahras" },
      { id: 42, name: "Tipaza" },
      { id: 43, name: "Mila" },
      { id: 44, name: "Aïn Defla" },
      { id: 45, name: "Naâma" },
      { id: 46, name: "Aïn Témouchent" },
      { id: 47, name: "Ghardaïa" },
      { id: 48, name: "Relizane" },
      { id: 49, name: "Timimoun" },
      { id: 50, name: "Bordj Badji Mokhtar" },
      { id: 51, name: "Ouled Djellal" },
      { id: 52, name: "Béni Abbès" },
      { id: 53, name: "In Salah" },
      { id: 54, name: "In Guezzam" },
      { id: 55, name: "Touggourt" },
      { id: 56, name: "Djanet" },
      { id: 57, name: "El M'Ghair" },
      { id: 58, name: "El Meniaa" },
    ];

    let created = 0;

    for (const wilaya of wilayas) {
      const existing = await ctx.db
        .query("deliveryCosts")
        .withIndex("by_wilaya_id", (q) => q.eq("wilayaId", wilaya.id))
        .first();

      if (!existing) {
        // Alger gets special pricing
        const domicileCost = wilaya.id === 16 ? 500 : 600;
        const stopdeskCost = wilaya.id === 16 ? 400 : 450;

        await ctx.db.insert("deliveryCosts", {
          wilayaId: wilaya.id,
          wilayaName: wilaya.name,
          domicileCost,
          stopdeskCost,
          isManualOverride: false,
          lastFetched: Date.now(),
        });

        created++;
      }
    }

    return { created, total: wilayas.length };
  },
});
