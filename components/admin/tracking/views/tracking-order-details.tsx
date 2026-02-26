"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrackingButton } from "../ui/tracking-button";
import { StatusPill } from "../ui/status-pill";
import { OrderLineItemsEditor } from "../ui/order-line-items-editor";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useIsMounted } from "@/hooks/use-abortable-effect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
  ArrowRight,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Clock,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
  ShieldOff,
  Package,
  Truck,
  CheckCircle2,
  User,
  FileText,
} from "lucide-react";
import { Order } from "./tracking-kanban-board";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";
type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface TrackingOrderDetailsProps {
  order: Order;
  onClose: () => void;
  onRegisterRequestClose?: (fn: () => void) => void;
}

// Call outcome meta — wrong number uses orange to match the hold status it triggers
const OUTCOME_META: Record<CallOutcome, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  answered:       { label: "Answered",     icon: PhoneCall,      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  "no answer":    { label: "No Answer",    icon: PhoneMissed,    color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  "wrong number": { label: "Wrong Number", icon: PhoneForwarded, color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200" },
  refused:        { label: "Refused",      icon: PhoneOff,       color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
};

// DZ Phone formatter
function formatDZPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("213") && digits.length >= 12) {
    const local = digits.slice(3);
    return `+213 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    const local = digits.slice(1);
    return `+213 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return raw;
}

// Build the form snapshot from a live order object
function orderToForm(order: Order) {
  return {
    customerName:    order.customerName    ?? "",
    customerPhone:   order.customerPhone   ?? "",
    customerAddress: order.customerAddress ?? "",
    customerWilaya:  order.customerWilaya  ?? "",
    customerCommune: order.customerCommune ?? "",
    notes:           order.notes           ?? "",
  };
}

// Extract line items from order (with legacy migration)
function extractLineItems(order: Order) {
  if (order.lineItems && order.lineItems.length > 0) {
    return order.lineItems;
  }
  if (order.productId && order.productName) {
    const variants: Record<string, string> = {};
    if (order.selectedVariant?.size) variants.size = order.selectedVariant.size;
    if (order.selectedVariant?.color) variants.color = order.selectedVariant.color;
    return [{
      productId: order.productId,
      productName: order.productName,
      productSlug: order.productSlug,
      quantity: order.quantity ?? 1,
      unitPrice: order.productPrice ?? 0,
      variants: Object.keys(variants).length > 0 ? variants : undefined,
      lineTotal: (order.quantity ?? 1) * (order.productPrice ?? 0),
      thumbnail: undefined,
    }];
  }
  return [];
}

// Order Timeline
function OrderTimeline({ entries }: { entries: Array<{ status: string; timestamp: number; reason?: string }> }) {
  const statusIcon: Record<string, React.ElementType> = {
    new:       PhoneCall,
    confirmed: CheckCircle2,
    packaged:  Package,
    shipped:   Truck,
    canceled:  X,
    blocked:   ShieldOff,
    hold:      PhoneForwarded,
  };
  return (
    <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#ECECEC]">
      {[...entries].reverse().map((e, i) => {
        const Icon = statusIcon[e.status] ?? Clock;
        return (
          <div key={i} className="relative pl-8 animate-in fade-in duration-300">
            <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#F5F5F5] border-2 border-white flex items-center justify-center shadow-sm z-10">
              <Icon className="w-3 h-3 text-[#AAAAAA]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium capitalize text-[#3A3A3A]">{e.status}</span>
              {e.reason && <p className="text-[12px] text-[#AAAAAA] italic">{e.reason}</p>}
              <span className="text-[11px] text-[#AAAAAA] mt-0.5">{format(e.timestamp, "MMM d, HH:mm")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Call History Timeline
function CallLogHistory({ callLog }: { callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> }) {
  const [expanded, setExpanded] = useState(true);
  if (!callLog || callLog.length === 0) return null;
  return (
    <section className="mt-8 pt-6 border-t border-[#ECECEC]" aria-labelledby="call-log-heading">
      <button
        onClick={() => setExpanded(p => !p)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={expanded}
      >
        <h3 id="call-log-heading" className="text-[14px] font-semibold text-[#3A3A3A] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#AAAAAA]" />
          Call History
          <span className="ml-1 text-[12px] font-normal text-[#AAAAAA] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
            {callLog.length} attempt{callLog.length !== 1 ? "s" : ""}
          </span>
        </h3>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[#AAAAAA]" />
          : <ChevronDown className="w-4 h-4 text-[#AAAAAA]" />}
      </button>
      {expanded && (
        <div className="mt-4 space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#ECECEC]">
          {[...callLog].reverse().map((entry, i) => {
            const meta = OUTCOME_META[entry.outcome];
            const Icon = meta.icon;
            return (
              <div key={i} className="relative pl-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full ${meta.bg} border-2 border-white flex items-center justify-center z-10 shadow-sm`}>
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-medium ${meta.color}`}>{meta.label}</span>
                    <span className="text-[11px] text-[#AAAAAA]">{formatDistanceToNow(entry.timestamp, { addSuffix: true })}</span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-[13px] text-[#555555] bg-white border border-[#ECECEC] rounded-lg p-2 italic leading-relaxed">
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  )}
                  <span className="mt-1 text-[11px] text-[#AAAAAA] uppercase tracking-wider font-medium">
                    {format(entry.timestamp, "MMM d, HH:mm")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Call Attempt Progress Bar
function CallAttemptsBar({ attempts, max = 2 }: { attempts: number; max?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-[12px] font-medium text-[#AAAAAA] uppercase tracking-wider">No-answer attempts</span>
      <div className="flex gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-1.5 rounded-full transition-all duration-500 ${
              i < attempts ? (attempts >= max ? "bg-rose-500" : "bg-amber-400") : "bg-[#ECECEC]"
            }`}
          />
        ))}
      </div>
      <span className={`text-[12px] font-bold font-mono ${attempts >= max ? "text-rose-500" : "text-[#3A3A3A]"}`}>
        {attempts}/{max}
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function TrackingOrderDetails({ order, onClose, onRegisterRequestClose }: TrackingOrderDetailsProps) {
  const isMounted = useIsMounted();
  // isMounted() returns a new function reference on every render.
  // Storing it in a ref prevents it from becoming a useEffect dependency
  // and causing infinite re-render loops.
  const isMountedRef = useRef(isMounted);
  useEffect(() => { isMountedRef.current = isMounted; });

  const [isEditing, setIsEditing]           = useState(false);
  const [callNote, setCallNote]             = useState("");
  const [showNoteInput, setShowNoteInput]   = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<CallOutcome | null>(null);
  const [isLoggingCall, setIsLoggingCall]   = useState(false);
  const [showNoCallWarning, setShowNoCallWarning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);

  // Initialise form from order
  const [editForm, setEditForm] = useState(() => orderToForm(order));

  // Re-sync form when Convex pushes updated order data, but not while editing.
  useEffect(() => {
    if (!isEditing && isMountedRef.current()) {
      setEditForm(orderToForm(order));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    order.customerName,
    order.customerPhone,
    order.customerAddress,
    order.customerWilaya,
    order.customerCommune,
    order.notes,
    isEditing,
    // isMounted intentionally omitted — accessed via isMountedRef to avoid loop
  ]);

  const updateCustomerInfo = useMutation(api.orders.updateCustomerInfo);
  const logCallOutcome     = useMutation(api.orders.logCallOutcome);
  const updateStatus       = useMutation(api.orders.updateStatus);
  const resetCallAttempts  = useMutation(api.orders.resetCallAttempts);

  const effectiveStatus: MVPStatus =
    (order as any)._normalizedStatus ?? order.status ?? "new";
  const callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> =
    (order as any).callLog ?? [];
  const callAttempts = (order as any).callAttempts ?? 0;
  const statusHistory: Array<{ status: string; timestamp: number; reason?: string }> =
    (order as any).statusHistory ?? [];

  // CRITICAL: memoize the extracted line items so that OrderLineItemsEditor
  // receives a stable array reference between renders. Without useMemo,
  // extractLineItems() produces a new array object on every render — even if
  // the underlying data didn't change — which causes OrderLineItemsEditor's
  // useAbortableEffect to treat every render as "changed", triggering a
  // delivery-cost recalculation that calls setDeliveryCost, which re-renders
  // the parent, which calls extractLineItems again → infinite loop.
  const lineItems = useMemo(
    () => extractLineItems(order),
    // Depend on the actual data fields that matter, not the order object reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      order.lineItems,
      order.productId,
      order.productName,
      order.productSlug,
      order.quantity,
      order.productPrice,
      order.selectedVariant,
    ]
  );

  // Detect unsaved changes
  const hasUnsavedChanges = isEditing && (
    editForm.customerName    !== (order.customerName    ?? "") ||
    editForm.customerPhone   !== (order.customerPhone   ?? "") ||
    editForm.customerAddress !== (order.customerAddress ?? "") ||
    editForm.customerWilaya  !== (order.customerWilaya  ?? "") ||
    editForm.customerCommune !== (order.customerCommune ?? "") ||
    editForm.notes           !== (order.notes           ?? "")
  );

  // Intercepted close — guard against unsaved changes
  const handleRequestClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Register close handler with cleanup
  useEffect(() => {
    if (onRegisterRequestClose) {
      onRegisterRequestClose(handleRequestClose);
    }
    return () => {
      if (onRegisterRequestClose) {
        onRegisterRequestClose(() => {});
      }
    };
  }, [handleRequestClose, onRegisterRequestClose]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      await updateCustomerInfo({ id: order._id, ...editForm });
      if (isMountedRef.current()) {
        setIsEditing(false);
        toast.success("Order updated");
      }
    } catch {
      if (isMountedRef.current()) {
        toast.error("Failed to update order");
      }
    }
  };

  const handleDiscard = () => {
    setEditForm(orderToForm(order));
    setIsEditing(false);
  };

  const handleOutcomeClick = (outcome: CallOutcome) => {
    setPendingOutcome(outcome);
    setShowNoteInput(true);
    setCallNote("");
    setShowNoCallWarning(false);
  };

  const handleUndoCancel = async () => {
    try {
      await resetCallAttempts({ id: order._id });
      if (isMountedRef.current()) {
        toast.success("Order restored to New");
      }
    } catch {
      if (isMountedRef.current()) {
        toast.error("Failed to restore order");
      }
    }
  };

  const handleLogCall = async () => {
    if (!pendingOutcome) return;
    setIsLoggingCall(true);
    try {
      const result = await logCallOutcome({
        orderId: order._id,
        outcome: pendingOutcome,
        ...(callNote.trim() ? { note: callNote.trim() } : {}),
      });
      if (!isMountedRef.current()) return;
      const meta = OUTCOME_META[pendingOutcome];
      if (result.autoCanceled) {
        toast.error(`Order canceled — ${meta.label.toLowerCase()}`, {
          description: result.cancelReason,
          duration: 8000,
          action: pendingOutcome === "no answer"
            ? { label: "Undo", onClick: handleUndoCancel }
            : undefined,
        });
        onClose();
      } else if ((result as any).wrongNumber) {
        toast.warning("Wrong number — order placed on hold. Please correct the phone number.");
      } else {
        toast.success(`✓ ${meta.label} logged`);
      }
      setShowNoteInput(false);
      setPendingOutcome(null);
      setCallNote("");
    } catch {
      if (isMountedRef.current()) {
        toast.error("Failed to log call");
      }
    } finally {
      if (isMountedRef.current()) {
        setIsLoggingCall(false);
      }
    }
  };

  const handleCancelNote = () => {
    setShowNoteInput(false);
    setPendingOutcome(null);
    setCallNote("");
  };

  const handleStatusChange = async (newStatus: MVPStatus, reason?: string) => {
    try {
      await updateStatus({ id: order._id, status: newStatus, reason });
      if (isMountedRef.current()) {
        toast.success(`Order marked as ${newStatus}`);
        if (newStatus === "canceled") onClose();
      }
    } catch {
      if (isMountedRef.current()) {
        toast.error("Failed to update status");
      }
    }
  };

  const handleConfirmClick = () => {
    if (callLog.length === 0) {
      setShowNoCallWarning(true);
    } else {
      setShowNoCallWarning(false);
      handleStatusChange("confirmed");
    }
  };

  const handleConfirmAnyway = () => {
    setShowNoCallWarning(false);
    handleStatusChange("confirmed");
  };

  const handleDispatchClick = async () => {
    if (!order.customerAddress || order.customerAddress.trim() === "") {
      setIsEditing(true);
      toast.warning("Please add a delivery address before dispatching", {
        description: "Address field is highlighted below.",
      });
      setTimeout(() => addressInputRef.current?.focus(), 100);
      return;
    }
    await handleStatusChange("packaged", "Sent to courier");
    if (isMountedRef.current()) {
      toast.success("Order sent to Yalidin");
    }
  };

  const handleLineItemsSaveSuccess = (newTotal: number) => {
    if (isMountedRef.current()) {
      toast.success(`Order total updated: ${newTotal.toLocaleString()} DZD`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Unsaved Changes Dialog */}
      <AlertDialog
        open={showUnsavedDialog}
        onOpenChange={(open) => { if (!open) setShowUnsavedDialog(false); }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <TriangleAlert className="h-5 w-5 shrink-0" />
              <AlertDialogTitle className="text-amber-700">Unsaved changes</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This order has unsaved customer edits. If you leave now they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Stay &amp; save
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsEditing(false);
                setShowUnsavedDialog(false);
                onClose();
              }}
              className="bg-gray-900 hover:bg-gray-700 text-white"
            >
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#AAAAAA] uppercase tracking-[0.1em] mb-2">
              <Clock className="w-3.5 h-3.5" />
              {format(order._creationTime, "MMM d, yyyy 'at' HH:mm")}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editForm.customerName}
                onChange={e => setEditForm(p => ({ ...p, customerName: e.target.value }))}
                aria-label="Customer Name"
                className="text-[28px] font-bold text-[#3A3A3A] leading-tight mb-1 bg-white border border-[#ECECEC] rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] w-full"
                placeholder="Customer Name"
              />
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <User className="w-6 h-6 text-[#AAAAAA]" />
                <h2 className="text-[28px] font-bold text-[#3A3A3A] leading-tight">
                  {order.customerName}
                </h2>
              </div>
            )}
            <div className="inline-flex items-center gap-2 bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#ECECEC]">
              <span className="text-[13px] font-mono font-bold text-[#3A3A3A] tracking-tight">
                {order.orderNumber}
              </span>
              <StatusPill status={effectiveStatus} />
            </div>
          </header>

          {/* Customer Details */}
          <section className="mb-10" aria-labelledby="customer-heading">
            <div className="flex items-center justify-between mb-4">
              <h3
                id="customer-heading"
                className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider"
              >
                Customer Details
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-[#F5F5F5] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]"
                  aria-label="Edit customer details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                    aria-label="Save changes"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                    aria-label="Discard changes"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F7F7F7] rounded-lg">
                  <Phone className="w-4 h-4 text-[#AAAAAA]" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.customerPhone}
                      onChange={e => setEditForm(p => ({ ...p, customerPhone: e.target.value }))}
                      onBlur={e =>
                        setEditForm(p => ({ ...p, customerPhone: formatDZPhone(e.target.value) }))
                      }
                      aria-label="Phone"
                      className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                    />
                  ) : (
                    <span className="text-[15px] text-[#3A3A3A] font-medium tracking-wide">
                      {order.customerPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F7F7F7] rounded-lg">
                  <MapPin className="w-4 h-4 text-[#AAAAAA]" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        ref={addressInputRef}
                        type="text"
                        placeholder="Address"
                        value={editForm.customerAddress}
                        onChange={e => setEditForm(p => ({ ...p, customerAddress: e.target.value }))}
                        aria-label="Address"
                        className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Commune"
                          value={editForm.customerCommune}
                          onChange={e => setEditForm(p => ({ ...p, customerCommune: e.target.value }))}
                          aria-label="Commune"
                          className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                        />
                        <input
                          type="text"
                          placeholder="Wilaya"
                          value={editForm.customerWilaya}
                          onChange={e => setEditForm(p => ({ ...p, customerWilaya: e.target.value }))}
                          aria-label="Wilaya"
                          className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[15px] text-[#3A3A3A] leading-relaxed">
                      {order.customerAddress && `${order.customerAddress}, `}
                      {order.customerCommune && `${order.customerCommune}, `}
                      {order.customerWilaya}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Notes Section */}
          {(isEditing || order.notes) && (
            <section className="mb-10" aria-labelledby="notes-heading">
              <h3
                id="notes-heading"
                className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider mb-4"
              >
                Notes
              </h3>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F7F7F7] rounded-lg">
                  <FileText className="w-4 h-4 text-[#AAAAAA]" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <textarea
                      value={editForm.notes}
                      onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Add order notes..."
                      rows={3}
                      aria-label="Order Notes"
                      className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-2 text-[15px] text-[#3A3A3A] placeholder-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] leading-relaxed"
                    />
                  ) : (
                    <p className="text-[15px] text-[#3A3A3A] leading-relaxed whitespace-pre-wrap">
                      {order.notes}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Line Items Editor */}
          {lineItems.length > 0 && (
            <section className="mb-10" aria-labelledby="line-items-heading">
              <OrderLineItemsEditor
                orderId={order._id}
                initialLineItems={lineItems}
                initialDeliveryCost={order.deliveryCost ?? 0}
                wilaya={order.customerWilaya ?? ""}
                deliveryType={(order.deliveryType as "Stopdesk" | "Domicile") ?? "Stopdesk"}
                adminName="Admin"
                onSaveSuccess={handleLineItemsSaveSuccess}
              />
            </section>
          )}

          {/* Order Summary (Legacy fallback if no lineItems) */}
          {lineItems.length === 0 && (
            <section
              className="mb-10 bg-[#F7F7F7] rounded-2xl p-6 border border-[#ECECEC]"
              aria-labelledby="summary-heading"
            >
              <h3
                id="summary-heading"
                className="text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-4"
              >
                Order Summary
              </h3>
              <div className="space-y-2 text-[14px] text-[#3A3A3A]">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-[16px] font-bold text-[#3A3A3A] leading-tight mb-1">
                      {order.productName || "Product Name Missing"}
                    </h4>
                    {order.selectedVariant && (
                      <div className="text-[13px] text-[#AAAAAA]">
                        {order.selectedVariant.size && `Size: ${order.selectedVariant.size}`}
                        {order.selectedVariant.size && order.selectedVariant.color && " | "}
                        {order.selectedVariant.color && `Color: ${order.selectedVariant.color}`}
                      </div>
                    )}
                  </div>
                  <span className="text-[15px] font-semibold shrink-0">
                    {order.productPrice ?? 0} DZD
                  </span>
                </div>
                <div className="flex justify-between text-[#AAAAAA] border-t border-[#ECECEC] pt-2">
                  <span>Delivery ({order.deliveryType ?? "—"})</span>
                  <span>+{order.deliveryCost ?? 0} DZD</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-[#ECECEC]">
                  <span>Total (COD)</span>
                  <span className="text-[18px] font-black text-[#3A3A3A] tracking-tighter">
                    {order.totalAmount ?? 0} DZD
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Call Log History */}
          {(effectiveStatus === "new" || effectiveStatus === "hold" || callLog.length > 0) && (
            <CallLogHistory callLog={callLog} />
          )}

          {/* Order Timeline */}
          {statusHistory.length > 0 && (
            <section
              className="mt-8 pt-6 border-t border-[#ECECEC]"
              aria-labelledby="timeline-heading"
            >
              <h3
                id="timeline-heading"
                className="text-[14px] font-semibold text-[#3A3A3A] mb-4 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-[#AAAAAA]" />
                Order Timeline
              </h3>
              <OrderTimeline entries={statusHistory} />
            </section>
          )}

          {/* Courier tracking link */}
          {effectiveStatus === "shipped" && (order as any).courierTrackingId && (
            <a
              href={`https://yalidin.com/track/${(order as any).courierTrackingId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-blue-600 underline mt-4 inline-block"
            >
              Track with Yalidin →
            </a>
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-6 bg-white border-t border-[#ECECEC] shadow-[0_-8px_32px_rgba(0,0,0,0.04)] z-20">

          {effectiveStatus === "new" && !showNoteInput && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CallAttemptsBar attempts={callAttempts} />
              {showNoCallWarning && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[13px] mb-3 animate-in fade-in">
                  <TriangleAlert className="w-4 h-4 shrink-0" />
                  <span>No call logged yet. Confirm anyway?</span>
                  <button onClick={handleConfirmAnyway} className="ml-auto font-bold underline whitespace-nowrap">
                    Confirm
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <TrackingButton variant="secondary" onClick={() => handleOutcomeClick("answered")} className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  <PhoneCall className="w-4 h-4" /> Answered
                </TrackingButton>
                <TrackingButton variant="secondary" onClick={() => handleOutcomeClick("no answer")} className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50">
                  <PhoneMissed className="w-4 h-4" /> No Answer
                </TrackingButton>
                <TrackingButton variant="secondary" onClick={() => handleOutcomeClick("wrong number")} className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50">
                  <PhoneForwarded className="w-4 h-4" /> Wrong Number
                </TrackingButton>
                <TrackingButton variant="secondary" onClick={() => handleOutcomeClick("refused")} className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50">
                  <PhoneOff className="w-4 h-4" /> Refused
                </TrackingButton>
              </div>
              <TrackingButton variant="primary" onClick={handleConfirmClick} className="w-full gap-2 mt-2 h-12 text-[15px]">
                <Check className="w-5 h-5" /> Confirm Order
              </TrackingButton>
            </div>
          )}

          {effectiveStatus === "new" && showNoteInput && pendingOutcome && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="relative group">
                <div className="absolute left-3 top-3 pointer-events-none">
                  {React.createElement(OUTCOME_META[pendingOutcome].icon, {
                    className: `w-4 h-4 ${OUTCOME_META[pendingOutcome].color}`,
                    "aria-hidden": true,
                  })}
                </div>
                <div className="absolute left-9 top-2.5 px-2 py-0.5 rounded bg-white text-[11px] font-bold uppercase tracking-wider shadow-sm z-10 border border-[#ECECEC]">
                  {OUTCOME_META[pendingOutcome].label}
                </div>
                <textarea
                  value={callNote}
                  onChange={e => setCallNote(e.target.value)}
                  placeholder="Add a note (customer said, follow-up time...)"
                  rows={3}
                  aria-label="Call note"
                  className="w-full pl-3 pr-3 pt-9 pb-3 bg-[#F7F7F7] border border-[#ECECEC] rounded-xl text-[14px] text-[#3A3A3A] placeholder-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] transition leading-relaxed"
                />
              </div>
              <div className="flex gap-2">
                <TrackingButton variant="secondary" onClick={handleCancelNote} className="flex-1">Cancel</TrackingButton>
                <TrackingButton variant="primary" onClick={handleLogCall} disabled={isLoggingCall} className="flex-[2] gap-2 h-11">
                  {isLoggingCall
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Check className="w-4 h-4" aria-hidden="true" />}
                  Log Call Outcome
                </TrackingButton>
              </div>
            </div>
          )}

          {effectiveStatus === "hold" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-700 text-[13px]">
                <PhoneForwarded className="w-4 h-4 shrink-0" />
                Wrong number — please correct the phone number below, then resume.
              </div>
              <TrackingButton variant="secondary" onClick={() => setIsEditing(true)} className="w-full gap-2 h-11 border-orange-200 text-orange-600 hover:bg-orange-50">
                <Edit2 className="w-4 h-4" /> Edit Phone Number
              </TrackingButton>
              <TrackingButton variant="primary" onClick={() => handleStatusChange("new", "Resumed from wrong number hold")} className="w-full gap-2 h-11">
                <ArrowRight className="w-4 h-4" /> Resume as New
              </TrackingButton>
            </div>
          )}

          {effectiveStatus === "confirmed" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {showCancelConfirm ? (
                <div className="space-y-3 p-4 bg-rose-50 rounded-xl border border-rose-200 animate-in zoom-in-95">
                  <p className="text-[13px] text-rose-700 font-medium">Cancel this order?</p>
                  <div className="flex gap-2">
                    <TrackingButton variant="secondary" onClick={() => setShowCancelConfirm(false)} className="flex-1">Keep it</TrackingButton>
                    <TrackingButton onClick={() => { setShowCancelConfirm(false); handleStatusChange("canceled"); }} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white">Yes, cancel</TrackingButton>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <TrackingButton variant="secondary" onClick={() => setShowCancelConfirm(true)} className="flex-1 text-rose-600 hover:bg-rose-50 h-12">Cancel</TrackingButton>
                  <TrackingButton variant="primary" onClick={handleDispatchClick} className="flex-[2] gap-2 h-12">
                    Send to Yalidin <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </TrackingButton>
                </div>
              )}
            </div>
          )}

          {effectiveStatus === "packaged" && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <TrackingButton variant="secondary" onClick={() => window.open(`/api/labels/${order._id}`, "_blank")} className="flex-[2] h-12">Print Label</TrackingButton>
              <TrackingButton variant="primary" onClick={() => handleStatusChange("shipped")} className="flex-1 gap-2 h-12">
                Ship <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </TrackingButton>
            </div>
          )}

          {effectiveStatus === "shipped" && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-[14px] border border-emerald-100 font-medium animate-in fade-in zoom-in-95 duration-300">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" aria-hidden="true" />
              </div>
              <span>Order shipped and in transit. Check the timeline above for full history.</span>
            </div>
          )}

          {(effectiveStatus === "blocked" || effectiveStatus === "canceled") && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl text-rose-600 text-[14px] border border-rose-100 font-medium animate-in fade-in zoom-in-95 duration-300">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase text-[11px] tracking-wider opacity-70">
                    {effectiveStatus === "blocked" ? "Fraud Protection" : "Order Canceled"}
                  </span>
                  <span>
                    {effectiveStatus === "blocked"
                      ? "This customer is blocked from placing orders."
                      : (order as any).cancelReason || "This order was canceled."}
                  </span>
                </div>
              </div>
              <TrackingButton variant="secondary" onClick={() => handleStatusChange("new", "Unblocked by admin")} className="w-full gap-2 h-11 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <ShieldOff className="w-4 h-4" /> Restore to New
              </TrackingButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
