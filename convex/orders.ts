import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Confirmed"),
        v.literal("Cancelled"),
        v.literal("Called no respond"),
        v.literal("Packaged"),
        v.literal("Shipped"),
        v.literal("Delivered")
      )
    ),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();

    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }

    orders.sort((a, b) => b._creationTime - a._creationTime);

    return orders;
  },
});

export const getByOrderNumber = query({
  args: {
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    return order;
  },
});

export const getById = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    return order;
  },
});

export const getCountByStatus = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();

    const counts = {
      Pending: 0,
      Confirmed: 0,
      Cancelled: 0,
      "Called no respond": 0,
      Packaged: 0,
      Shipped: 0,
      Delivered: 0,
    };

    orders.forEach((order) => {
      counts[order.status]++;
    });

    return counts;
  },
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GAY-${timestamp}-${random}`;
}

export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    customerWilaya: v.string(),
    customerCommune: v.string(),
    customerAddress: v.string(),
    deliveryType: v.union(v.literal("Domicile"), v.literal("Stopdesk")),
    deliveryCost: v.number(),
    productId: v.id("products"),
    selectedVariant: v.optional(
      v.object({
        size: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Produit non trouvé");
    }

    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await ctx.db
        .query("orders")
        .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
        .first();
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const totalAmount = product.price + args.deliveryCost;

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      status: "Pending",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerWilaya: args.customerWilaya,
      customerCommune: args.customerCommune,
      customerAddress: args.customerAddress,
      deliveryType: args.deliveryType,
      deliveryCost: args.deliveryCost,
      productId: args.productId,
      productName: product.title,
      productPrice: product.price,
      selectedVariant: args.selectedVariant,
      totalAmount,
      lastUpdated: Date.now(),
    });

    return {
      orderId,
      orderNumber,
      totalAmount,
    };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Confirmed"),
      v.literal("Cancelled"),
      v.literal("Called no respond"),
      v.literal("Packaged"),
      v.literal("Shipped"),
      v.literal("Delivered")
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Commande non trouvée");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      lastUpdated: Date.now(),
    });

    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerWilaya: v.optional(v.string()),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    deliveryType: v.optional(v.union(v.literal("Domicile"), v.literal("Stopdesk"))),
    deliveryCost: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Confirmed"),
        v.literal("Cancelled"),
        v.literal("Called no respond"),
        v.literal("Packaged"),
        v.literal("Shipped"),
        v.literal("Delivered")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const order = await ctx.db.get(id);
    if (!order) {
      throw new Error("Commande non trouvée");
    }

    let totalAmount = order.totalAmount;
    if (updates.deliveryCost !== undefined) {
      totalAmount = order.productPrice + updates.deliveryCost;
    }

    await ctx.db.patch(id, {
      ...updates,
      totalAmount,
      lastUpdated: Date.now(),
    });

    return { success: true };
  },
});
