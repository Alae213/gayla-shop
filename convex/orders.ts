import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * List orders with optional status filter
 * Used by: Admin Tracking Mode - Kanban & Table views
 */
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

    // Filter by status if provided
    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }

    // Sort by creation time (newest first)
    orders.sort((a, b) => b._creationTime - a._creationTime);

    return orders;
  },
});

/**
 * Get order by order number
 * Used by: Customer order lookup, Admin search
 */
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

/**
 * Get order by ID
 * Used by: Admin order details modal
 */
export const getById = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    return order;
  },
});

/**
 * Get order count by status
 * Used by: Admin Kanban column badges
 */
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
/**
 * Generate unique order number
 * Format: GAY-{timestamp}-{random}
 */
function generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GAY-${timestamp}-${random}`;
  }
  
  /**
   * Create new order
   * Used by: Public site - Order form submission
   */
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
      languagePreference: v.union(v.literal("ar"), v.literal("fr"), v.literal("en")),
    },
    handler: async (ctx, args) => {
      // Validate: product exists
      const product = await ctx.db.get(args.productId);
      if (!product) {
        throw new Error("Product not found");
      }
  
      // Generate unique order number
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
  
      // Calculate total
      const totalAmount = product.price + args.deliveryCost;
  
      // Create order
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
        productName: product.titleFR, // Snapshot - use French as default
        productPrice: product.price,
        selectedVariant: args.selectedVariant,
        totalAmount,
        languagePreference: args.languagePreference,
        lastUpdated: Date.now(),
      });
  
      return {
        orderId,
        orderNumber,
        totalAmount,
      };
    },
  });
  
  /**
   * Update order status
   * Used by: Admin Tracking Mode - Kanban drag-and-drop
   */
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
        throw new Error("Order not found");
      }
  
      await ctx.db.patch(args.id, {
        status: args.status,
        lastUpdated: Date.now(),
      });
  
      return { success: true };
    },
  });
  
  /**
   * Update order details
   * Used by: Admin order details modal - Edit form
   */
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
        throw new Error("Order not found");
      }
  
      // Recalculate total if delivery cost changes
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
  