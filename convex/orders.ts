import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── MVP Status Union ─────────────────────────────────────────────────────────
const orderStatusMVPValidator = v.union(
  v.literal("new"),
  v.literal("confirmed"),
  v.literal("packaged"),
  v.literal("shipped"),
  v.literal("canceled"),
  v.literal("blocked")
);

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked";

const callOutcomeValidator = v.union(
  v.literal("answered"),
  v.literal("no answer"),
  v.literal("wrong number"),
  v.literal("refused")
);

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

// ─── Legacy → MVP status map ──────────────────────────────────────────────────
export function normalizeLegacyStatus(status: string | undefined): MVPStatus {
  switch (status) {
    // ── already MVP ──
    case "new":       return "new";
    case "confirmed": return "confirmed";
    case "packaged":  return "packaged";
    case "shipped":   return "shipped";
    case "canceled":  return "canceled";
    case "blocked":   return "blocked";
    // ── legacy map ──
    case "Pending":           return "new";
    case "Confirmed":          return "confirmed";
    case "Called no respond":  return "new";
    case "Called 01":          return "new";
    case "Called 02":          return "new";
    case "Packaged":           return "packaged";
    case "Shipped":            return "shipped";
    case "Delivered":          return "shipped"; // closest active equivalent
    case "Retour":             return "canceled";
    case "Cancelled":          return "canceled";
    default:                   return "new";     // safe fallback
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pushStatusHistory(
  order: any,
  status: string,
  reason?: string
): Array<{ status: string; timestamp: number; reason?: string }> {
  const history: Array<{ status: string; timestamp: number; reason?: string }> =
    order.statusHistory ?? [];
  return [...history, { status, timestamp: Date.now(), ...(reason ? { reason } : {}) }];
}

function pushCallLog(
  order: any,
  outcome: CallOutcome,
  note?: string
): Array<{ timestamp: number; outcome: CallOutcome; note?: string }> {
  const log: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> =
    order.callLog ?? [];
  return [...log, { timestamp: Date.now(), outcome, ...(note ? { note } : {}) }];
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GAY-${timestamp}-${random}`;
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    orders.sort((a, b) => b._creationTime - a._creationTime);
    return orders;
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
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
      new: 0, confirmed: 0, packaged: 0, shipped: 0, canceled: 0, blocked: 0,
    };
    orders.forEach((order) => {
      const normalized = normalizeLegacyStatus(order.status);
      counts[normalized]++;
    });
    return counts;
  },
});

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    customerName:    v.string(),
    customerPhone:   v.string(),
    customerWilaya:  v.string(),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
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
    for (let i = 0; i < 5; i++) {
      const existing = await ctx.db
        .query("orders")
        .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
        .first();
      if (!existing) break;
      orderNumber = generateOrderNumber();
    }

    const totalAmount   = product.price + args.deliveryCost;
    const now           = Date.now();
    const initialStatus: MVPStatus = isBanned ? "blocked" : "new";

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      status:          initialStatus,
      customerName:    args.customerName,
      customerPhone:   args.customerPhone,
      customerWilaya:  args.customerWilaya,
      customerCommune: args.customerCommune ?? "",
      customerAddress: args.customerAddress ?? "",
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
      createdAt:       now,
      statusHistory: [{
        status:    initialStatus,
        timestamp: now,
        ...(isBanned ? { reason: "Auto-blocked — banned customer" } : {}),
      }],
    });

    return { orderId, orderNumber, totalAmount };
  },
});

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatusMVPValidator, reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    const statusHistory = pushStatusHistory(order, args.status, args.reason);
    await ctx.db.patch(args.id, { status: args.status, statusHistory, lastUpdated: Date.now() });
    return { success: true };
  },
});

export const updateCustomerInfo = mutation({
  args: {
    id:              v.id("orders"),
    customerName:    v.optional(v.string()),
    customerPhone:   v.optional(v.string()),
    customerWilaya:  v.optional(v.string()),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    notes:           v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(id, { ...updates, lastUpdated: Date.now() });
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

// ─── BULK ACTIONS ─────────────────────────────────────────────────────────────

export const bulkConfirm = mutation({
  args: { ids: v.array(v.id("orders")) },
  handler: async (ctx, args) => {
    const results = { success: 0, failed: 0 };
    for (const id of args.ids) {
      const order = await ctx.db.get(id);
      if (order) {
        const normalized = normalizeLegacyStatus(order.status);
        if (normalized === "new") {
          const statusHistory = pushStatusHistory(order, "confirmed", "Bulk confirmed");
          await ctx.db.patch(id, { status: "confirmed", statusHistory, lastUpdated: Date.now() });
          results.success++;
        } else {
          results.failed++;
        }
      } else {
        results.failed++;
      }
    }
    return results;
  },
});

// ─── CALL LOGGING ─────────────────────────────────────────────────────────────

export const logCallOutcome = mutation({
  args: {
    orderId: v.id("orders"),
    outcome: callOutcomeValidator,
    note:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const callLog     = pushCallLog(order, args.outcome, args.note);
    const callAttempts = (order.callAttempts ?? 0) + 1;
    const noAnswerCount = callLog.filter(l => l.outcome === "no answer").length;

    let newStatus: MVPStatus = normalizeLegacyStatus(order.status);
    let cancelReason: string | undefined;
    let statusHistory = order.statusHistory ?? [];

    if (args.outcome === "wrong number" || args.outcome === "refused") {
      newStatus = "canceled";
      cancelReason = `Canceled: ${args.outcome}`;
      statusHistory = pushStatusHistory(order, newStatus, cancelReason);
    } else if (noAnswerCount >= 2 && newStatus !== "canceled") {
      newStatus = "canceled";
      cancelReason = "Auto-canceled: No answer after 2 attempts";
      statusHistory = pushStatusHistory(order, newStatus, cancelReason);
    }

    await ctx.db.patch(order._id, {
      callLog,
      callAttempts,
      status: newStatus,
      ...(cancelReason ? { cancelReason } : {}),
      ...(newStatus !== normalizeLegacyStatus(order.status) ? { statusHistory } : {}),
      lastUpdated: Date.now(),
    });

    return {
      success: true,
      autoCanceled: newStatus === "canceled" && normalizeLegacyStatus(order.status) !== "canceled",
      cancelReason,
    };
  },
});

// ─── ONE-TIME MIGRATION ───────────────────────────────────────────────────────
// Run once from the Admin panel to convert all legacy-status orders to MVP statuses.

export const migrateOrderStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const MVP_STATUSES = ["new", "confirmed", "packaged", "shipped", "canceled", "blocked"];
    let migrated = 0;
    let skipped  = 0;

    for (const order of orders) {
      if (MVP_STATUSES.includes(order.status ?? "")) {
        skipped++;
        continue;
      }
      const newStatus = normalizeLegacyStatus(order.status);
      const statusHistory = pushStatusHistory(
        order,
        newStatus,
        `Migrated from legacy status: "${order.status ?? "undefined"}"`
      );
      await ctx.db.patch(order._id, {
        status: newStatus,
        statusHistory,
        lastUpdated: Date.now(),
      });
      migrated++;
    }

    return { migrated, skipped, total: orders.length };
  },
});
