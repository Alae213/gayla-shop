import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

type DeliveryType = "Stopdesk" | "Domicile";

interface LineItem {
  quantity: number;
  unitPrice: number;
  // Future: weight, dimensions for more accurate calculation
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
 * @returns Promise<number> - Delivery cost in DZD
 */
export async function recalculateDeliveryCost(
  wilaya: string,
  deliveryType: DeliveryType,
  lineItems: LineItem[],
  fallbackCost: number = 0
): Promise<number> {
  try {
    // Use Convex HTTP client to fetch delivery cost
    // Note: This assumes NEXT_PUBLIC_CONVEX_URL is set
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.warn("CONVEX_URL not set, using fallback cost");
      return fallbackCost;
    }

    const client = new ConvexHttpClient(convexUrl);
    
    // Fetch delivery costs for the wilaya
    const deliveryCosts = await client.query(api.deliveryCosts.getByWilayaName, {
      wilayaName: wilaya,
    });

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
    console.error("Failed to recalculate delivery cost:", error);
    return fallbackCost;
  }
}

/**
 * Debounce wrapper for delivery cost recalculation.
 * Prevents excessive API calls when user rapidly changes quantities.
 * 
 * Usage:
 * ```ts
 * const debouncedRecalc = debounceDeliveryCostRecalc();
 * await debouncedRecalc(wilaya, deliveryType, lineItems, fallbackCost);
 * ```
 */
export function debounceDeliveryCostRecalc(delayMs: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (
    wilaya: string,
    deliveryType: DeliveryType,
    lineItems: LineItem[],
    fallbackCost: number
  ): Promise<number> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        const cost = await recalculateDeliveryCost(
          wilaya,
          deliveryType,
          lineItems,
          fallbackCost
        );
        resolve(cost);
      }, delayMs);
    });
  };
}
