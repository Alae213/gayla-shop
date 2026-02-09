"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Send order confirmation email to customer
 * DISABLED: Email feature not configured yet
 */
export const sendOrderConfirmation = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    console.log("📧 Email feature disabled. Order ID:", args.orderId);
    return { success: false, error: "Email service not configured" };
  },
});

/**
 * Send order notification to admin
 * DISABLED: Email feature not configured yet
 */
export const sendAdminNotification = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    console.log("📧 Email feature disabled. Order ID:", args.orderId);
    return { success: false, error: "Email service not configured" };
  },
});
