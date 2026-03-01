import { Id } from "@/convex/_generated/dataModel";

/**
 * Order Status Types
 * Represents the lifecycle stages of an order.
 */
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Called 01"
  | "Called 02"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered"
  | "Retour";

export type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

/**
 * Line Item (Product in Order)
 */
export interface LineItem {
  productId: Id<"products">;
  productName: string;
  productSlug?: string;
  quantity: number;
  unitPrice: number;
  variants?: Record<string, string>;
  lineTotal: number;
  thumbnail?: string;
}

/**
 * Call Log Entry
 */
export interface CallLog {
  timestamp: number;
  outcome: "answered" | "no_answer";
  note?: string;
}

/**
 * Status History Entry
 */
export interface StatusHistory {
  status: string;
  timestamp: number;
  reason?: string;
}

/**
 * Admin Note
 */
export interface AdminNote {
  text: string;
  timestamp: number;
}

/**
 * Change Log Entry
 */
export interface ChangeLog {
  timestamp: number;
  adminName?: string;
  action: string;
  changes?: string;
}

/**
 * Complete Order Interface
 */
export interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  customerCommune: string;
  customerAddress: string;
  deliveryType: "Domicile" | "Stopdesk";
  deliveryCost: number;
  // Legacy single-product fields
  productName?: string;
  productPrice?: number;
  productSlug?: string;
  selectedVariant?: { size?: string; color?: string };
  // New multi-product field
  lineItems?: LineItem[];
  totalAmount: number;
  lastUpdated: number;
  callAttempts?: number;
  callLog?: CallLog[];
  statusHistory?: StatusHistory[];
  adminNotes?: AdminNote[];
  changeLog?: ChangeLog[];
  fraudScore?: number;
  isBanned?: boolean;
  courierSentAt?: number;
  courierTrackingId?: string;
  courierError?: string;
  retourReason?: string;
}
