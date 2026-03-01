"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { X, Check, Truck, Printer, Ban, Loader2, CircleSlash } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: Set<Id<"orders">>;
  onClearSelection: () => void;
  onBulkConfirm: () => void;
  onBulkDispatch: () => void;
  onBulkPrint: () => void;
  onBulkCancel: () => void;
  onBulkUnblock: () => void;
  isProcessing: boolean;
  isBlacklist?: boolean;
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  onBulkConfirm,
  onBulkDispatch,
  onBulkPrint,
  onBulkCancel,
  onBulkUnblock,
  isProcessing,
  isBlacklist = false,
}: BulkActionBarProps) {
  const count = selectedIds.size;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-foreground text-background shadow-2xl border-t border-border z-50 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-8 py-4 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="p-2 hover:bg-background/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-medium">
              {count} order{count !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isBlacklist ? (
            <Button
              onClick={onBulkUnblock}
              disabled={isProcessing}
              variant="secondary"
              size="sm"
              className="gap-2 bg-background text-foreground hover:bg-background/90"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CircleSlash className="w-4 h-4" />
              )}
              Unblock {count > 1 ? "all" : ""}
            </Button>
          ) : (
            <>
              <Button
                onClick={onBulkConfirm}
                disabled={isProcessing}
                variant="secondary"
                size="sm"
                className="gap-2 bg-background text-foreground hover:bg-background/90"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirm
              </Button>

              <Button
                onClick={onBulkDispatch}
                disabled={isProcessing}
                variant="secondary"
                size="sm"
                className="gap-2 bg-background text-foreground hover:bg-background/90"
              >
                <Truck className="w-4 h-4" />
                Dispatch
              </Button>

              <Button
                onClick={onBulkPrint}
                disabled={isProcessing}
                variant="secondary"
                size="sm"
                className="gap-2 bg-background text-foreground hover:bg-background/90"
              >
                <Printer className="w-4 h-4" />
                Print labels
              </Button>

              <div className="w-[1px] h-8 bg-background/20 mx-2" />

              <Button
                onClick={onBulkCancel}
                disabled={isProcessing}
                variant="secondary"
                size="sm"
                className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Ban className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
