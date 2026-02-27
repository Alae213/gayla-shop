"use client";

/**
 * useCartCount - Lightweight hook for cart badge display
 * Returns only count + isLoaded, avoiding full cart state overhead
 *
 * USE THIS IN:
 * - Header/Navbar components that only show cart badge count
 *
 * DO NOT USE:
 * - When you need cart items, operations, or full state
 * - Use useCart() for those cases instead
 */

import { useState, useEffect } from "react";
import { getCart } from "@/lib/utils/cart-storage";

export interface UseCartCountReturn {
  /** Number of distinct cart lines (not total quantity) */
  count: number;
  /** True after localStorage has been read */
  isLoaded: boolean;
}

export function useCartCount(): UseCartCountReturn {
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load count from localStorage on mount
    const cart = getCart();
    setCount(cart.items.length);
    setIsLoaded(true);

    // Listen for cart changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gayla-shop-cart" && e.newValue) {
        try {
          const newCart = JSON.parse(e.newValue);
          setCount(newCart.items?.length || 0);
        } catch {
          setCount(0);
        }
      }
    };

    // Listen for custom cart update events (same-tab updates)
    const handleCartUpdate = () => {
      const cart = getCart();
      setCount(cart.items.length);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  return { count, isLoaded };
}
