"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingButton } from "../ui/tracking-button";
import { X, CheckCircle2, Package, Printer, Trash2, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackingBulkActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedIds: Set<Id<"orders">>;
  onClearSelection: () => void;
  onBulkConfirm: () => void;
  onBulkDispatch: () => void;
  onBulkPrint: () => void;
  onBulkCancel: () => void;
  onBulkUnblock?: () => void;
  isProcessing?: boolean;
  isBlacklist?: boolean;
}

// Reusable inline spinner for action buttons
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-[#ECECEC] border-t-transparent rounded-full animate-spin" />
  );
}

export function TrackingBulkActionBar({
  selectedIds,
  onClearSelection,
  onBulkConfirm,
  onBulkDispatch,
  onBulkPrint,
  onBulkCancel,
  onBulkUnblock,
  isProcessing = false,
  isBlacklist = false,
  className,
  ...props
}: TrackingBulkActionBarProps) {
  const count = selectedIds.size;

  if (count === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-6 bg-[#1A1A1A] text-white px-6 py-4 rounded-tracking-card shadow-tracking-elevated animate-in slide-in-from-bottom-8 duration-300 ease-out",
        className
      )}
      role="toolbar"
      aria-label="Bulk actions"
      {...props}
    >
      {/* Selection Count & Clear */}
      <div className="flex items-center gap-4 border-r border-[#3A3A3A] pr-6">
        <span className="text-[15px] font-medium whitespace-nowrap">
          {count} {count === 1 ? "order" : "orders"} selected
        </span>
        <button
          onClick={onClearSelection}
          disabled={isProcessing}
          className="p-1 text-[#AAAAAA] hover:text-white hover:bg-[#3A3A3A] rounded-md transition-colors disabled:opacity-50"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isBlacklist ? (
          /* Blacklist mode: only Unblock */
          // FIX 18B: Guard against undefined onBulkUnblock before calling it
          <TrackingButton
            variant="secondary"
            size="sm"
            onClick={() => onBulkUnblock?.()}
            disabled={isProcessing || !onBulkUnblock}
            className="bg-transparent text-emerald-400 border-[#3A3A3A] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 gap-2"
          >
            {isProcessing ? <Spinner /> : <ShieldOff className="w-4 h-4" />}
            Unblock Selected
          </TrackingButton>
        ) : (
          /* Normal mode: Confirm, Dispatch, Print, Cancel */
          // FIX 18B: Each button shows its own spinner during isProcessing
          <>
            <TrackingButton
              variant="secondary"
              size="sm"
              onClick={onBulkConfirm}
              disabled={isProcessing}
              className="bg-transparent text-white border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white gap-2"
            >
              {isProcessing ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm All
            </TrackingButton>

            <TrackingButton
              variant="secondary"
              size="sm"
              onClick={onBulkDispatch}
              disabled={isProcessing}
              className="bg-transparent text-white border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white gap-2"
            >
              {isProcessing ? <Spinner /> : <Package className="w-4 h-4" />}
              Send to Yalidin
            </TrackingButton>

            <TrackingButton
              variant="secondary"
              size="sm"
              onClick={onBulkPrint}
              disabled={isProcessing}
              className="bg-transparent text-white border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white gap-2"
            >
              {isProcessing ? <Spinner /> : <Printer className="w-4 h-4" />}
              Print Labels
            </TrackingButton>

            <div className="w-[1px] h-6 bg-[#3A3A3A] mx-1" />

            <TrackingButton
              variant="secondary"
              size="sm"
              onClick={onBulkCancel}
              disabled={isProcessing}
              className="bg-transparent text-rose-400 border-[#3A3A3A] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 gap-2"
            >
              {isProcessing ? <Spinner /> : <Trash2 className="w-4 h-4" />}
              Cancel Selected
            </TrackingButton>
          </>
        )}
      </div>
    </div>
  );
}
