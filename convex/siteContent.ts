import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Get site content (singleton)
 * Returns default values if not set
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db.query("siteContent").first();

    // Return default values if not initialized
    if (!content) {
      return {
        heroTitleAR: "جايلا - أزياء الشارع للرجال",
        heroTitleFR: "Gayla - Mode Streetwear Pour Hommes",
        heroTitleEN: "Gayla - Men's Streetwear Fashion",
        heroSubtitleAR: "اكتشف مجموعتنا الحصرية",
        heroSubtitleFR: "Découvrez notre collection exclusive",
        heroSubtitleEN: "Discover our exclusive collection",
        heroBackgroundImage: {
          storageId: "",
          url: "",
        },
        homepageViewCount: 0,
      };
    }

    return content;
  },
});

/**
 * Update site content
 * Used by: Admin Build Mode - Hero section editing
 */
export const update = mutation({
  args: {
    heroTitleAR: v.optional(v.string()),
    heroTitleFR: v.optional(v.string()),
    heroTitleEN: v.optional(v.string()),
    heroSubtitleAR: v.optional(v.string()),
    heroSubtitleFR: v.optional(v.string()),
    heroSubtitleEN: v.optional(v.string()),
    heroBackgroundImage: v.optional(
      v.object({
        storageId: v.string(),
        url: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteContent").first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, args);
    } else {
      // Create new (first time)
      await ctx.db.insert("siteContent", {
        heroTitleAR: args.heroTitleAR || "جايلا - أزياء الشارع للرجال",
        heroTitleFR: args.heroTitleFR || "Gayla - Mode Streetwear Pour Hommes",
        heroTitleEN: args.heroTitleEN || "Gayla - Men's Streetwear Fashion",
        heroSubtitleAR: args.heroSubtitleAR || "اكتشف مجموعتنا الحصرية",
        heroSubtitleFR: args.heroSubtitleFR || "Découvrez notre collection exclusive",
        heroSubtitleEN: args.heroSubtitleEN || "Discover our exclusive collection",
        heroBackgroundImage: args.heroBackgroundImage || { storageId: "", url: "" },
        homepageViewCount: 0,
      });
    }

    return { success: true };
  },
});

/**
 * Increment homepage view count
 * Used by: Homepage on load
 */
export const incrementHomeViews = mutation({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db.query("siteContent").first();

    if (content) {
      await ctx.db.patch(content._id, {
        homepageViewCount: content.homepageViewCount + 1,
      });
    } else {
      // Initialize if doesn't exist
      await ctx.db.insert("siteContent", {
        heroTitleAR: "جايلا - أزياء الشارع للرجال",
        heroTitleFR: "Gayla - Mode Streetwear Pour Hommes",
        heroTitleEN: "Gayla - Men's Streetwear Fashion",
        heroSubtitleAR: "اكتشف مجموعتنا الحصرية",
        heroSubtitleFR: "Découvrez notre collection exclusive",
        heroSubtitleEN: "Discover our exclusive collection",
        heroBackgroundImage: { storageId: "", url: "" },
        homepageViewCount: 1,
      });
    }

    return { success: true };
  },
});
