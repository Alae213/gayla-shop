import type { CartState } from "./types/cart";
import { CART_STORAGE_KEY, CART_MAX_ITEMS } from "./types/cart";

const EMPTY: CartState = { items: [], updatedAt: 0 };

export function readCartFromStorage(): CartState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return EMPTY;

    const parsed = JSON.parse(raw) as unknown;

    // Shape validation — treat corrupted data as empty
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as CartState).items)
    ) {
      console.warn("[gayla-cart] Corrupted cart detected — resetting.");
      localStorage.removeItem(CART_STORAGE_KEY);
      return EMPTY;
    }

    const state = parsed as CartState;

    // Clamp to max in case of external tampering
    if (state.items.length > CART_MAX_ITEMS) {
      state.items = state.items.slice(0, CART_MAX_ITEMS);
    }

    return state;
  } catch {
    console.warn("[gayla-cart] JSON parse error — resetting cart.");
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* silent */ }
    return EMPTY;
  }
}

export function writeCartToStorage(state: CartState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage quota exceeded or private browsing — fail silently
    console.warn("[gayla-cart] Could not write to localStorage:", e);
  }
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* silent */ }
}
