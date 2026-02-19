import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// ─── Shared status union ──────────────────────────────────────────────────────
const orderStatusValidator = v.union(
  v.literal("Pending"),
  v.literal("Confirmed"),
  v.literal("Cancelled"),
  v.literal("Called no respond"),
  v.literal("Called 01"),
  v.literal("Called 02"),
  v.literal("Packaged"),
  v.literal("Shipped"),
  v.literal("Delivered"),
  v.literal("Retour")
);

// ─── Internal helpers ─────────────────────────────────────────────────────────

function pushStatusHistory(
  order: any,
  status: string,
  reason?: string
): Array<{ status: string; timestamp: number; reason?: string }> {
  const history: Array<{ status: string; timestamp: number; reason?: string }> =
    order.statusHistory ?? [];
  return [
    ...history,
    { status, timestamp: Date.now(), ...(reason ? { reason } : {}) },
  ];
}

function pushCallLog(
  order: any,
  outcome: "answered" | "no_answer",
  note?: string
): Array<{ timestamp: number; outcome: "answered" | "no_answer"; note?: string }> {
  const log: Array<{ timestamp: number; outcome: "answered" | "no_answer"; note?: string }> =
    order.callLog ?? [];
  return [
    ...log,
    { timestamp: Date.now(), outcome, ...(note ? { note } : {}) },
  ];
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GAY-${timestamp}-${random}`;
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export const list = query({
  args: { status: v.optional(orderStatusValidator) },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();
    if (args.status) orders = orders.filter((o) => o.status === args.status);
    orders.sort((a, b) => b._creationTime - a._creationTime);
    return orders;
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const counts: Record<string, number> = {
      total: orders.length,
      Pending: 0, Confirmed: 0, Cancelled: 0,
      "Called no respond": 0, "Called 01": 0, "Called 02": 0,
      Packaged: 0, Shipped: 0, Delivered: 0, Retour: 0,
    };
    orders.forEach((order) => {
      if (counts[order.status] !== undefined) counts[order.status]++;
    });
    return {
      ...counts,
      active:
        counts["Pending"] + counts["Called no respond"] +
        counts["Called 01"] + counts["Called 02"] + counts["Confirmed"],
      readyToShip: counts["Packaged"],
      inTransit:   counts["Shipped"],
      completed:   counts["Delivered"] + counts["Retour"] + counts["Cancelled"],
    };
  },
});

// ─── MUTATIONS — existing ─────────────────────────────────────────────────────

export const create = mutation({
  args: {
    customerName:    v.string(),
    customerPhone:   v.string(),
    customerWilaya:  v.string(),
    customerCommune: v.string(),
    customerAddress: v.string(),
    deliveryType:    v.union(v.literal("Domicile"), v.literal("Stopdesk")),
    deliveryCost:    v.number(),
    productId:       v.id("products"),
    selectedVariant: v.optional(
      v.object({ size: v.optional(v.string()), color: v.optional(v.string()) })
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const bannedCheck = await ctx.db
      .query("orders")
      .withIndex("by_customer_phone", (q) => q.eq("customerPhone", args.customerPhone))
      .first();
    const isBanned = bannedCheck?.isBanned === true;

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

    const totalAmount    = product.price + args.deliveryCost;
    const now            = Date.now();
    const initialStatus  = isBanned ? "Cancelled" : "Pending";

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      status:          initialStatus,
      customerName:    args.customerName,
      customerPhone:   args.customerPhone,
      customerWilaya:  args.customerWilaya,
      customerCommune: args.customerCommune,
      customerAddress: args.customerAddress,
      deliveryType:    args.deliveryType,
      deliveryCost:    args.deliveryCost,
      productId:       args.productId,
      productName:     product.title,
      productPrice:    product.price,
      productSlug:     product.slug,
      selectedVariant: args.selectedVariant,
      totalAmount,
      lastUpdated:     now,
      callAttempts:    0,
      callLog:         [],
      adminNotes:      [],
      fraudScore:      0,
      isBanned,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: now,
          ...(isBanned ? { reason: "Auto-cancelled — banned customer" } : {}),
        },
      ],
    });

    return { orderId, orderNumber, totalAmount };
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatusValidator, reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    const statusHistory = pushStatusHistory(order, args.status, args.reason);
    await ctx.db.patch(args.id, { status: args.status, statusHistory, lastUpdated: Date.now() });
    return { success: true };
  },
});

export const update = mutation({
  args: {
    id:              v.id("orders"),
    customerName:    v.optional(v.string()),
    customerPhone:   v.optional(v.string()),
    customerWilaya:  v.optional(v.string()),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    deliveryType:    v.optional(v.union(v.literal("Domicile"), v.literal("Stopdesk"))),
    deliveryCost:    v.optional(v.number()),
    status:          v.optional(orderStatusValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    let totalAmount    = order.totalAmount;
    if (updates.deliveryCost !== undefined) totalAmount = order.productPrice + updates.deliveryCost;
    let statusHistory  = order.statusHistory;
    if (updates.status && updates.status !== order.status) {
      statusHistory = pushStatusHistory(order, updates.status);
    }
    await ctx.db.patch(id, { ...updates, totalAmount, statusHistory, lastUpdated: Date.now() });
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ─── MUTATIONS — Phase 1 ──────────────────────────────────────────────────────

export const logCallAttempt = mutation({
  args: {
    orderId:  v.id("orders"),
    outcome:  v.union(v.literal("answered"), v.literal("no_answer")),
    note:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const currentAttempts = order.callAttempts ?? 0;
    const newAttempts     = currentAttempts + 1;
    const callLog         = pushCallLog(order, args.outcome, args.note);
    let newStatus: string = order.status;
    if (args.outcome === "no_answer") {
      if (currentAttempts === 0) newStatus = "Called 01";
      else if (currentAttempts === 1) newStatus = "Called 02";
    }
    const statusHistory =
      newStatus !== order.status
        ? pushStatusHistory(order, newStatus, args.note)
        : (order.statusHistory ?? []);
    await ctx.db.patch(order._id, {
      callAttempts: newAttempts,
      callLog,
      status:       newStatus as any,
      statusHistory,
      lastUpdated:  Date.now(),
    });
    return { success: true, newStatus, callAttempts: newAttempts };
  },
});

export const addNote = mutation({
  args: { orderId: v.id("orders"), text: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const notes = order.adminNotes ?? [];
    await ctx.db.patch(order._id, {
      adminNotes:  [...notes, { text: args.text, timestamp: Date.now() }],
      lastUpdated: Date.now(),
    });
    return { success: true };
  },
});

export const banCustomer = mutation({
  args: { phone: v.string(), isBanned: v.boolean() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer_phone", (q) => q.eq("customerPhone", args.phone))
      .collect();
    for (const order of orders) {
      await ctx.db.patch(order._id, { isBanned: args.isBanned });
    }
    return { success: true, count: orders.length };
  },
});

export const markRetour = mutation({
  args: { orderId: v.id("orders"), reason: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const statusHistory = pushStatusHistory(order, "Retour", args.reason);
    await ctx.db.patch(order._id, {
      status:      "Retour",
      retourReason: args.reason,
      fraudScore:  (order.fraudScore ?? 0) + 1,
      statusHistory,
      lastUpdated: Date.now(),
    });
    return { success: true };
  },
});

export const markCourierSent = mutation({
  args: { orderId: v.id("orders"), trackingId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const statusHistory = pushStatusHistory(order, "Packaged");
    await ctx.db.patch(order._id, {
      status:           "Packaged",
      courierTrackingId: args.trackingId,
      courierSentAt:    Date.now(),
      courierError:     undefined,
      statusHistory,
      lastUpdated:      Date.now(),
    });
    return { success: true };
  },
});

export const markCourierFailed = mutation({
  args: { orderId: v.id("orders"), error: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const statusHistory = pushStatusHistory(order, order.status, `Courier send failed: ${args.error}`);
    await ctx.db.patch(order._id, { courierError: args.error, statusHistory, lastUpdated: Date.now() });
    return { success: true };
  },
});

// ─── ARCHIVE CLEANUP (Phase E) ────────────────────────────────────────────────

const TERMINAL_STATUSES = ["Delivered", "Retour", "Cancelled"] as const;
const SIXTY_DAYS_MS     = 60 * 24 * 60 * 60 * 1000;

export const getArchiveCleanupPreview = query({
  handler: async (ctx) => {
    const orders   = await ctx.db.query("orders").collect();
    const terminal = orders.filter((o) =>
      (TERMINAL_STATUSES as readonly string[]).includes(o.status)
    );
    if (terminal.length === 0) {
      return { eligibleCount: 0, totalTerminal: 0, oldestCreationTime: null };
    }
    const cutoff  = Date.now() - SIXTY_DAYS_MS;
    const eligible = terminal.filter((o) => o._creationTime < cutoff);
    const oldest   = Math.min(...terminal.map((o) => o._creationTime));
    return { eligibleCount: eligible.length, totalTerminal: terminal.length, oldestCreationTime: oldest };
  },
});

export const purgeOldArchive = mutation({
  handler: async (ctx) => {
    const cutoff  = Date.now() - SIXTY_DAYS_MS;
    const orders  = await ctx.db.query("orders").collect();
    const toDelete = orders.filter(
      (o) =>
        (TERMINAL_STATUSES as readonly string[]).includes(o.status) &&
        o._creationTime < cutoff
    );
    for (const order of toDelete) await ctx.db.delete(order._id);
    return { deleted: toDelete.length };
  },
});

/**
 * Fix 3: Delete a specific list of orders by ID.
 * Used by the Archive checkbox selection "Delete selected" action.
 * No status or age restriction — deletes exactly what was passed.
 */
export const purgeByIds = mutation({
  args: { ids: v.array(v.id("orders")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return { deleted: args.ids.length };
  },
});
