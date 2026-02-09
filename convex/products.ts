import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * List products with optional filtering
 * Used by: Public catalog, Admin product list
 */
export const list = query({
  args: {
    isVisible: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    // Filter by visibility
    if (args.isVisible !== undefined) {
      products = products.filter((p) => p.isVisible === args.isVisible);
    }

    // Filter by category
    if (args.category) {
      products = products.filter(
        (p) => p.categories && p.categories.includes(args.category as string)
      );
    }

    // Sort by creation time (newest first)
    products.sort((a, b) => b._creationTime - a._creationTime);

    return products;
  },
});

/**
 * Get product by slug
 * Used by: Product detail page
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return product;
  },
});

/**
 * Get product by ID
 * Used by: Admin edit, Order creation
 */
export const getById = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  },
});

/**
 * Get all unique categories from products
 * Used by: Catalog filter dropdown
 */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const categoriesSet = new Set<string>();

    products.forEach((product) => {
      if (product.categories) {
        product.categories.forEach((cat) => categoriesSet.add(cat));
      }
    });

    return Array.from(categoriesSet).sort();
  },
});

/**
 * Increment product view count
 * Used by: Product detail page on load
 */
export const incrementViewCount = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    await ctx.db.patch(args.id, {
      viewCount: product.viewCount + 1,
    });

    return { success: true };
  },
});
/**
 * Create new product
 * Used by: Admin Build Mode - Add Product
 */
export const create = mutation({
    args: {
      slug: v.string(),
      titleAR: v.string(),
      titleFR: v.string(),
      titleEN: v.string(),
      descriptionAR: v.optional(v.string()),
      descriptionFR: v.optional(v.string()),
      descriptionEN: v.optional(v.string()),
      price: v.number(),
      images: v.optional(
        v.array(
          v.object({
            storageId: v.string(),
            url: v.string(),
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
      categories: v.optional(v.array(v.string())),
      isVisible: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
      // Validate: slug must be unique
      const existingProduct = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
  
      if (existingProduct) {
        throw new Error(`Product with slug "${args.slug}" already exists`);
      }
  
      // Validate: price must be positive
      if (args.price <= 0) {
        throw new Error("Price must be greater than 0");
      }
  
      // Create product
      const productId = await ctx.db.insert("products", {
        slug: args.slug,
        titleAR: args.titleAR,
        titleFR: args.titleFR,
        titleEN: args.titleEN,
        descriptionAR: args.descriptionAR,
        descriptionFR: args.descriptionFR,
        descriptionEN: args.descriptionEN,
        price: args.price,
        images: args.images || [],
        variants: args.variants,
        categories: args.categories,
        isVisible: args.isVisible ?? true,
        viewCount: 0,
      });
  
      return productId;
    },
  });
  
  /**
   * Update existing product
   * Used by: Admin Build Mode - Inline editing, Edit form
   */
  export const update = mutation({
    args: {
      id: v.id("products"),
      slug: v.optional(v.string()),
      titleAR: v.optional(v.string()),
      titleFR: v.optional(v.string()),
      titleEN: v.optional(v.string()),
      descriptionAR: v.optional(v.string()),
      descriptionFR: v.optional(v.string()),
      descriptionEN: v.optional(v.string()),
      price: v.optional(v.number()),
      images: v.optional(
        v.array(
          v.object({
            storageId: v.string(),
            url: v.string(),
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
      categories: v.optional(v.array(v.string())),
      isVisible: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
      const { id, ...updates } = args;
  
      // Validate: product exists
      const product = await ctx.db.get(id);
      if (!product) {
        throw new Error("Product not found");
      }
  
      // Validate: slug uniqueness if changing
      if (updates.slug && updates.slug !== product.slug) {
        const existingProduct = await ctx.db
          .query("products")
          .withIndex("by_slug", (q) => q.eq("slug", updates.slug ?? ""))
          .first();
  
        if (existingProduct) {
          throw new Error(`Product with slug "${updates.slug}" already exists`);
        }
      }
  
      // Validate: price must be positive
      if (updates.price !== undefined && updates.price <= 0) {
        throw new Error("Price must be greater than 0");
      }
  
      // Update product
      await ctx.db.patch(id, updates);
  
      return { success: true };
    },
  });
  
  /**
   * Delete product (soft delete - hide from public)
   * Used by: Admin Build Mode - Delete button
   */
  export const deleteProduct = mutation({
    args: {
      id: v.id("products"),
    },
    handler: async (ctx, args) => {
      const product = await ctx.db.get(args.id);
      if (!product) {
        throw new Error("Product not found");
      }
  
      // Soft delete: just hide from public
      await ctx.db.patch(args.id, {
        isVisible: false,
      });
  
      return { success: true };
    },
  });
  
  /**
   * Toggle product visibility
   * Used by: Admin Build Mode - Visibility toggle
   */
  export const toggleVisibility = mutation({
    args: {
      id: v.id("products"),
    },
    handler: async (ctx, args) => {
      const product = await ctx.db.get(args.id);
      if (!product) {
        throw new Error("Product not found");
      }
  
      await ctx.db.patch(args.id, {
        isVisible: !product.isVisible,
      });
  
      return { success: true, isVisible: !product.isVisible };
    },
  });
  