/**
 * localStorage Cart Persistence Utilities
 * Handles cart sync with browser storage
 */

import {
  CartState,
  CART_STORAGE_KEY,
  EMPTY_CART,
  isValidCartState,
  calculateCartTotals,
} from "@/lib/types/cart";

/**
 * Check if localStorage is available (SSR-safe)
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load cart from localStorage
 */
export function getCart(): CartState {
  if (!isLocalStorageAvailable()) return EMPTY_CART;

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return EMPTY_CART;

    const parsed = JSON.parse(stored);
    
    // Validate structure
    if (!isValidCartState(parsed)) {
      console.warn("Invalid cart state in localStorage, resetting");
      clearCart();
      return EMPTY_CART;
    }

    // Recalculate totals in case of data corruption
    const { itemCount, subtotal } = calculateCartTotals(parsed.items);
    return {
      ...parsed,
      itemCount,
      subtotal,
    };
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    clearCart();
    return EMPTY_CART;
  }
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: CartState): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available, cart not persisted");
    return false;
  }

  try {
    const serialized = JSON.stringify(cart);
    window.localStorage.setItem(CART_STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    // Handle quota exceeded or other errors
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded, cannot save cart");
      // Optionally: clear old cart and retry
      clearCart();
      try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return true;
      } catch {
        return false;
      }
    }
    console.error("Failed to save cart to localStorage:", error);
    return false;
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCart(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart from localStorage:", error);
  }
}

/**
 * Get localStorage usage estimate (0-1 where 1 = full)
 */
export function getStorageUsage(): number {
  if (!isLocalStorageAvailable()) return 0;

  try {
    // Estimate: sum all localStorage values length
    let total = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        const value = window.localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }

    // Most browsers: ~5-10MB limit, estimate 5MB
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    return Math.min(total / estimatedLimit, 1);
  } catch {
    return 0;
  }
}

/**
 * Check if storage is approaching capacity (>80%)
 */
export function isStorageNearCapacity(): boolean {
  return getStorageUsage() > 0.8;
}
