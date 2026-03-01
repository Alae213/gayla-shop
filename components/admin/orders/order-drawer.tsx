"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Phone, MapPin, Package, Truck, DollarSign, Edit2, Save, X,
  User, Home, Clock, ChevronDown, ChevronUp, AlertTriangle,
  Info, PhoneCall, PhoneOff, Shield, FileText, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { OrderLineItemEditor } from "@/components/admin/order-line-item-editor";
import { OrderDeliveryEditor } from "@/components/admin/order-delivery-editor";
import { OrderHistoryTimeline } from "@/components/admin/order-history-timeline";

// ─── Types ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

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

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface LineItem {
  productId: Id<"products">;
  productName: string;
  productSlug?: string;
  quantity: number;
  unitPrice: number;
  variants?: Record<string, string>;
  lineTotal: number;
  thumbnail?: string;
}

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
  callLog?: Array<{ timestamp: number; outcome: "answered" | "no_answer"; note?: string }>;
  statusHistory?: Array<{ status: string; timestamp: number; reason?: string }>;
  adminNotes?: Array<{ text: string; timestamp: number }>;
  changeLog?: Array<{ timestamp: number; adminName?: string; action: string; changes?: string }>;
  fraudScore?: number;
  isBanned?: boolean;
  courierSentAt?: number;
  courierTrackingId?: string;
  courierError?: string;
  retourReason?: string;
}

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

// ─── Status Normalizer ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function normalizeLegacyStatus(status: OrderStatus): MVPStatus {
  switch (status) {
    case "Pending":           return "new";
    case "Confirmed":         return "confirmed";
    case "Called no respond": return "new";
    case "Called 01":         return "new";
    case "Called 02":         return "new";
    case "Packaged":          return "packaged";
    case "Shipped":           return "shipped";
    case "Delivered":         return "shipped";
    case "Cancelled":         return "canceled";
    case "Retour":            return "canceled";
    default:                  return "new";
  }
}

