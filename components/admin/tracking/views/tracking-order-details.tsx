"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrackingButton } from "../ui/tracking-button";
import { StatusPill } from "../ui/status-pill";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Phone, MapPin, Edit2, Check, X, Box, ArrowRight,
  PhoneCall, PhoneOff, PhoneMissed, PhoneForwarded,
  Clock, ChevronDown, ChevronUp, MessageSquare,
} from "lucide-react";
import { Order } from "./tracking-kanban-board";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";
type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked";

interface TrackingOrderDetailsProps {
  order: Order;
  onClose: () => void;
}

// ─── Call outcome meta ────────────────────────────────────────────────────────
const OUTCOME_META: Record<CallOutcome, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  answered:      { label: "Answered",     icon: PhoneCall,      color: "text-emerald-600", bg: "bg-emerald-50" },
  "no answer":   { label: "No Answer",    icon: PhoneMissed,    color: "text-amber-600",   bg: "bg-amber-50"  },
  "wrong number":{ label: "Wrong Number", icon: PhoneForwarded,  color: "text-rose-500",    bg: "bg-rose-50"   },
  refused:       { label: "Refused",       icon: PhoneOff,       color: "text-rose-600",    bg: "bg-rose-50"   },
};

// ─── Sub-component: Call History Timeline ────────────────────────────────────
function CallLogHistory({ callLog }: { callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> }) {
  const [expanded, setExpanded] = useState(true);
  if (!callLog || callLog.length === 0) return null;

  return (
    <section aria-labelledby="call-log-heading">
      <button
        onClick={() => setExpanded(p => !p)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={expanded}
      >
        <h3 id="call-log-heading" className="text-[14px] font-semibold text-[#AAAAAA] uppercase tracking-wider">
          Call History
        </h3>
        <span className="flex items-center gap-1.5 text-[12px] text-[#AAAAAA] group-hover:text-[#3A3A3A] transition-colors">
          {callLog.length} attempt{callLog.length !== 1 ? "s" : ""}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {expanded && (
        <ol className="mt-3 flex flex-col gap-2" role="list">
          {[...callLog].reverse().map((entry, i) => {
            const meta = OUTCOME_META[entry.outcome];
            const Icon = meta.icon;
            return (
              <li
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border border-[#ECECEC] ${meta.bg}`}
              >
                <span className={`mt-0.5 p-1.5 rounded-full bg-white shadow-sm ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] font-semibold ${meta.color}`}>{meta.label}</span>
                    <span className="text-[11px] text-[#AAAAAA] whitespace-nowrap shrink-0">
                      {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-[12px] text-[#3A3A3A] mt-1 leading-relaxed">{entry.note}</p>
                  )}
                  <time
                    dateTime={new Date(entry.timestamp).toISOString()}
                    className="text-[11px] text-[#AAAAAA] flex items-center gap-1 mt-1"
                  >
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {format(entry.timestamp, "MMM d, HH:mm")}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// ─── Sub-component: Call Attempt Progress Bar ─────────────────────────────────
function CallAttemptsBar({ attempts, max = 2 }: { attempts: number; max?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-[#AAAAAA] font-medium">Call attempts</span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i < attempts ? "bg-amber-400" : "bg-[#ECECEC]"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className={`text-[12px] font-semibold ${
        attempts >= max ? "text-rose-500" : "text-[#3A3A3A]"
      }`}>
        {attempts}/{max}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TrackingOrderDetails({ order, onClose }: TrackingOrderDetailsProps) {
  const [isEditing, setIsEditing]       = useState(false);
  const [callNote, setCallNote]         = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<CallOutcome | null>(null);
  const [isLoggingCall, setIsLoggingCall] = useState(false);

  const [editForm, setEditForm] = useState({
    customerPhone:   order.customerPhone,
    customerAddress: order.customerAddress || "",
    customerWilaya:  order.customerWilaya,
    customerCommune: order.customerCommune || "",
    notes:           order.notes || "",
  });

  const updateCustomerInfo = useMutation(api.orders.updateCustomerInfo);
  const logCallOutcome     = useMutation(api.orders.logCallOutcome);
  const updateStatus       = useMutation(api.orders.updateStatus);

  // Use _normalizedStatus when available (injected by TrackingWorkspace)
  const effectiveStatus: MVPStatus = order._normalizedStatus ?? order.status ?? "new";
  const callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> = order.callLog ?? [];
  const callAttempts = order.callAttempts ?? 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await updateCustomerInfo({ id: order._id, ...editForm });
      setIsEditing(false);
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  // Step 1 — operator clicks an outcome button → show optional note input
  const handleOutcomeClick = (outcome: CallOutcome) => {
    setPendingOutcome(outcome);
    setShowNoteInput(true);
    setCallNote("");
  };

  // Step 2 — submit the call log (with or without a note)
  const handleLogCall = async () => {
    if (!pendingOutcome) return;
    setIsLoggingCall(true);
    try {
      const result = await logCallOutcome({
        orderId: order._id,
        outcome: pendingOutcome,
        ...(callNote.trim() ? { note: callNote.trim() } : {}),
      });

      const meta = OUTCOME_META[pendingOutcome];
      toast.success(`✓ ${meta.label} logged`);

      if (result.autoCanceled) {
        toast.error("Order auto-canceled", {
          description: result.cancelReason,
          duration: 6000,
        });
        onClose();
      }

      setShowNoteInput(false);
      setPendingOutcome(null);
      setCallNote("");
    } catch {
      toast.error("Failed to log call");
    } finally {
      setIsLoggingCall(false);
    }
  };

  const handleCancelNote = () => {
    setShowNoteInput(false);
    setPendingOutcome(null);
    setCallNote("");
  };

  const handleStatusChange = async (newStatus: MVPStatus) => {
    try {
      await updateStatus({ id: order._id, status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      if (newStatus === "canceled") onClose();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full pb-28" role="region" aria-label={`Order details for ${order.orderNumber}`}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <StatusPill status={effectiveStatus} />
          <span className="text-[13px] text-[#AAAAAA]">
            {format(order._creationTime, "MMM d, yyyy 'at' HH:mm")}
          </span>
        </div>
        <div>
          <h1 className="text-[24px] font-semibold text-[#3A3A3A] mb-1">{order.customerName}</h1>
          <span className="font-mono bg-[#F5F5F5] px-2 py-0.5 rounded-md text-[15px] text-[#AAAAAA]">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {/* ── Customer Details ────────────────────────────────────────────────── */}
      <section
        className="flex flex-col gap-4 bg-[#F7F7F7] p-6 rounded-tracking-card border border-[#ECECEC]"
        aria-labelledby="cust-details-heading"
      >
        <div className="flex items-center justify-between">
          <h3 id="cust-details-heading" className="text-[14px] font-semibold text-[#AAAAAA] uppercase tracking-wider">Customer Details</h3>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]" aria-label="Edit">
              <Edit2 className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-rose-500 hover:bg-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]" aria-label="Discard">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
              <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]" aria-label="Save">
                <Check className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-[#AAAAAA] mt-0.5 shrink-0" aria-hidden="true" />
            {isEditing ? (
              <input type="text" value={editForm.customerPhone} onChange={e => setEditForm(p => ({...p, customerPhone: e.target.value}))} aria-label="Phone" className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]" />
            ) : (
              <span className="text-[15px] font-medium text-[#3A3A3A]">{order.customerPhone}</span>
            )}
          </div>
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-[#AAAAAA] mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex flex-col gap-2 w-full">
              {isEditing ? (
                <>
                  <input type="text" placeholder="Address" value={editForm.customerAddress} onChange={e => setEditForm(p => ({...p, customerAddress: e.target.value}))} aria-label="Address" className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Commune" value={editForm.customerCommune} onChange={e => setEditForm(p => ({...p, customerCommune: e.target.value}))} aria-label="Commune" className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]" />
                    <input type="text" placeholder="Wilaya" value={editForm.customerWilaya} onChange={e => setEditForm(p => ({...p, customerWilaya: e.target.value}))} aria-label="Wilaya" className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]" />
                  </div>
                </>
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

      {/* ── Order Summary ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3" aria-labelledby="order-summary-heading">
        <h3 id="order-summary-heading" className="text-[14px] font-semibold text-[#AAAAAA] uppercase tracking-wider">Order Summary</h3>
        <div className="flex items-center gap-4 bg-white border border-[#ECECEC] rounded-tracking-card p-4">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center shrink-0" aria-hidden="true">
            <Box className="w-6 h-6 text-[#AAAAAA]" />
          </div>
          <div className="flex-1">
            <h4 className="text-[15px] font-medium text-[#3A3A3A]">{order.productName || "Product Name Missing"}</h4>
            {order.selectedVariant && (
              <p className="text-[13px] text-[#AAAAAA] mt-1">
                {order.selectedVariant.size  && `Size: ${order.selectedVariant.size}`}
                {order.selectedVariant.size && order.selectedVariant.color && " | "}
                {order.selectedVariant.color && `Color: ${order.selectedVariant.color}`}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-[16px] font-semibold text-[#3A3A3A]">{order.totalAmount} DZD</div>
            <div className="text-[12px] text-[#AAAAAA]">incl. delivery</div>
          </div>
        </div>
      </section>

      {/* ── Call Log History (rendered for all active orders) ───────────────── */}
      {(effectiveStatus === "new" || callLog.length > 0) && (
        <CallLogHistory callLog={callLog} />
      )}

      {/* ── Fixed Bottom Action Bar ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 right-0 w-[480px] bg-white border-t border-[#ECECEC] p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.04)] z-50 flex flex-col gap-4"
        role="group"
        aria-label="Order actions"
      >

        {/* ── NEW: Call Logging panel ─────────────────────────────────────── */}
        {effectiveStatus === "new" && !showNoteInput && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CallAttemptsBar attempts={callAttempts} />
              {callAttempts === 0 && (
                <span className="text-[11px] text-[#AAAAAA] italic">No calls yet</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TrackingButton
                variant="secondary"
                onClick={() => handleOutcomeClick("answered")}
                className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" /> Answered
              </TrackingButton>
              <TrackingButton
                variant="secondary"
                onClick={() => handleOutcomeClick("no answer")}
                className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <PhoneMissed className="w-3.5 h-3.5" aria-hidden="true" /> No Answer
              </TrackingButton>
              <TrackingButton
                variant="secondary"
                onClick={() => handleOutcomeClick("wrong number")}
                className="gap-1.5 text-rose-500 border-rose-200 hover:bg-rose-50"
              >
                <PhoneForwarded className="w-3.5 h-3.5" aria-hidden="true" /> Wrong Number
              </TrackingButton>
              <TrackingButton
                variant="secondary"
                onClick={() => handleOutcomeClick("refused")}
                className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <PhoneOff className="w-3.5 h-3.5" aria-hidden="true" /> Refused
              </TrackingButton>
            </div>
            <TrackingButton
              variant="primary"
              onClick={() => handleStatusChange("confirmed")}
              className="w-full gap-2"
            >
              Confirm Order <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

        {/* ── Note input overlay (shows after clicking an outcome) ─────────── */}
        {effectiveStatus === "new" && showNoteInput && pendingOutcome && (
          <div className="flex flex-col gap-3">
            {/* Outcome badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${OUTCOME_META[pendingOutcome].bg}`}>
              {React.createElement(OUTCOME_META[pendingOutcome].icon, {
                className: `w-4 h-4 ${OUTCOME_META[pendingOutcome].color}`,
                "aria-hidden": true,
              })}
              <span className={`text-[13px] font-semibold ${OUTCOME_META[pendingOutcome].color}`}>
                {OUTCOME_META[pendingOutcome].label}
              </span>
            </div>
            {/* Optional note */}
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#AAAAAA]" aria-hidden="true" />
              <textarea
                value={callNote}
                onChange={e => setCallNote(e.target.value)}
                placeholder="Add a note (optional)..."
                rows={2}
                aria-label="Call note"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F7F7F7] border border-[#ECECEC] rounded-xl text-[14px] text-[#3A3A3A] placeholder-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] transition"
              />
            </div>
            <div className="flex gap-2">
              <TrackingButton variant="secondary" onClick={handleCancelNote} className="flex-1">
                Cancel
              </TrackingButton>
              <TrackingButton
                variant="primary"
                onClick={handleLogCall}
                disabled={isLoggingCall}
                className="flex-[2] gap-2"
              >
                {isLoggingCall ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" aria-hidden="true" />
                )}
                Log Call
              </TrackingButton>
            </div>
          </div>
        )}

        {/* ── CONFIRMED: Dispatch ─────────────────────────────────────────── */}
        {effectiveStatus === "confirmed" && (
          <div className="flex gap-3">
            <TrackingButton variant="secondary" onClick={() => handleStatusChange("canceled")} className="flex-1 text-rose-600">
              Cancel
            </TrackingButton>
            <TrackingButton variant="primary" onClick={() => handleStatusChange("packaged")} className="flex-[2] gap-2">
              Send to Yalidin <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

        {/* ── PACKAGED: Print & Ship ──────────────────────────────────────── */}
        {effectiveStatus === "packaged" && (
          <div className="flex gap-3">
            <TrackingButton variant="secondary" onClick={() => {}} className="flex-[2]">
              Print Label
            </TrackingButton>
            <TrackingButton variant="primary" onClick={() => handleStatusChange("shipped")} className="flex-1 gap-2">
              Ship <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

        {/* ── SHIPPED: terminal info ──────────────────────────────────────── */}
        {effectiveStatus === "shipped" && (
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl text-purple-700 text-[13px]">
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Order is on its way. No further action needed.</span>
          </div>
        )}

        {/* ── BLOCKED / CANCELED: info ───────────────────────────────────── */}
        {(effectiveStatus === "blocked" || effectiveStatus === "canceled") && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl text-rose-600 text-[13px]">
            <X className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {effectiveStatus === "blocked"
                ? "This customer is blocked. No action available."
                : `Canceled${order.cancelReason ? `: ${order.cancelReason}` : "."}`}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}