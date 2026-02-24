/**
 * Yalidin API Integration Utilities
 * Provides delivery cost calculation and destination management
 */

import { WILAYAS } from "@/lib/constants";

export interface DeliveryCostRequest {
  wilayaId: number;
  communeName?: string;
  deliveryType: "Stopdesk" | "Domicile";
}

export interface DeliveryCostResponse {
  cost: number;
  wilayaName: string;
  communeName?: string;
}

/**
 * Calculate delivery cost using Yalidin API or fallback to stored costs
 * 
 * NOTE: This implementation uses Convex deliveryCosts as fallback.
 * To integrate real Yalidin API, replace this with actual API calls:
 * - Endpoint: https://api.yalidin.com/v1/delivery/cost (example)
 * - Auth: API key in headers
 * - Rate limiting: implement caching strategy
 */
export async function calculateDeliveryCost(
  request: DeliveryCostRequest
): Promise<DeliveryCostResponse> {
  const wilaya = WILAYAS.find((w) => w.id === request.wilayaId);
  
  if (!wilaya) {
    throw new Error("Invalid wilaya ID");
  }

  // TODO: Replace with actual Yalidin API call when credentials available
  // Example:
  // const response = await fetch('https://api.yalidin.com/v1/delivery/cost', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.YALIDIN_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     wilaya_id: request.wilayaId,
  //     commune: request.communeName,
  //     delivery_type: request.deliveryType,
  //   }),
  // });
  // const data = await response.json();
  // return { cost: data.delivery_cost, wilayaName: wilaya.name };

  // Fallback: This will be handled by Convex query in the component
  // Return structure for type safety
  return {
    cost: 0, // Will be fetched from Convex
    wilayaName: wilaya.name,
    communeName: request.communeName,
  };
}

/**
 * Get list of Yalidin stopdesk agencies for a commune
 * 
 * NOTE: Placeholder for future Yalidin API integration
 */
export async function getStopDeskAgencies(
  wilayaId: number,
  communeName: string
): Promise<string[]> {
  // TODO: Integrate with Yalidin API to fetch real stopdesk locations
  // For now, return generic stopdesk names
  return [
    `Yalidin ${communeName} Centre`,
    `Yalidin ${communeName} Annexe`,
  ];
}

/**
 * Validate Algerian phone number format
 */
export function isValidAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^0[5-7][0-9]{8}$/.test(cleaned);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
