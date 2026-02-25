import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

type DeliveryType = "Stopdesk" | "Domicile";

interface LineItem {
  quantity: number;
  unitPrice: number;
  // Future: weight, dimensions for more accurate calculation
}

/**
 * Custom error for aborted operations
 */
export class AbortError extends Error {
  constructor(message: string = "Operation aborted") {
    super(message);
    this.name = "AbortError";
  }
}

/**
 * Recalculate delivery cost based on destination and order contents.
 * 
 * Currently fetches delivery cost from deliveryCosts table (Yalidin rates).
 * Future enhancement: Calculate based on package weight/dimensions.
 * 
 * @param wilaya - Customer wilaya name (e.g., "Batna")
 * @param deliveryType - "Stopdesk" or "Domicile"
 * @param lineItems - Array of line items (for future weight calculation)
 * @param fallbackCost - Previous delivery cost to use if fetch fails
 * @param signal - Optional AbortSignal to cancel the request
 * @returns Promise<number> - Delivery cost in DZD
 * @throws {AbortError} - If the request is cancelled
 */
export async function recalculateDeliveryCost(
  wilaya: string,
  deliveryType: DeliveryType,
  lineItems: LineItem[],
  fallbackCost: number = 0,
  signal?: AbortSignal
): Promise<number> {
  // Check if already aborted
  if (signal?.aborted) {
    throw new AbortError("Delivery cost calculation aborted");
  }

  try {
    // Use Convex HTTP client to fetch delivery cost
    // Note: This assumes NEXT_PUBLIC_CONVEX_URL is set
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.warn("CONVEX_URL not set, using fallback cost");
      return fallbackCost;
    }

    // Create abort listener
    const abortPromise = new Promise<never>((_, reject) => {
      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new AbortError("Delivery cost calculation aborted"));
        });
      }
    });

    const client = new ConvexHttpClient(convexUrl);
    
    // Race between query and abort signal
    const deliveryCosts = await Promise.race([
      client.query(api.deliveryCosts.getByWilayaName, {
        wilayaName: wilaya,
      }),
      abortPromise,
    ]);

    // Check again after async operation
    if (signal?.aborted) {
      throw new AbortError("Delivery cost calculation aborted");
    }

    if (!deliveryCosts) {
      console.warn(`No delivery cost found for wilaya: ${wilaya}, using fallback`);
      return fallbackCost;
    }

    // Return appropriate cost based on delivery type
    const cost = deliveryType === "Stopdesk" 
      ? deliveryCosts.stopdeskCost 
      : deliveryCosts.domicileCost;

    return cost;
  } catch (error) {
    // Re-throw AbortErrors
    if (error instanceof AbortError) {
      throw error;
    }
    
    console.error("Failed to recalculate delivery cost:", error);
    return fallbackCost;
  }
}

/**
 * Debounce wrapper for delivery cost recalculation with abort support.
 * Prevents excessive API calls when user rapidly changes quantities.
 * Automatically cancels previous pending requests.
 * 
 * Usage:
 * ```ts
 * const debouncedRecalc = debounceDeliveryCostRecalc();
 * await debouncedRecalc(wilaya, deliveryType, lineItems, fallbackCost);
 * ```
 */
export function debounceDeliveryCostRecalc(delayMs: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;
  let currentAbortController: AbortController | null = null;

  return (
    wilaya: string,
    deliveryType: DeliveryType,
    lineItems: LineItem[],
    fallbackCost: number
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      // Cancel previous request
      if (currentAbortController) {
        currentAbortController.abort();
      }

      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Create new abort controller for this request
      currentAbortController = new AbortController();
      const signal = currentAbortController.signal;

      timeoutId = setTimeout(async () => {
        try {
          const cost = await recalculateDeliveryCost(
            wilaya,
            deliveryType,
            lineItems,
            fallbackCost,
            signal
          );
          resolve(cost);
        } catch (error) {
          // Don't reject on abort - just silently ignore
          if (error instanceof AbortError) {
            console.log("Previous delivery calculation cancelled");
            resolve(fallbackCost);
          } else {
            reject(error);
          }
        }
      }, delayMs);
    });
  };
}

/**
 * Cancel all pending delivery cost calculations.
 * Useful for cleanup when component unmounts.
 */
let globalAbortController: AbortController | null = null;

export function cancelPendingDeliveryCostCalculations() {
  if (globalAbortController) {
    globalAbortController.abort();
    globalAbortController = null;
  }
}

export function getDeliveryCostAbortSignal(): AbortSignal {
  if (!globalAbortController || globalAbortController.signal.aborted) {
    globalAbortController = new AbortController();
  }
  return globalAbortController.signal;
}
