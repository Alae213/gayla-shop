import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db.query("siteContent").first();
    
    // Return null if doesn't exist - we'll create it with a mutation
    return content;
  },
});

// Initialize site content if it doesn't exist
export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("siteContent").first();
    
    if (existing) {
      return existing;
    }

    const id = await ctx.db.insert("siteContent", {
      heroTitle: "Welcome to Gayla - Streetwear Collection",
      heroSubtitle: "Discover premium men's streetwear fashion",
      heroCtaText: "Shop Now",
      homepageViewCount: 0,
    });

    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    heroTitle: v.optional(v.string()),
    heroSubtitle: v.optional(v.string()),
    heroCtaText: v.optional(v.string()),
    heroBackgroundImage: v.optional(
      v.object({
        url: v.string(),
        storageId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let content = await ctx.db.query("siteContent").first();

    if (!content) {
      // Create if doesn't exist
      const id = await ctx.db.insert("siteContent", {
        heroTitle: args.heroTitle || "Welcome to Gayla",
        heroSubtitle: args.heroSubtitle || "Discover premium streetwear",
        heroCtaText: args.heroCtaText || "Shop Now",
        homepageViewCount: 0,
      });
      content = await ctx.db.get(id);
      if (!content) throw new Error("Failed to create content");
    }

    // Filter out undefined values
    const updates: any = {};
    if (args.heroTitle !== undefined) updates.heroTitle = args.heroTitle;
    if (args.heroSubtitle !== undefined) updates.heroSubtitle = args.heroSubtitle;
    if (args.heroCtaText !== undefined) updates.heroCtaText = args.heroCtaText;
    if (args.heroBackgroundImage !== undefined) updates.heroBackgroundImage = args.heroBackgroundImage;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(content._id, updates);
    }

    return { success: true };
  },
});

export const incrementHomeViews = mutation({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db.query("siteContent").first();

    if (!content) {
      throw new Error("Site content not found");
    }

    await ctx.db.patch(content._id, {
      homepageViewCount: content.homepageViewCount + 1,
    });

    return { success: true };
  },
});

// Upload hero background image
export const uploadHeroImage = mutation({
  args: {
    storageId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.query("siteContent").first();

    if (!content) {
      throw new Error("Site content not found");
    }

    await ctx.db.patch(content._id, {
      heroBackgroundImage: {
        storageId: args.storageId,
        url: args.url,
      },
    });

    return { success: true };
  },
});

// Generate upload URL for images
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
