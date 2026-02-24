/**
 * Cart Validation Utilities
 * Validates cart items against live product data on checkout
 */

import { Doc } from "@/convex/_generated/dataModel";
import { CartItem } from "@/lib/types/cart";

export interface CartConflict {
  type: "inactive" | "price_change" | "disabled_variant" | "product_deleted";
  item: CartItem;
  message: string;
  oldPrice?: number;
  newPrice?: number;
  suggestedAction: "remove" | "update_price" | "update_variants";
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: CartConflict[];
  validItems: CartItem[];
}

/**
 * Validate cart items against live product data
 */
export function validateCart(
  cartItems: CartItem[],
  products: (Doc<"products"> | null)[]
): ValidationResult {
  const conflicts: CartConflict[] = [];
  const validItems: CartItem[] = [];

  cartItems.forEach((item, index) => {
    const product = products[index];

    // Product deleted or not found
    if (!product) {
      conflicts.push({
        type: "product_deleted",
        item,
        message: `"${item.name}" is no longer available`,
        suggestedAction: "remove",
      });
      return;
    }

    // Product inactive
    if (product.status !== "Active") {
      conflicts.push({
        type: "inactive",
        item,
        message: `"${item.name}" is currently ${product.status.toLowerCase()}`,
        suggestedAction: "remove",
      });
      return;
    }

    // Price changed
    if (product.price !== item.price) {
      conflicts.push({
        type: "price_change",
        item,
        message: `Price changed for "${item.name}"`,
        oldPrice: item.price,
        newPrice: product.price,
        suggestedAction: "update_price",
      });
      // Still add to valid items but with warning
      validItems.push({ ...item, price: product.price });
      return;
    }

    // Check variant availability (if using new variantGroups)
    if (product.variantGroups && product.variantGroups.length > 0) {
      const hasDisabledVariant = Object.entries(item.variants).some(
        ([groupName, value]) => {
          const group = product.variantGroups?.find((g) => g.name === groupName);
          if (!group) return true; // Group no longer exists

          const variant = group.values.find((v) => v.label === value);
          return !variant || !variant.enabled;
        }
      );

      if (hasDisabledVariant) {
        conflicts.push({
          type: "disabled_variant",
          item,
          message: `Selected variant for "${item.name}" is no longer available`,
          suggestedAction: "remove",
        });
        return;
      }
    }

    // Item is valid
    validItems.push(item);
  });

  return {
    isValid: conflicts.length === 0,
    conflicts,
    validItems,
  };
}

/**
 * Get user-friendly conflict summary
 */
export function getConflictSummary(conflicts: CartConflict[]): string {
  if (conflicts.length === 0) return "";

  const removed = conflicts.filter((c) => c.suggestedAction === "remove").length;
  const priceChanges = conflicts.filter(
    (c) => c.suggestedAction === "update_price"
  ).length;

  const parts: string[] = [];

  if (removed > 0) {
    parts.push(`${removed} item${removed > 1 ? "s" : ""} unavailable`);
  }

  if (priceChanges > 0) {
    parts.push(`${priceChanges} price change${priceChanges > 1 ? "s" : ""}`);
  }

  return parts.join(" and ");
}

/**
 * Auto-resolve conflicts by removing/updating items
 */
export function resolveConflicts(
  cartItems: CartItem[],
  conflicts: CartConflict[]
): CartItem[] {
  const conflictItems = new Set(
    conflicts.map((c) => `${c.item.productId}-${JSON.stringify(c.item.variants)}`)
  );

  return cartItems
    .filter((item) => {
      const key = `${item.productId}-${JSON.stringify(item.variants)}`;
      const conflict = conflicts.find(
        (c) =>
          `${c.item.productId}-${JSON.stringify(c.item.variants)}` === key
      );
      // Keep item if no conflict or conflict is price update
      return !conflict || conflict.suggestedAction === "update_price";
    })
    .map((item) => {
      // Apply price updates
      const conflict = conflicts.find(
        (c) =>
          c.item.productId === item.productId &&
          JSON.stringify(c.item.variants) === JSON.stringify(item.variants)
      );

      if (conflict?.newPrice) {
        return { ...item, price: conflict.newPrice };
      }

      return item;
    });
}
