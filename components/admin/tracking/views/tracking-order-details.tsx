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
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
  Box,
  ArrowRight,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { Order } from "./tracking-kanban-board";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";
type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked";

interface TrackingOrderDetailsProps {
  order: Order;
  onClose: () => void;
}

// --- Call outcome meta
const OUTCOME_META: Record<CallOutcome, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  answered:     { label: "Answered",     icon: PhoneCall,      color: "text-emerald-600", bg: "bg-emerald-50" },
  "no answer":  { label: "No Answer",    icon: PhoneMissed,    color: "text-amber-600",   bg: "bg-amber-50" },
  "wrong number":{ label: "Wrong Number", icon: PhoneForwarded, color: "text-rose-500",    bg: "bg-rose-50" },
  refused:      { label: "Refused",      icon: PhoneOff,       color: "text-rose-600",    bg: "bg-rose-50" },
};

// --- Sub-component: Call History Timeline
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
        {expanded ? <ChevronUp className="w-4 h-4 text-[#AAAAAA]" /> : <ChevronDown className="w-4 h-4 text-[#AAAAAA]" />}
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
                    <span className={`text-[13px] font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-[#AAAAAA]">
                      {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-[13px] text-[#555555] bg-white border border-[#ECECEC] rounded-lg p-2 italic leading-relaxed">
                      "{entry.note}"
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

// --- Sub-component: Call Attempt Progress Bar
function CallAttemptsBar({ attempts, max = 2 }: { attempts: number; max?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-[12px] font-medium text-[#AAAAAA] uppercase tracking-wider">Call attempts</span>
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
      <span className={`text-[12px] font-bold font-mono ${
        attempts >= max ? "text-rose-500" : "text-[#3A3A3A]"
      }`}>
        {attempts}/{max}
      </span>
    </div>
  );
}

// --- Main Component
export function TrackingOrderDetails({ order, onClose }: TrackingOrderDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [callNote, setCallNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<CallOutcome | null>(null);
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [editForm, setEditForm] = useState({
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress || "",
    customerWilaya: order.customerWilaya,
    customerCommune: order.customerCommune || "",
    notes: order.notes || "",
  });

  const updateCustomerInfo = useMutation(api.orders.updateCustomerInfo);
  const logCallOutcome = useMutation(api.orders.logCallOutcome);
  const updateStatus = useMutation(api.orders.updateStatus);

  // Use _normalizedStatus when available (injected by TrackingWorkspace)
  const effectiveStatus: MVPStatus = (order as any)._normalizedStatus ?? order.status ?? "new";
  const callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> = (order as any).callLog ?? [];
  const callAttempts = (order as any).callAttempts ?? 0;

  // --- Handlers
  const handleSave = async () => {
    try {
      await updateCustomerInfo({ id: order._id, ...editForm });
      setIsEditing(false);
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  // Step 1 — operator clicks an outcome button -> show optional note input
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* --- Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#AAAAAA] uppercase tracking-[0.1em] mb-2">
            <Clock className="w-3.5 h-3.5" />
            {format(order._creationTime, "MMM d, yyyy 'at' HH:mm")}
          </div>
          <h2 className="text-[28px] font-bold text-[#3A3A3A] leading-tight mb-1">
            {order.customerName}
          </h2>
          <div className="inline-flex items-center gap-2 bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#ECECEC]">
            <span className="text-[13px] font-mono font-bold text-[#3A3A3A] tracking-tight">
              {order.orderNumber}
            </span>
            <StatusPill status={effectiveStatus} />
          </div>
        </header>

        {/* --- Customer Details */}
        <section className="mb-10" aria-labelledby="customer-heading">
          <div className="flex items-center justify-between mb-4">
            <h3 id="customer-heading" className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider">Customer Details</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-[#F5F5F5] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]"
                aria-label="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button 
                  onClick={handleSave}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  aria-label="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  aria-label="Discard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#F7F7F7] rounded-lg">
                <Phone className="w-4 h-4 text-[#AAAAAA]" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.customerPhone} 
                    onChange={e => setEditForm(p => ({...p, customerPhone: e.target.value}))}
                    aria-label="Phone"
                    className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                  />
                ) : (
                  <span className="text-[15px] text-[#3A3A3A] font-medium tracking-wide">{order.customerPhone}</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#F7F7F7] rounded-lg">
                <MapPin className="w-4 h-4 text-[#AAAAAA]" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Address"
                      value={editForm.customerAddress} 
                      onChange={e => setEditForm(p => ({...p, customerAddress: e.target.value}))}
                      aria-label="Address"
                      className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Commune"
                        value={editForm.customerCommune} 
                        onChange={e => setEditForm(p => ({...p, customerCommune: e.target.value}))}
                        aria-label="Commune"
                        className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                      />
                      <input 
                        type="text" 
                        placeholder="Wilaya"
                        value={editForm.customerWilaya} 
                        onChange={e => setEditForm(p => ({...p, customerWilaya: e.target.value}))}
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

        {/* --- Order Summary */}
        <section className="mb-10 bg-[#F7F7F7] rounded-2xl p-6 border border-[#ECECEC]" aria-labelledby="summary-heading">
          <h3 id="summary-heading" className="text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-4">Order Summary</h3>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="text-[16px] font-bold text-[#3A3A3A] leading-tight mb-1">{order.productName || "Product Name Missing"}</h4>
              {order.selectedVariant && (
                <div className="text-[13px] text-[#AAAAAA]">
                  {order.selectedVariant.size && `Size: ${order.selectedVariant.size}`}
                  {order.selectedVariant.size && order.selectedVariant.color && " | "}
                  {order.selectedVariant.color && `Color: ${order.selectedVariant.color}`}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[18px] font-black text-[#3A3A3A] tracking-tighter">{order.totalAmount} DZD</div>
              <div className="text-[11px] font-bold text-[#AAAAAA] uppercase">incl. delivery</div>
            </div>
          </div>
        </section>

        {/* --- Call Log History (rendered for all active orders) */}
        {(effectiveStatus === "new" || callLog.length > 0) && (
          <CallLogHistory callLog={callLog} />
        )}
      </div>

      {/* --- Fixed Bottom Action Bar */}
      <div className="p-6 bg-white border-t border-[#ECECEC] shadow-[0_-8px_32px_rgba(0,0,0,0.04)] z-20">
        
        {/* --- NEW: Call Logging panel */}
        {effectiveStatus === "new" && !showNoteInput && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CallAttemptsBar attempts={callAttempts} />
            
            <div className="grid grid-cols-2 gap-2">
              <TrackingButton 
                variant="secondary" 
                onClick={() => handleOutcomeClick("answered")}
                className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <PhoneCall className="w-4 h-4" />
                Answered
              </TrackingButton>
              <TrackingButton 
                variant="secondary" 
                onClick={() => handleOutcomeClick("no answer")}
                className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <PhoneMissed className="w-4 h-4" />
                No Answer
              </TrackingButton>
              <TrackingButton 
                variant="secondary" 
                onClick={() => handleOutcomeClick("wrong number")}
                className="gap-1.5 text-rose-500 border-rose-200 hover:bg-rose-50"
              >
                <PhoneForwarded className="w-4 h-4" />
                Wrong Number
              </TrackingButton>
              <TrackingButton 
                variant="secondary" 
                onClick={() => handleOutcomeClick("refused")}
                className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <PhoneOff className="w-4 h-4" />
                Refused
              </TrackingButton>
            </div>

            <TrackingButton 
              variant="primary" 
              onClick={() => handleStatusChange("confirmed")}
              className="w-full gap-2 mt-2 h-12 text-[15px]"
            >
              <Check className="w-5 h-5" />
              Confirm Order
            </TrackingButton>
          </div>
        )}

        {/* --- Note input overlay (shows after clicking an outcome) */}
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
                placeholder="Add a note (customer said, follow up time...)"
                rows={3}
                aria-label="Call note"
                className="w-full pl-3 pr-3 pt-9 pb-3 bg-[#F7F7F7] border border-[#ECECEC] rounded-xl text-[14px] text-[#3A3A3A] placeholder-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] transition leading-relaxed"
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
                className="flex-[2] gap-2 h-11"
              >
                {isLoggingCall ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" aria-hidden="true" />
                )}
                Log Call Outcome
              </TrackingButton>
            </div>
          </div>
        )}

        {/* --- CONFIRMED: Dispatch */}
        {effectiveStatus === "confirmed" && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TrackingButton 
              variant="secondary" 
              onClick={() => handleStatusChange("canceled")}
              className="flex-1 text-rose-600 hover:bg-rose-50 h-12"
            >
              Cancel
            </TrackingButton>
            <TrackingButton 
              variant="primary" 
              onClick={() => handleStatusChange("packaged")}
              className="flex-[2] gap-2 h-12"
            >
              Send to Yalidin
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

        {/* --- PACKAGED: Print & Ship */}
        {effectiveStatus === "packaged" && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TrackingButton 
              variant="secondary" 
              onClick={() => {}}
              className="flex-[2] h-12"
            >
              Print Label
            </TrackingButton>
            <TrackingButton 
              variant="primary" 
              onClick={() => handleStatusChange("shipped")}
              className="flex-1 gap-2 h-12"
            >
              Ship
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

        {/* --- SHIPPED: terminal info */}
        {effectiveStatus === "shipped" && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-[14px] border border-emerald-100 font-medium animate-in fade-in zoom-in-95 duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" aria-hidden="true" />
            </div>
            <span>Order is shipped and in transit. No further action needed.</span>
          </div>
        )}

        {/* --- BLOCKED / CANCELED: info */}
        {(effectiveStatus === "blocked" || effectiveStatus === "canceled") && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl text-rose-600 text-[14px] border border-rose-100 font-medium animate-in fade-in zoom-in-95 duration-300">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <X className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold uppercase text-[11px] tracking-wider opacity-70">
                {effectiveStatus === "blocked" ? "Fraud Protection" : "Order Canceled"}
              </span>
              <span>
                {effectiveStatus === "blocked" ? "This customer is blocked from placing orders." : (order as any).cancelReason || "This order was canceled."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
