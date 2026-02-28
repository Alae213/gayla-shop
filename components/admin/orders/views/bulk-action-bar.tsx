"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { X, Trash2, ArrowRight } from "lucide-react";
import { Button } from "../components/button";

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface BulkActionBarProps {
  selectedOrderIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActionBar({ selectedOrderIds, onClearSelection }: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const bulkUpdateStatus = useMutation(api.orders.bulkUpdateStatus);

  const count = selectedOrderIds.size;

  if (count === 0) return null;

  const handleBulkStatus = async (status: MVPStatus) => {
    setIsProcessing(true);
    try {
      const ids = Array.from(selectedOrderIds) as Id<"orders">[];
      const result = await bulkUpdateStatus({ ids, status });
      toast.success(`${result.updated} orders updated to ${status}`);
      onClearSelection();
    } catch (error: any) {
      toast.error(error.message ?? "Bulk update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-foreground text-background rounded-2xl px-5 py-3 shadow-2xl">
        <span className="text-sm font-bold">{count} selected</span>
        <div className="w-px h-5 bg-background/20" />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleBulkStatus("confirmed")}
          disabled={isProcessing}
          className="gap-1.5 text-xs bg-background/10 border-background/20 text-background hover:bg-background/20 h-8"
        >
          <ArrowRight className="w-3.5 h-3.5" /> Confirm
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleBulkStatus("canceled")}
          disabled={isProcessing}
          className="gap-1.5 text-xs bg-background/10 border-background/20 text-background hover:bg-background/20 h-8"
        >
          <Trash2 className="w-3.5 h-3.5" /> Cancel
        </Button>
        <button
          onClick={onClearSelection}
          className="ml-1 p-1 rounded-full hover:bg-background/20 transition-colors"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}