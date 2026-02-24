import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/** Resolve image URLs for a product's images array using ctx.storage.getUrl. */
async function resolveImages(
  ctx: any,
  images: { url: string; storageId: string }[] | undefined
) {
  if (!images || images.length === 0) return [];
  return Promise.all(
    images.map(async (img) => ({
      storageId: img.storageId,
      url: (await ctx.storage.getUrl(img.storageId)) ?? img.url ?? "",
    }))
  );
}

// ─── list ──────────────────────────────────────────────────────────────────────────────────────
export const list = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("Active"), v.literal("Draft"), v.literal("Out of stock"))
    ),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    products = products.filter((p) => !p.isArchived);

    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }
    if (args.status) {
      products = products.filter((p) => p.status === args.status);
    }

    products.sort((a, b) => {
      const aHasOrder = a.sortOrder !== undefined && a.sortOrder !== null;
      const bHasOrder = b.sortOrder !== undefined && b.sortOrder !== null;
      if (aHasOrder && bHasOrder) return (a.sortOrder as number) - (b.sortOrder as number);
      if (aHasOrder && !bHasOrder) return -1;
      if (!aHasOrder && bHasOrder) return 1;
      const aTime = a.createdAt || a._creationTime;
      const bTime = b.createdAt || b._creationTime;
      return bTime - aTime;
    });

    return Promise.all(
      products.map(async (product) => ({
        ...product,
        images: await resolveImages(ctx, product.images),
      }))
    );
  },
});

// ─── getBySlug ───────────────────────────────────────────────────────────────────────────────
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!product || product.isArchived) return null;
    return {
      ...product,
      images: await resolveImages(ctx, product.images),
    };
  },
});

// ─── getById ──────────────────────────────────────────────────────────────────────────────────
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || product.isArchived) return null;
    return {
      ...product,
      images: await resolveImages(ctx, product.images),
    };
  },
});

// ─── incrementViewCount ───────────────────────────────────────────────────────────────────────────
export const incrementViewCount = mutation({
  args: {
    slug: v.optional(v.string()),
    id: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    // FIX 21A: Require at least one identifier — silently succeeding with
    // neither would leave viewCount unchanged with no feedback to the caller.
    if (!args.id && !args.slug) {
      throw new Error("incrementViewCount requires either id or slug");
    }

    let product = null as any;
    if (args.id) {
      product = await ctx.db.get(args.id);
    } else if (args.slug) {
      product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug as string))
        .first();
    }
    if (!product || product.isArchived) throw new Error("Product not found");
    await ctx.db.patch(product._id, { viewCount: (product.viewCount || 0) + 1 });
    return { success: true };
  },
});

// ─── create ──────────────────────────────────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    images: v.array(v.object({ url: v.string(), storageId: v.string() })),
    variants: v.optional(
      v.array(v.object({ size: v.optional(v.string()), color: v.optional(v.string()) }))
    ),
    status: v.union(v.literal("Active"), v.literal("Draft"), v.literal("Out of stock")),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    // FIX 21B: Block slug reuse even for archived products. If we allowed
    // creating a new product with an archived product's slug, restoring the
    // archived product later would create two live products sharing the same
    // slug — breaking getBySlug (which returns only .first()).
    if (existing) throw new Error("A product with this slug already exists");
    const now = Date.now();
    return ctx.db.insert("products", {
      ...args,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    });
  },
});

// ─── createEmpty ─────────────────────────────────────────────────────────────────────────────
export const createEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const slug = `untitled-${now}`;

    const allProducts = await ctx.db.query("products").collect();
    const active = allProducts.filter((p) => !p.isArchived);
    const maxSortOrder = active.reduce(
      (max, p) => (p.sortOrder !== undefined ? Math.max(max, p.sortOrder) : max),
      -1
    );

    const id = await ctx.db.insert("products", {
      title: "Untitled Product",
      slug,
      price: 0,
      status: "Draft",
      sortOrder: maxSortOrder + 1,
      images: [],
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    });

    return { id, slug };
  },
});

// ─── reorder ────────────────────────────────────────────────────────────────────────────────────
export const reorder = mutation({
  args: {
    items: v.array(
      v.object({ id: v.id("products"), sortOrder: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await Promise.all(
      args.items.map((item) =>
        ctx.db.patch(item.id, { sortOrder: item.sortOrder, updatedAt: now })
      )
    );
    return { success: true };
  },
});

// ─── toggleStatus ─────────────────────────────────────────────────────────────────────────────
export const toggleStatus = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || product.isArchived) throw new Error("Product not found");
    const nextStatus = product.status === "Active" ? "Draft" : "Active";
    await ctx.db.patch(args.id, { status: nextStatus, updatedAt: Date.now() });
    return { status: nextStatus };
  },
});

// ─── update ──────────────────────────────────────────────────────────────────────────────────────
export const update = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    images: v.optional(
      v.array(v.object({ url: v.string(), storageId: v.string() }))
    ),
    variants: v.optional(
      v.array(v.object({ size: v.optional(v.string()), color: v.optional(v.string()) }))
    ),
    status: v.optional(
      v.union(v.literal("Active"), v.literal("Draft"), v.literal("Out of stock"))
    ),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const product = await ctx.db.get(id);
    if (!product || product.isArchived) throw new Error("Product not found");

    if (updates.slug !== undefined && updates.slug !== product.slug) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug as string))
        .first();
      // FIX 21B (also applied here): block renaming to a slug that already
      // exists, even if the conflicting product is archived.
      if (existing) throw new Error("A product with this slug already exists");
    }

    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    return { success: true };
  },
});

// ─── remove (soft-delete) ───────────────────────────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { isArchived: true, updatedAt: Date.now() });
    return { success: true };
  },
});

// ─── restore (undo soft-delete) ─────────────────────────────────────────────────────────────────────────
export const restore = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { isArchived: false, updatedAt: Date.now() });
    return { success: true };
  },
});
