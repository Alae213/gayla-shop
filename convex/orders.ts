import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── DUPLICATE PREVENTION CONFIG ───────────────────────────────────────────
const DUPLICATE_WINDOW_MS = 30000; // 30 seconds

// ─── MVP Status Union ──────────────────────────────────────────────────────────────────────────────────────────────
const orderStatusMVPValidator = v.union(
  v.literal("new"),
  v.literal("confirmed"),
  v.literal("packaged"),
  v.literal("shipped"),
  v.literal("canceled"),
  v.literal("blocked"),
  v.literal("hold")
);

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

const callOutcomeValidator = v.union(
  v.literal("answered"),
  v.literal("no answer"),
  v.literal("wrong number"),
  v.literal("refused")
);

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

// Line item validator
const lineItemValidator = v.object({
  productId: v.id("products"),
  productName: v.string(),
  productSlug: v.optional(v.string()),
  quantity: v.number(),
  unitPrice: v.number(),
  variants: v.optional(v.record(v.string(), v.string())),
  lineTotal: v.number(),
  thumbnail: v.optional(v.string()),
});

// ─── Legacy → MVP status map ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function normalizeLegacyStatus(status: string | undefined): MVPStatus {
  switch (status) {
    case "new":       return "new";
    case "confirmed": return "confirmed";
    case "packaged":  return "packaged";
    case "shipped":   return "shipped";
    case "canceled":  return "canceled";
    case "blocked":   return "blocked";
    case "hold":      return "hold";
    case "Pending":           return "new";
    case "Confirmed":          return "confirmed";
    case "Called no respond":  return "new";
    case "Called 01":          return "new";
    case "Called 02":          return "new";
    case "Packaged":           return "packaged";
    case "Shipped":            return "shipped";
    case "Delivered":          return "shipped";
    case "Retour":             return "canceled";
    case "Cancelled":          return "canceled";
    default:                   return "new";
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────────────────────

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

function pushChangeLog(
  order: any,
  action: string,
  changes?: string,
  adminName?: string
): Array<{ timestamp: number; adminName?: string; action: string; changes?: string }> {
  const log: Array<{ timestamp: number; adminName?: string; action: string; changes?: string }> =
    order.changeLog ?? [];
  return [...log, { timestamp: Date.now(), action, ...(changes ? { changes } : {}), ...(adminName ? { adminName } : {}) }];
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GAY-${timestamp}-${random}`;
}

/**
 * Check if an order is a duplicate based on:
 * - Same customer phone
 * - Same line items (product IDs, quantities, variants)
 * - Created within DUPLICATE_WINDOW_MS
 */
function isDuplicateOrder(
  existingOrder: any,
  newLineItems: any[],
  cutoffTime: number
): boolean {
  // Check if order is recent enough
  const orderTime = existingOrder.createdAt ?? existingOrder._creationTime;
  if (orderTime < cutoffTime) return false;

  // Get existing line items (handle legacy single-product orders)
  const existingLineItems = existingOrder.lineItems ?? [
    {
      productId: existingOrder.productId,
      quantity: 1,
      variants: existingOrder.selectedVariant,
    },
  ];

  // Quick check: different number of items
  if (existingLineItems.length !== newLineItems.length) return false;

  // Deep compare: same products, quantities, and variants
  const newItemsSorted = [...newLineItems].sort((a, b) =>
    a.productId.localeCompare(b.productId)
  );
  const existingItemsSorted = [...existingLineItems].sort((a, b) =>
    a.productId.localeCompare(b.productId)
  );

  for (let i = 0; i < newItemsSorted.length; i++) {
    const newItem = newItemsSorted[i];
    const existingItem = existingItemsSorted[i];

    if (
      newItem.productId !== existingItem.productId ||
      newItem.quantity !== existingItem.quantity ||
      JSON.stringify(newItem.variants ?? {}) !== JSON.stringify(existingItem.variants ?? {})
    ) {
      return false;
    }
  }

  return true;
}

// ─── QUERIES ───────────────────────────────────────────────────────────────────────────────────────────────────────────────

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
      new: 0, confirmed: 0, packaged: 0, shipped: 0, canceled: 0, blocked: 0, hold: 0,
    };
    orders.forEach((order) => {
      const normalized = normalizeLegacyStatus(order.status);
      counts[normalized]++;
    });
    return counts;
  },
});

// ─── CREATE ──────────────────────────────────────────────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    customerName:    v.string(),
    customerPhone:   v.string(),
    customerWilaya:  v.string(),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    deliveryType:    v.union(v.literal("Domicile"), v.literal("Stopdesk")),
    deliveryCost:    v.number(),
    // Legacy single-product fields (optional, for backward compatibility)
    productId:       v.optional(v.id("products")),
    selectedVariant: v.optional(
      v.object({ size: v.optional(v.string()), color: v.optional(v.string()) })
    ),
    // New multi-product field
    lineItems:       v.optional(v.array(lineItemValidator)),
  },
  handler: async (ctx, args) => {
    // Determine if this is a legacy single-product order or multi-product order
    const isLegacy = args.productId && !args.lineItems;
    const isMultiProduct = args.lineItems && args.lineItems.length > 0;

    if (!isLegacy && !isMultiProduct) {
      throw new Error("Either productId or lineItems must be provided");
    }

    // Calculate total and prepare order data
    let productPrice = 0;
    let productName = "";
    let productSlug = "";
    let finalLineItems: any[] | undefined;

    if (isLegacy) {
      // Legacy: single product
      const product = await ctx.db.get(args.productId!);
      if (!product) throw new Error("Product not found");
      productPrice = product.price;
      productName = product.title;
      productSlug = product.slug;
      // Create line items array for duplicate check
      finalLineItems = [
        {
          productId: args.productId!,
          productName,
          productSlug,
          quantity: 1,
          unitPrice: productPrice,
          variants: args.selectedVariant,
          lineTotal: productPrice,
        },
      ];
    } else if (isMultiProduct && args.lineItems) {
      // New: multiple line items
      finalLineItems = args.lineItems;
      productPrice = finalLineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      // For backward compatibility, set productName to first item
      productName = finalLineItems[0].productName;
      productSlug = finalLineItems[0].productSlug || "";
    }

    // ─── DUPLICATE DETECTION ───────────────────────────────────────────────
    // Check for recent orders from same phone with same items
    const cutoffTime = Date.now() - DUPLICATE_WINDOW_MS;
    const recentOrders = await ctx.db
      .query("orders")
      .withIndex("by_customer_phone", (q) => q.eq("customerPhone", args.customerPhone))
      .collect();

    // Find duplicate order
    const duplicate = recentOrders.find((order) =>
      isDuplicateOrder(order, finalLineItems!, cutoffTime)
    );

    if (duplicate) {
      // Return existing order instead of creating duplicate
      console.log(`Duplicate order detected for phone ${args.customerPhone}, returning existing order ${duplicate.orderNumber}`);
      return {
        orderId: duplicate._id,
        orderNumber: duplicate.orderNumber,
        totalAmount: duplicate.totalAmount,
        isDuplicate: true,
      };
    }
    // ───────────────────────────────────────────────────────────────────────

    // Check if customer is banned
    const bannedCheck = await ctx.db
      .query("orders")
      .withIndex("by_customer_phone", (q) => q.eq("customerPhone", args.customerPhone))
      .first();
    const isBanned = bannedCheck?.isBanned === true;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    for (let i = 0; i < 5; i++) {
      const existing = await ctx.db
        .query("orders")
        .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
        .first();
      if (!existing) break;
      orderNumber = generateOrderNumber();
    }

    const totalAmount    = productPrice + args.deliveryCost;
    const now            = Date.now();
    const initialStatus: MVPStatus = isBanned ? "blocked" : "new";

    // Create order with appropriate fields
    const orderData: any = {
      orderNumber,
      status:          initialStatus,
      customerName:    args.customerName,
      customerPhone:   args.customerPhone,
      customerWilaya:  args.customerWilaya,
      customerCommune: args.customerCommune ?? "",
      customerAddress: args.customerAddress ?? "",
      deliveryType:    args.deliveryType,
      deliveryCost:    args.deliveryCost,
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
    };

    // Add legacy fields or lineItems
    if (isLegacy) {
      orderData.productId = args.productId;
      orderData.productName = productName;
      orderData.productPrice = productPrice;
      orderData.productSlug = productSlug;
      orderData.selectedVariant = args.selectedVariant;
    } else if (isMultiProduct && finalLineItems) {
      orderData.lineItems = finalLineItems;
      // Store first product info for backward compatibility
      orderData.productId = finalLineItems[0].productId;
      orderData.productName = productName;
      orderData.productPrice = productPrice;
      orderData.productSlug = productSlug;
    }

    const orderId = await ctx.db.insert("orders", orderData);

    return { orderId, orderNumber, totalAmount };
  },
});

// ─── UPDATE LINE ITEMS ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const updateLineItems = mutation({
  args: {
    id: v.id("orders"),
    lineItems: v.array(lineItemValidator),
    adminName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    // Calculate new subtotal and total
    const subtotal = args.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const newTotalAmount = subtotal + order.deliveryCost;

    // Generate change summary
    const previousCount = order.lineItems?.length ?? 1;
    const newCount = args.lineItems.length;
    const previousTotal = order.totalAmount ?? order.productPrice! + order.deliveryCost;
    
    const changeSummary = [
      `Items: ${previousCount} → ${newCount}`,
      `Subtotal: ${previousTotal - order.deliveryCost} DA → ${subtotal} DA`,
      `Total: ${previousTotal} DA → ${newTotalAmount} DA`,
    ].join(", ");

    // Log the change
    const changeLog = pushChangeLog(
      order,
      "line_items_updated",
      changeSummary,
      args.adminName
    );

    await ctx.db.patch(args.id, {
      lineItems: args.lineItems,
      totalAmount: newTotalAmount,
      changeLog,
      lastUpdated: Date.now(),
    });

    return { success: true, newTotalAmount };
  },
});

// ─── UPDATE DELIVERY DESTINATION ────────────────────────────────────────────────────────────────────────────────────────────────────────

export const updateDeliveryDestination = mutation({
  args: {
    id: v.id("orders"),
    wilaya: v.string(),
    commune: v.string(),
    deliveryType: v.union(v.literal("Domicile"), v.literal("Stopdesk")),
    newDeliveryCost: v.number(),
    adminName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    // Calculate new total
    const subtotal = order.lineItems
      ? order.lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
      : order.productPrice ?? 0;
    
    const newTotalAmount = subtotal + args.newDeliveryCost;
    const previousTotal = order.totalAmount;

    // Generate change summary
    const changeSummary = [
      `Destination: ${order.customerWilaya}, ${order.customerCommune} → ${args.wilaya}, ${args.commune}`,
      `Type: ${order.deliveryType} → ${args.deliveryType}`,
      `Cost: ${order.deliveryCost} DA → ${args.newDeliveryCost} DA`,
      `Total: ${previousTotal} DA → ${newTotalAmount} DA`,
    ].join(", ");

    // Log the change
    const changeLog = pushChangeLog(
      order,
      "delivery_updated",
      changeSummary,
      args.adminName
    );

    await ctx.db.patch(args.id, {
      customerWilaya: args.wilaya,
      customerCommune: args.commune,
      deliveryType: args.deliveryType,
      deliveryCost: args.newDeliveryCost,
      totalAmount: newTotalAmount,
      changeLog,
      lastUpdated: Date.now(),
    });

    return { success: true, newTotalAmount };
  },
});

// ─── UPDATE STATUS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

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

export const update = mutation({
  args: {
    id:              v.id("orders"),
    customerName:    v.optional(v.string()),
    customerPhone:   v.optional(v.string()),
    customerWilaya:  v.optional(v.string()),
    customerCommune: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    deliveryCost:    v.optional(v.number()),
    status:          v.optional(v.string()), // Accept any string, normalize internally
  },
  handler: async (ctx, args) => {
    const { id, status, ...updates } = args;
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    
    const patches: any = { ...updates, lastUpdated: Date.now() };
    
    // Handle status update with normalization
    if (status !== undefined) {
      const normalizedStatus = normalizeLegacyStatus(status);
      const currentNormalized = normalizeLegacyStatus(order.status);
      if (normalizedStatus !== currentNormalized) {
        const statusHistory = pushStatusHistory(order, normalizedStatus, "Updated via order details modal");
        patches.status = normalizedStatus;
        patches.statusHistory = statusHistory;
      }
    }
    
    await ctx.db.patch(id, patches);
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

// ─── BULK ACTIONS ────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const bulkConfirm = mutation({
  args: { ids: v.array(v.id("orders")) },
  handler: async (ctx, args) => {
    const results = { success: 0, failed: 0 };
    for (const id of args.ids) {
      const order = await ctx.db.get(id);
      if (order) {
        const normalized = normalizeLegacyStatus(order.status);
        if (normalized === "new" || normalized === "hold") {
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

export const bulkCancel = mutation({
  args: {
    ids:    v.array(v.id("orders")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = { success: 0, failed: 0, skipped: 0 };
    const reason = args.reason ?? "Bulk canceled by admin";

    for (const id of args.ids) {
      try {
        const order = await ctx.db.get(id);
        if (!order) { results.failed++; continue; }

        const normalized = normalizeLegacyStatus(order.status);
        if (normalized === "canceled" || normalized === "blocked") {
          results.skipped++;
          continue;
        }
        if (normalized === "shipped") {
          results.failed++;
          continue;
        }

        const statusHistory = pushStatusHistory(order, "canceled", reason);
        await ctx.db.patch(id, {
          status: "canceled",
          cancelReason: reason,
          statusHistory,
          lastUpdated: Date.now(),
        });
        results.success++;
      } catch {
        results.failed++;
      }
    }

    return results;
  },
});

// ─── UNBLOCK ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const unblockCustomer = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    const statusHistory = pushStatusHistory(order, "new", "Unblocked by admin");
    await ctx.db.patch(args.id, {
      status: "new",
      isBanned: false,
      cancelReason: undefined,
      statusHistory,
      lastUpdated: Date.now(),
    });
    return { success: true };
  },
});

export const bulkUnblock = mutation({
  args: { ids: v.array(v.id("orders")) },
  handler: async (ctx, args) => {
    const results = { success: 0, failed: 0 };
    for (const id of args.ids) {
      try {
        const order = await ctx.db.get(id);
        if (!order) { results.failed++; continue; }
        const statusHistory = pushStatusHistory(order, "new", "Bulk unblocked by admin");
        await ctx.db.patch(id, {
          status: "new",
          isBanned: false,
          cancelReason: undefined,
          statusHistory,
          lastUpdated: Date.now(),
        });
        results.success++;
      } catch {
        results.failed++;
      }
    }
    return results;
  },
});

// ─── CALL LOGGING ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const logCallOutcome = mutation({
  args: {
    orderId: v.id("orders"),
    outcome: callOutcomeValidator,
    note:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const callLog = pushCallLog(order, args.outcome, args.note);

    const noAnswerCount = callLog.filter(l => l.outcome === "no answer").length;
    const callAttempts  = noAnswerCount;

    let newStatus: MVPStatus    = normalizeLegacyStatus(order.status);
    let cancelReason: string | undefined;
    let statusHistory           = order.statusHistory ?? [];

    // REMOVED: Auto-cancel for "refused" outcome
    // Admin can manually cancel if needed via existing controls
    
    if (args.outcome === "wrong number") {
      newStatus     = "hold";
      statusHistory = pushStatusHistory(order, newStatus, "Wrong number reported — awaiting phone correction");
    } else if (noAnswerCount >= 2 && newStatus !== "canceled") {
      newStatus    = "canceled";
      cancelReason = "Auto-canceled: No answer after 2 attempts";
      statusHistory = pushStatusHistory(order, newStatus, cancelReason);
    }

    const prevNormalized = normalizeLegacyStatus(order.status);
    const statusChanged  = newStatus !== prevNormalized;

    await ctx.db.patch(order._id, {
      callLog,
      callAttempts,
      status: newStatus,
      ...(cancelReason ? { cancelReason } : {}),
      ...(statusChanged ? { statusHistory } : {}),
      lastUpdated: Date.now(),
    });

    return {
      success:      true,
      autoCanceled: newStatus === "canceled" && prevNormalized !== "canceled",
      wrongNumber:  newStatus === "hold" && args.outcome === "wrong number",
      cancelReason,
    };
  },
});

// ─── RESET CALL ATTEMPTS (for Undo auto-cancel) ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const resetCallAttempts = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    const callLog     = (order.callLog ?? []).filter((l: any) => l.outcome !== "no answer");
    const callAttempts = 0;
    const statusHistory = pushStatusHistory(order, "new", "Auto-cancel undone by admin");
    await ctx.db.patch(args.id, {
      callAttempts,
      callLog,
      status: "new",
      statusHistory,
      lastUpdated: Date.now(),
    });
    return { success: true };
  },
});

// ─── ADMIN NOTES ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const addNote = mutation({
  args: {
    orderId: v.id("orders"),
    text:    v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    
    const adminNotes = order.adminNotes ?? [];
    const newNote = { text: args.text, timestamp: Date.now() };
    
    await ctx.db.patch(args.orderId, {
      adminNotes: [...adminNotes, newNote],
      lastUpdated: Date.now(),
    });
    
    return { success: true };
  },
});

// ─── BAN/UNBAN CUSTOMER ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const banCustomer = mutation({
  args: {
    phone:    v.string(),
    isBanned: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Update all orders from this phone number
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer_phone", (q) => q.eq("customerPhone", args.phone))
      .collect();
    
    for (const order of orders) {
      const statusHistory = args.isBanned
        ? pushStatusHistory(order, "blocked", "Customer banned by admin")
        : pushStatusHistory(order, normalizeLegacyStatus(order.status), "Customer unbanned by admin");
      
      await ctx.db.patch(order._id, {
        isBanned: args.isBanned,
        ...(args.isBanned ? { status: "blocked" } : {}),
        statusHistory,
        lastUpdated: Date.now(),
      });
    }
    
    return { success: true, affectedOrders: orders.length };
  },
});

// ─── MARK AS RETOUR ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const markRetour = mutation({
  args: {
    orderId: v.id("orders"),
    reason:  v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    
    const statusHistory = pushStatusHistory(order, "canceled", `Retour: ${args.reason}`);
    
    // Increment fraud score for retours
    const fraudScore = (order.fraudScore ?? 0) + 1;
    
    await ctx.db.patch(args.orderId, {
      status: "canceled",
      retourReason: args.reason,
      fraudScore,
      statusHistory,
      lastUpdated: Date.now(),
    });
    
    return { success: true };
  },
});

// ─── AUTO-PURGE ARCHIVE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Deletes terminal orders (canceled / blocked) older than 60 days.
 * Called daily at 02:00 UTC by the "purge-old-archive" cron job.
 *
 * FIX 21C: Uses the by_status index to fetch only terminal-status documents
 * instead of a full-table scan, keeping the cron fast as order volume grows.
 * Age filtering is done in JS (no timestamp index exists).
 */
export const purgeOldArchive = mutation({
  args: {},
  handler: async (ctx) => {
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - SIXTY_DAYS_MS;

    // Fetch only canceled and blocked orders via the by_status index
    const [canceledOrders, blockedOrders] = await Promise.all([
      ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", "canceled")).collect(),
      ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", "blocked")).collect(),
    ]);

    const terminalOrders = [...canceledOrders, ...blockedOrders];
    let purged = 0;

    for (const order of terminalOrders) {
      const age = order.createdAt ?? order._creationTime;
      if (age < cutoff) {
        await ctx.db.delete(order._id);
        purged++;
      }
    }

    return { purged };
  },
});

// ─── ONE-TIME MIGRATION ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const migrateOrderStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const MVP_STATUSES = ["new", "confirmed", "packaged", "shipped", "canceled", "blocked", "hold"];
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
