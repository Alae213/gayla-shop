import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("Active"), v.literal("Draft"), v.literal("Out of stock"))
    ),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }

    if (args.status) {
      products = products.filter((p) => p.status === args.status);
    }

    // Handle optional createdAt - fallback to _creationTime
    products.sort((a, b) => {
      const aTime = a.createdAt || a._creationTime;
      const bTime = b.createdAt || b._creationTime;
      return bTime - aTime;
    });

    return products;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return product;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  },
});

export const incrementViewCount = mutation({
  args: {
    slug: v.optional(v.string()),
    id: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    // Backwards/forwards compatible: allow either slug or id.
    let product = null as any;

    if (args.id) {
      product = await ctx.db.get(args.id);
    } else if (args.slug) {
      product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug as string))
        .first();
    }

    if (!product) {
      throw new Error("Product not found");
    }

    await ctx.db.patch(product._id, {
      viewCount: (product.viewCount || 0) + 1,
    });

    return { success: true };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.string(),
    images: v.array(
      v.object({
        url: v.string(),
        storageId: v.string(),
      })
    ),
    variants: v.optional(
      v.array(
        v.object({
          size: v.optional(v.string()),
          color: v.optional(v.string()),
        })
      )
    ),
    status: v.union(v.literal("Active"), v.literal("Draft"), v.literal("Out of stock")),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("A product with this slug already exists");
    }

    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      ...args,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          storageId: v.string(),
        })
      )
    ),
    variants: v.optional(
      v.array(
        v.object({
          size: v.optional(v.string()),
          color: v.optional(v.string()),
        })
      )
    ),
    status: v.optional(
      v.union(v.literal("Active"), v.literal("Draft"), v.literal("Out of stock"))
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const product = await ctx.db.get(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if slug is being changed and if it already exists
    if (updates.slug !== undefined && updates.slug !== product.slug) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug as string))
        .first();

      if (existing) {
        throw new Error("A product with this slug already exists");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
