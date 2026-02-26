"use client";

import * as React from "react";
import {
  Check,
  X,
  ArrowRight,
  Edit2,
  ShieldOff,
  PhoneForwarded,
  TriangleAlert,
} from "lucide-react";
import { TrackingButton } from "../../ui/tracking-button";
import { CallLoggingSection } from "./call-logging-section";

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";
type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

interface CallAttemptsBarProps {
  attempts: number;
  max?: number;
}

function CallAttemptsBar({ attempts, max = 2 }: CallAttemptsBarProps) {
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

interface StatusActionBarProps {
  effectiveStatus: MVPStatus;
  callAttempts: number;
  showNoCallWarning: boolean;
  showCancelConfirm: boolean;
  
  // Call logging
  showNoteInput: boolean;
  pendingOutcome: CallOutcome | null;
  callNote: string;
  isLoggingCall: boolean;
  
  // Handlers
  onConfirmClick: () => void;
  onConfirmAnyway: () => void;
  onStatusChange: (status: MVPStatus, reason?: string) => void;
  onDispatchClick: () => void;
  onStartEdit: () => void;
  onPrintLabel: () => void;
  onSetShowCancelConfirm: (show: boolean) => void;
  
  // Call logging handlers
  onOutcomeClick: (outcome: CallOutcome) => void;
  onCallNoteChange: (note: string) => void;
  onCancelNote: () => void;
  onLogCall: () => void;
  
  // Order details
  orderId: string;
  cancelReason?: string;
}

/**
 * Status Action Bar
 * 
 * Fixed bottom bar with status-specific actions:
 * - NEW: Call outcome buttons + Confirm
 * - HOLD: Edit phone + Resume
 * - CONFIRMED: Cancel + Send to Yalidin
 * - PACKAGED: Print label + Ship
 * - SHIPPED: Success message
 * - CANCELED/BLOCKED: Restore option
 */
export function StatusActionBar({
  effectiveStatus,
  callAttempts,
  showNoCallWarning,
  showCancelConfirm,
  showNoteInput,
  pendingOutcome,
  callNote,
  isLoggingCall,
  onConfirmClick,
  onConfirmAnyway,
  onStatusChange,
  onDispatchClick,
  onStartEdit,
  onPrintLabel,
  onSetShowCancelConfirm,
  onOutcomeClick,
  onCallNoteChange,
  onCancelNote,
  onLogCall,
  orderId,
  cancelReason,
}: StatusActionBarProps) {
  return (
    <div className="p-6 bg-white border-t border-[#ECECEC] shadow-[0_-8px_32px_rgba(0,0,0,0.04)] z-20">
      {effectiveStatus === "new" && !showNoteInput && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CallAttemptsBar attempts={callAttempts} />
          {showNoCallWarning && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[13px] mb-3 animate-in fade-in">
              <TriangleAlert className="w-4 h-4 shrink-0" />
              <span>No call logged yet. Confirm anyway?</span>
              <button onClick={onConfirmAnyway} className="ml-auto font-bold underline whitespace-nowrap">
                Confirm
              </button>
            </div>
          )}
          <CallLoggingSection
            showNoteInput={false}
            pendingOutcome={null}
            callNote=""
            isLoggingCall={false}
            onOutcomeClick={onOutcomeClick}
            onCallNoteChange={onCallNoteChange}
            onCancelNote={onCancelNote}
            onLogCall={onLogCall}
          />
          <TrackingButton variant="primary" onClick={onConfirmClick} className="w-full gap-2 mt-2 h-12 text-[15px]">
            <Check className="w-5 h-5" /> Confirm Order
          </TrackingButton>
        </div>
      )}

      {effectiveStatus === "new" && showNoteInput && (
        <CallLoggingSection
          showNoteInput={showNoteInput}
          pendingOutcome={pendingOutcome}
          callNote={callNote}
          isLoggingCall={isLoggingCall}
          onOutcomeClick={onOutcomeClick}
          onCallNoteChange={onCallNoteChange}
          onCancelNote={onCancelNote}
          onLogCall={onLogCall}
        />
      )}

      {effectiveStatus === "hold" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-700 text-[13px]">
            <PhoneForwarded className="w-4 h-4 shrink-0" />
            Wrong number — please correct the phone number below, then resume.
          </div>
          <TrackingButton variant="secondary" onClick={onStartEdit} className="w-full gap-2 h-11 border-orange-200 text-orange-600 hover:bg-orange-50">
            <Edit2 className="w-4 h-4" /> Edit Phone Number
          </TrackingButton>
          <TrackingButton variant="primary" onClick={() => onStatusChange("new", "Resumed from wrong number hold")} className="w-full gap-2 h-11">
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
                <TrackingButton variant="secondary" onClick={() => onSetShowCancelConfirm(false)} className="flex-1">Keep it</TrackingButton>
                <TrackingButton onClick={() => { onSetShowCancelConfirm(false); onStatusChange("canceled"); }} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white">Yes, cancel</TrackingButton>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <TrackingButton variant="secondary" onClick={() => onSetShowCancelConfirm(true)} className="flex-1 text-rose-600 hover:bg-rose-50 h-12">Cancel</TrackingButton>
              <TrackingButton variant="primary" onClick={onDispatchClick} className="flex-[2] gap-2 h-12">
                Send to Yalidin <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </TrackingButton>
            </div>
          )}
        </div>
      )}

      {effectiveStatus === "packaged" && (
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TrackingButton variant="secondary" onClick={onPrintLabel} className="flex-[2] h-12">Print Label</TrackingButton>
          <TrackingButton variant="primary" onClick={() => onStatusChange("shipped")} className="flex-1 gap-2 h-12">
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
                  : cancelReason || "This order was canceled."}
              </span>
            </div>
          </div>
          <TrackingButton variant="secondary" onClick={() => onStatusChange("new", "Unblocked by admin")} className="w-full gap-2 h-11 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <ShieldOff className="w-4 h-4" /> Restore to New
          </TrackingButton>
        </div>
      )}
    </div>
  );
}
