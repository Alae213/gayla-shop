import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db.query("siteContent").first();
    if (!content) return null;

    // Resolve hero background image URL from storage if storageId is set
    if (content.heroBackgroundImage?.storageId) {
      const resolvedUrl = await ctx.storage.getUrl(
        content.heroBackgroundImage.storageId
      );
      return {
        ...content,
        heroBackgroundImage: {
          storageId: content.heroBackgroundImage.storageId,
          url: resolvedUrl ?? content.heroBackgroundImage.url ?? "",
        },
      };
    }

    return content;
  },
});

export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("siteContent").first();
    if (existing) return existing;

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
      const id = await ctx.db.insert("siteContent", {
        heroTitle: args.heroTitle || "Welcome to Gayla",
        heroSubtitle: args.heroSubtitle || "Discover premium streetwear",
        heroCtaText: args.heroCtaText || "Shop Now",
        homepageViewCount: 0,
      });
      content = await ctx.db.get(id);
      if (!content) throw new Error("Failed to create content");
    }

    const updates: any = {};
    if (args.heroTitle !== undefined) updates.heroTitle = args.heroTitle;
    if (args.heroSubtitle !== undefined) updates.heroSubtitle = args.heroSubtitle;
    if (args.heroCtaText !== undefined) updates.heroCtaText = args.heroCtaText;
    if (args.heroBackgroundImage !== undefined)
      updates.heroBackgroundImage = args.heroBackgroundImage;

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
    if (!content) throw new Error("Site content not found");

    await ctx.db.patch(content._id, {
      homepageViewCount: (content.homepageViewCount || 0) + 1,
    });

    return { success: true };
  },
});

export const uploadHeroImage = mutation({
  args: {
    storageId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.query("siteContent").first();
    if (!content) throw new Error("Site content not found");

    await ctx.db.patch(content._id, {
      heroBackgroundImage: {
        storageId: args.storageId,
        url: args.url,
      },
    });

    return { success: true };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
