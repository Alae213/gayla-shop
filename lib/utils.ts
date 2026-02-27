/**
 * Core utilities
 *
 * This file exports the `cn()` helper and is imported as `@/lib/utils` throughout the codebase.
 * It coexists with the `lib/utils/` directory (which contains domain-specific utilities like
 * yalidin-api.ts). This is intentional:
 * - `@/lib/utils` → imports THIS file (cn, formatPrice, etc.)
 * - `@/lib/utils/yalidin-api` → imports from the utils/ subdirectory
 *
 * DO NOT rename this file to `cn.ts` — it would require updating 50+ import statements.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: string = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
  }).format(price);
}