// ─── Status display config ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, { color: string; bg: string; icon: string }> = {
  Pending:             { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200",  icon: "⌛" },
  Confirmed:           { color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",      icon: "✓"  },
  "Called no respond": { color: "text-orange-700", bg: "bg-orange-50 border-orange-200",  icon: "📞" },
  "Called 01":         { color: "text-orange-700", bg: "bg-orange-50 border-orange-200",  icon: "📞" },
  "Called 02":         { color: "text-red-700",    bg: "bg-red-50 border-red-200",        icon: "📞" },
  Cancelled:           { color: "text-red-700",    bg: "bg-red-50 border-red-200",        icon: "✕"  },
  Packaged:            { color: "text-purple-700", bg: "bg-purple-50 border-purple-200",  icon: "📦" },
  Shipped:             { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200",  icon: "🚚" },
  Delivered:           { color: "text-green-700",  bg: "bg-green-50 border-green-200",    icon: "✓✓" },
  Retour:              { color: "text-slate-700",  bg: "bg-slate-50 border-slate-200",    icon: "↩"  },
};

// ─── Action definitions ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const CANCEL_REASONS = [
  "No answer after 2 attempts",
  "Customer refused",
  "Duplicate order",
  "Wrong address",
  "Suspicious order",
  "Customer request",
];

const RETOUR_REASONS = [
  "Customer not at home",
  "Customer refused delivery",
  "Wrong address",
  "Package damaged",
  "Customer unreachable",
  "Wrong item ordered",
];

type ActionBtn = {
  toStatus: OrderStatus;
  label: string;
  icon: string;
  cls: string;
  requiresReason: boolean;
  reasons?: string[];
  useRetour?: boolean;
};

const SAFE_STATUSES: OrderStatus[] = ["Confirmed", "Packaged", "Shipped", "Delivered"];

const STATUS_ACTIONS: Partial<Record<OrderStatus, ActionBtn[]>> = {
  Pending: [
    { toStatus: "Confirmed", label: "Confirm Order", icon: "✅", cls: "bg-blue-600 hover:bg-blue-700 text-white",                         requiresReason: false },
    { toStatus: "Cancelled", label: "Cancel Order",  icon: "❌", cls: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300",   requiresReason: true, reasons: CANCEL_REASONS },
  ],
  "Called no respond": [
    { toStatus: "Confirmed", label: "Confirm Order", icon: "✅", cls: "bg-blue-600 hover:bg-blue-700 text-white",                         requiresReason: false },
    { toStatus: "Cancelled", label: "Cancel Order",  icon: "❌", cls: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300",   requiresReason: true, reasons: CANCEL_REASONS },
  ],
  "Called 01": [
    { toStatus: "Confirmed", label: "Confirm Order", icon: "✅", cls: "bg-blue-600 hover:bg-blue-700 text-white",                         requiresReason: false },
    { toStatus: "Cancelled", label: "Cancel Order",  icon: "❌", cls: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300",   requiresReason: true, reasons: CANCEL_REASONS },
  ],
  "Called 02": [
    { toStatus: "Confirmed", label: "Confirm Order", icon: "✅", cls: "bg-blue-600 hover:bg-blue-700 text-white",                         requiresReason: false },
    { toStatus: "Cancelled", label: "Cancel Order",  icon: "❌", cls: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300",   requiresReason: true, reasons: CANCEL_REASONS },
  ],
  Confirmed: [
    { toStatus: "Packaged",  label: "Mark as Packaged", icon: "📦", cls: "bg-purple-600 hover:bg-purple-700 text-white",                 requiresReason: false },
    { toStatus: "Cancelled", label: "Cancel Order",     icon: "❌", cls: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300", requiresReason: true, reasons: CANCEL_REASONS },
  ],
  Packaged: [
    { toStatus: "Shipped",   label: "Mark as Shipped",  icon: "🚚", cls: "bg-indigo-600 hover:bg-indigo-700 text-white",                 requiresReason: false },
  ],
  Shipped: [
    { toStatus: "Delivered", label: "Mark as Delivered", icon: "✅", cls: "bg-green-600 hover:bg-green-700 text-white",                  requiresReason: false },
    { toStatus: "Retour",    label: "Mark as Retour",    icon: "↩",  cls: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300", requiresReason: true, reasons: RETOUR_REASONS, useRetour: true },
  ],
  Delivered: [],
  Cancelled: [],
  Retour:    [],
};

const CALL_LOG_STATUSES: OrderStatus[] = [
  "Pending", "Called no respond", "Called 01", "Called 02",
];

// The pre-filled cancel reason used when 2× no-answer forces cancellation.
const TWO_NO_ANSWER_REASON = "No answer after 2 attempts";

// ─── Component ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export function OrderDrawer({ isOpen, onClose, order, onSuccess }: OrderDrawerProps) {

  const [isEditing,     setIsEditing]     = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [formData,      setFormData]      = useState({
    customerName: "", customerPhone: "", customerWilaya: "",
    customerCommune: "", customerAddress: "", deliveryCost: 0,
  });
  const [pendingAction, setPendingAction] = useState<ActionBtn | null>(null);
  const [actionReason,  setActionReason]  = useState("");
  const [isActioning,   setIsActioning]   = useState(false);
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [newNote,       setNewNote]       = useState("");
  const [isSavingNote,  setIsSavingNote]  = useState(false);
  const [isTimelineOpen,setIsTimelineOpen]= useState(false);
  const [isBanning,     setIsBanning]     = useState(false);
  const [editedLineItems, setEditedLineItems] = useState<LineItem[]>([]);
  const [isDeliveryEditorOpen, setIsDeliveryEditorOpen] = useState(false);

  const reasonSelectRef = useRef<HTMLButtonElement>(null);

  const updateOrder       = useMutation(api.orders.update);
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const updateLineItems   = useMutation(api.orders.updateLineItems);
  const updateDeliveryDestination = useMutation(api.orders.updateDeliveryDestination);
  const logCallOutcome    = useMutation(api.orders.logCallOutcome);
  const addNote           = useMutation(api.orders.addNote);
  const banCustomer       = useMutation(api.orders.banCustomer);
  const markRetour        = useMutation(api.orders.markRetour);

  useEffect(() => {
    if (order) {
      setFormData({
        customerName:    order.customerName,
        customerPhone:   order.customerPhone,
        customerWilaya:  order.customerWilaya,
        customerCommune: order.customerCommune,
        customerAddress: order.customerAddress,
        deliveryCost:    order.deliveryCost,
      });
    }
  }, [order]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setPendingAction(null);
      setActionReason("");
      setNewNote("");
      setIsTimelineOpen(false);
      setIsDeliveryEditorOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (pendingAction?.requiresReason) {
      const t = setTimeout(() => reasonSelectRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [pendingAction]);

  if (!order) return null;

  const cfg          = STATUS_CFG[order.status] ?? STATUS_CFG["Pending"];
  const callAttempts = order.callAttempts ?? 0;
  const fraudScore   = order.fraudScore   ?? 0;
  const isBanned     = order.isBanned     ?? false;
  const showCallLog  = CALL_LOG_STATUSES.includes(order.status);

  // Detect if order has lineItems (new format) or legacy single product
  const hasLineItems = order.lineItems && order.lineItems.length > 0;

  const hasAnswered   = order.callLog?.some((e) => e.outcome === "answered") ?? false;
  const callLogLocked = hasAnswered || callAttempts >= 2;
  const twoNoAnswers  = callAttempts >= 2 && !hasAnswered;

  const rawActionBtns = STATUS_ACTIONS[order.status] ?? [];
  const actionBtns    = twoNoAnswers
    ? rawActionBtns.filter((b) => b.toStatus !== "Confirmed")
    : rawActionBtns;

  const primaryAction = !pendingAction && actionBtns.length > 0 ? actionBtns[0] : null;

  // ─ Handlers ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrder({
        id: order._id,
        customerName:    formData.customerName,
        customerPhone:   formData.customerPhone,
        customerWilaya:  formData.customerWilaya,
        customerCommune: formData.customerCommune,
        customerAddress: formData.customerAddress,
        deliveryCost:    formData.deliveryCost,
      });
      toast.success("Order updated!");
      setIsEditing(false);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLineItemsUpdate = (items: LineItem[]) => {
    setEditedLineItems(items);
  };

  const handleLineItemsSave = async () => {
    try {
      await updateLineItems({
        id: order._id,
        lineItems: editedLineItems,
      });
      onSuccess();
    } catch (e: any) {
      throw e; // Re-throw to be handled by OrderLineItemEditor
    }
  };

  const handleDeliverySave = async (updates: {
    wilaya: string;
    commune: string;
    deliveryType: "Domicile" | "Stopdesk";
    deliveryCost: number;
  }) => {
    await updateDeliveryDestination({
      id: order._id,
      wilaya: updates.wilaya,
      commune: updates.commune,
      deliveryType: updates.deliveryType,
      newDeliveryCost: updates.deliveryCost,
    });
    onSuccess(); // Refresh order data
  };

  const handleCallLog = async (outcome: "answered" | "no_answer") => {
    if (callLogLocked) return;
    if (outcome === "answered" && hasAnswered) return;
    setIsLoggingCall(true);
    try {
      await logCallOutcome({ orderId: order._id, outcome: outcome === "answered" ? "answered" : "no answer" });
      toast.success(
        outcome === "answered"
          ? "📞 Logged — customer answered. Confirm or cancel below."
          : `📞 No answer logged (${callAttempts + 1}/2).`,
      );
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to log call");
    } finally {
      setIsLoggingCall(false);
    }
  };

  const handleActionClick = async (btn: ActionBtn) => {
    const isSafe = !btn.requiresReason && SAFE_STATUSES.includes(btn.toStatus);
    if (isSafe) {
      const previousStatus = order.status;
      setIsActioning(true);
      try {
        await updateOrderStatus({ id: order._id, status: normalizeLegacyStatus(btn.toStatus) });
        onSuccess();
        toast.success(`${btn.icon} ${btn.label}`, {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await updateOrderStatus({ id: order._id, status: normalizeLegacyStatus(previousStatus) });
                onSuccess();
                toast.info(`↩ Reverted to ${previousStatus}`);
              } catch (e: any) {
                toast.error(e.message || "Failed to undo");
              }
            },
          },
          duration: 5000,
        });
      } catch (e: any) {
        toast.error(e.message || "Failed to update status");
      } finally {
        setIsActioning(false);
      }
    } else {
      setPendingAction(btn);
      setActionReason(
        twoNoAnswers && btn.toStatus === "Cancelled"
          ? TWO_NO_ANSWER_REASON
          : ""
      );
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    if (pendingAction.requiresReason && !actionReason) return;
    setIsActioning(true);
    try {
      if (pendingAction.useRetour) {
        await markRetour({ orderId: order._id, reason: actionReason });
      } else {
        await updateOrderStatus({
          id: order._id,
          status: normalizeLegacyStatus(pendingAction.toStatus),
          ...(actionReason ? { reason: actionReason } : {}),
        });
      }
      toast.success(`Order marked as ${pendingAction.toStatus}`);
      setPendingAction(null);
      setActionReason("");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setIsActioning(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setIsSavingNote(true);
    try {
      await addNote({ orderId: order._id, text: newNote.trim() });
      setNewNote("");
      toast.success("Note saved");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleToggleBan = async () => {
    setIsBanning(true);
    try {
      await banCustomer({ phone: order.customerPhone, isBanned: !isBanned });
      toast.success(!isBanned ? "🚫 Customer banned" : "✅ Customer unbanned");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to update ban");
    } finally {
      setIsBanning(false);
    }
  };

  const fmt  = (ts: number) =>
    new Date(ts).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const curr = (n: number) => `${n.toLocaleString()} DA`;

  // ─ Render ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose} modal={false}>
        <SheetContent
          side="right"
          hideClose
          className="w-[520px] max-w-[95vw] sm:max-w-[520px] p-0 flex flex-col border-l border-gray-200 shadow-2xl"
        >
          {/* ══ HEADER ══════════════════════════════════════════════════════════════════════════════ */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between shrink-0">
            <SheetHeader className="gap-1">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Package className="h-5 w-5 text-indigo-600" />
                Order #{order.orderNumber}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                <span>{fmt(order._creationTime)}</span>
                <span className="text-gray-300">•</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                  {cfg.icon} {order.status}
                </span>
                {isBanned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 border-red-300 text-red-700">
                    🚫 Banned
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>
            <Button variant="ghost" size="icon" onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-gray-700 -mt-1 ml-4">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* ══ BODY ══════════════════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {isBanned && (
              <div className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">Banned customer</p>
                  <p className="text-xs text-red-600 mt-0.5">Future orders from this number will be auto-cancelled.</p>
                </div>
              </div>
            )}

            {/* § 1 ACTIONS */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</h3>

              {twoNoAnswers && (
                <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">2 unanswered call attempts</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      The customer did not answer twice. "Confirm Order" has been removed.
                      Please cancel this order below.
                    </p>
                  </div>
                </div>
              )}

              {actionBtns.length > 0 ? (
                <>
                  {!pendingAction && (
                    <div className="flex flex-wrap gap-2">
                      {actionBtns.map((btn) => (
                        <Button
                          key={btn.toStatus}
                          size="sm"
                          disabled={isActioning}
                          className={`gap-1.5 ${btn.cls}`}
                          onClick={() => handleActionClick(btn)}
                        >
                          <span>{btn.icon}</span> {btn.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {pendingAction && (
                    <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-amber-900">
                        {pendingAction.icon} {pendingAction.label}
                      </p>
                      {pendingAction.requiresReason && (
                        <Select value={actionReason} onValueChange={setActionReason}>
                          <SelectTrigger ref={reasonSelectRef} className="bg-white text-sm">
                            <SelectValue placeholder="Select a reason…" />
                          </SelectTrigger>
                          <SelectContent>
                            {pendingAction.reasons?.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <p className="text-sm text-amber-800">Confirm this action?</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleConfirmAction}
                          disabled={isActioning || (pendingAction.requiresReason && !actionReason)}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {isActioning ? "Updating…" : "Yes, continue"}
                        </Button>
                        <Button size="sm" variant="outline"
                          onClick={() => { setPendingAction(null); setActionReason(""); }}>
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-400 text-center">
                  {cfg.icon} Terminal state — no further actions.
                </div>
              )}
            </div>

            <Separator />

            {/* § 2 ORDER ITEMS (NEW) or ORDERED PRODUCT (LEGACY) */}
            {hasLineItems ? (
              // NEW FORMAT: Multiple line items with editing capability
              <OrderLineItemEditor
                orderId={order._id}
                lineItems={order.lineItems!}
                deliveryCost={order.deliveryCost}
                onUpdate={handleLineItemsUpdate}
                onSave={handleLineItemsSave}
              />
            ) : (
              // LEGACY FORMAT: Single product read-only display
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" /> Ordered Product
                  </h3>
                  <Badge variant="secondary" className="text-xs">Legacy Order</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <p className="text-xs text-gray-500 mb-1">Product</p>
                      <p className="font-semibold text-gray-900">{order.productName}</p>
                      {order.selectedVariant && (order.selectedVariant.size || order.selectedVariant.color) ? (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {order.selectedVariant.size && <Badge variant="outline" className="text-xs">Size: {order.selectedVariant.size}</Badge>}
                          {order.selectedVariant.color && <Badge variant="outline" className="text-xs">Color: {order.selectedVariant.color}</Badge>}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">No variants</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                      <p className="font-bold text-gray-900 text-lg">{curr(order.productPrice!)}</p>
                    </div>
                  </div>
                  <Separator className="bg-indigo-200" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Truck className="h-3 w-3" /> Type</p>
                      <Badge variant="outline">{order.deliveryType}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Delivery</p>
                      {isEditing ? (
                        <Input type="number" value={formData.deliveryCost}
                          onChange={(e) => setFormData((p) => ({ ...p, deliveryCost: parseInt(e.target.value) || 0 }))}
                          className="h-8 w-28" />
                      ) : (
                        <p className="font-medium text-gray-900 text-sm">{curr(order.deliveryCost)}</p>
                      )}
                    </div>
                  </div>
                  <Separator className="bg-indigo-200" />
                  <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Products</span><span>{curr(order.productPrice!)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>+ {curr(isEditing ? formData.deliveryCost : order.deliveryCost)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total COD</span>
                      <span className="font-bold text-xl text-gray-900">
                        {curr(order.productPrice! + (isEditing ? formData.deliveryCost : order.deliveryCost))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* § 3 DELIVERY */}
            <OrderDeliveryEditor
              currentWilaya={order.customerWilaya}
              currentCommune={order.customerCommune}
              currentDeliveryType={order.deliveryType}
              currentDeliveryCost={order.deliveryCost}
              onSave={handleDeliverySave}
            />

            <Separator />

            {/* § 4 CUSTOMER */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" /> Customer
                </h3>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          customerName: order.customerName, customerPhone: order.customerPhone,
                          customerWilaya: order.customerWilaya, customerCommune: order.customerCommune,
                          customerAddress: order.customerAddress, deliveryCost: order.deliveryCost,
                        });
                      }}>
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                      {isSaving
                        ? <><div className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" /> Saving…</>
                        : <><Save className="h-3.5 w-3.5" /> Save</>}
                    </Button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-4 bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cn" className="text-xs flex items-center gap-1"><User className="h-3 w-3" /> Name</Label>
                      <Input id="cn" value={formData.customerName}
                        onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="cp" className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                      <Input id="cp" value={formData.customerPhone}
                        onChange={(e) => setFormData((p) => ({ ...p, customerPhone: e.target.value }))} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ca" className="text-xs flex items-center gap-1"><Home className="h-3 w-3" /> Address</Label>
                    <Input id="ca" value={formData.customerAddress}
                      onChange={(e) => setFormData((p) => ({ ...p, customerAddress: e.target.value }))} className="mt-1.5" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <Row icon={<User />}   label="Name"     value={order.customerName} />
                  <Row icon={<Phone />}  label="Phone"    value={
                    <a href={`tel:${order.customerPhone}`} className="font-medium text-indigo-600 hover:underline">{order.customerPhone}</a>
                  } />
                  <Row icon={<Home />}   label="Address"  value={order.customerAddress} />
                </div>
              )}
            </div>

            <Separator />

            {/* § 5 CUSTOMER RISK */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" /> Customer Risk
              </h3>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Fraud score:</span>
                  <span className={`font-bold text-sm ${
                    fraudScore >= 3 ? "text-red-600" : fraudScore >= 1 ? "text-orange-500" : "text-green-600"
                  }`}>{fraudScore}</span>
                  <span className={`text-xs ${
                    fraudScore >= 3 ? "text-red-500" : fraudScore >= 1 ? "text-orange-400" : "text-green-500"
                  }`}>
                    {fraudScore >= 3 ? "— High Risk" : fraudScore >= 1 ? "— Caution" : "— Safe"}
                  </span>
                  <span className="relative group cursor-help">
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-gray-900 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-50">
                      Increments when orders from this phone are cancelled or returned repeatedly.
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{isBanned ? "Banned" : "Active"}</span>
                    <button onClick={handleToggleBan} disabled={isBanning}
                      aria-label={isBanned ? "Unban this customer" : "Ban this customer"}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400
                        disabled:opacity-60 ${isBanned ? "bg-red-500" : "bg-gray-300"}`}>
                      <span className={`mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm
                        transform transition-transform duration-200 ${isBanned ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <p className={`text-xs max-w-[160px] text-right leading-snug ${
                    isBanned ? "text-red-600" : "text-gray-400"
                  }`}>
                    {isBanned
                      ? "Future orders from this number are auto-cancelled."
                      : "Banning blocks all future orders from this number."}
                  </p>
                </div>
              </div>
              {order.courierError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">Courier error: {order.courierError}</p>
                </div>
              )}
            </div>

            {/* § 6 CALL LOG */}
            {showCallLog && (
              <>
                <Separator />
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-orange-600" /> Call Log
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      callAttempts >= 2 ? "bg-red-100 text-red-700"
                      : callAttempts === 1 ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                    }`}>{callAttempts} / 2</span>
                  </div>

                  {hasAnswered ? (
                    <div className="flex items-start gap-3 bg-green-50 border-2 border-green-200 rounded-lg p-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">✅ Customer answered</p>
                        <p className="text-xs text-green-700 mt-0.5">Use the actions above to confirm or cancel this order.</p>
                      </div>
                    </div>
                  ) : callAttempts >= 2 ? (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium">
                        2 no-answer attempts reached — confirm or cancel the order above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm"
                        disabled={isLoggingCall || callLogLocked || hasAnswered}
                        onClick={() => handleCallLog("answered")}
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                        <PhoneCall className="h-3.5 w-3.5" /> Log: Answered
                      </Button>
                      <Button size="sm"
                        disabled={isLoggingCall || callLogLocked}
                        onClick={() => handleCallLog("no_answer")}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5">
                        <PhoneOff className="h-3.5 w-3.5" /> Log: No Answer
                      </Button>
                    </div>
                  )}

                  {order.callLog && order.callLog.length > 0 && (
                    <div className="space-y-1 border-t border-orange-200 pt-3">
                      {[...order.callLog].reverse().map((entry, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className={entry.outcome === "answered" ? "text-green-700 font-medium" : "text-red-600"}>
                            {entry.outcome === "answered" ? "✅ Answered" : "❌ No Answer"}
                            {entry.note ? ` — ${entry.note}` : ""}
                          </span>
                          <span className="text-gray-400">{fmt(entry.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* § 7 INTERNAL NOTES */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" /> Internal Notes
                <span className="text-xs text-gray-400 font-normal">— not visible to customer</span>
              </h3>
              <div className="space-y-2">
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a private note about this order or customer…"
                  className="resize-none text-sm" rows={3} />
                <Button size="sm" onClick={handleSaveNote} disabled={isSavingNote || !newNote.trim()} className="gap-1.5">
                  {isSavingNote
                    ? <><div className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" /> Saving…</>
                    : "Save Note"}
                </Button>
              </div>
              {order.adminNotes && order.adminNotes.length > 0 && (
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  {[...order.adminNotes].reverse().map((n, i) => (
                    <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{fmt(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* § 8 HISTORY TIMELINE */}
            <div>
              <button onClick={() => setIsTimelineOpen((p) => !p)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors py-1">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Order History
                  {((order.statusHistory?.length ?? 0) + (order.changeLog?.length ?? 0)) > 0 && (
                    <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full font-normal">
                      {(order.statusHistory?.length ?? 0) + (order.changeLog?.length ?? 0)}
                    </span>
                  )}
                </span>
                {isTimelineOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {isTimelineOpen && (
                <div className="mt-4">
                  <OrderHistoryTimeline
                    statusHistory={order.statusHistory}
                    changeLog={order.changeLog}
                  />
                </div>
              )}
            </div>

            <div className="h-2" />
          </div>

          {/* ══ FOOTER ══════════════════════════════════════════════════════════════════════════════ */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between gap-3">
            {primaryAction ? (
              <Button size="sm" disabled={isActioning}
                className={`gap-1.5 ${primaryAction.cls}`}
                onClick={() => handleActionClick(primaryAction)}>
                <span>{primaryAction.icon}</span> {primaryAction.label}
              </Button>
            ) : (
              <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-gray-400 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium text-gray-900 text-sm mt-0.5">{value}</div>
      </div>
    </div>
  );
}
