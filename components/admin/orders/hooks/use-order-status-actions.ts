"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

const MAX_RETRY_ATTEMPTS = 3;

interface UseOrderStatusActionsProps {
  orderId: Id<"orders">;
  currentStatus: MVPStatus;
  hasCallLog: boolean;
  customerAddress?: string;
  isMountedRef: React.MutableRefObject<() => boolean>;
  onClose: () => void;
  onFocusAddress?: () => void;
}

/**
 * Custom hook for managing order status transitions.
 * 
 * Handles:
 * - Status changes with optimistic updates
 * - Rollback on failure with retry
 * - Validation (e.g., address required for dispatch)
 * - Confirm flow with no-call warning
 * - Cancel confirmation dialog
 */
export function useOrderStatusActions({
  orderId,
  currentStatus: initialStatus,
  hasCallLog,
  customerAddress,
  isMountedRef,
  onClose,
  onFocusAddress,
}: UseOrderStatusActionsProps) {
  const [showNoCallWarning, setShowNoCallWarning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Optimistic state
  const [optimisticStatus, setOptimisticStatus] = useState<MVPStatus | null>(null);
  
  // Retry tracking
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const updateStatusMutation = useMutation(api.orders.updateStatus);

  const effectiveStatus = optimisticStatus ?? initialStatus;

  const handleStatusChange = useCallback(async (newStatus: MVPStatus, reason?: string) => {
    const operationKey = `updateStatus-${newStatus}`;
    const currentRetry = retryCount[operationKey] || 0;
    
    // Optimistic update
    const previousStatus = effectiveStatus;
    setOptimisticStatus(newStatus);
    console.log("[Status] Optimistic update:", previousStatus, "\u2192", newStatus);
    
    try {
      await updateStatusMutation({ id: orderId, status: newStatus, reason });
      
      if (!isMountedRef.current()) return;
      
      // Clear optimistic state
      setOptimisticStatus(null);
      setRetryCount(prev => ({ ...prev, [operationKey]: 0 }));
      
      toast.success(`Order marked as ${newStatus}`);
      console.log("[Status] Updated successfully:", newStatus);
      
      if (newStatus === "canceled") onClose();
    } catch (error) {
      if (!isMountedRef.current()) return;
      
      // Rollback optimistic update
      console.error("[Status] Update failed:", error);
      setOptimisticStatus(previousStatus);
      
      if (currentRetry >= MAX_RETRY_ATTEMPTS) {
        toast.error("Failed to update status", {
          description: "Please contact support if this issue persists.",
          duration: 10000,
        });
      } else {
        toast.error("Failed to update status", {
          description: `Couldn't change status to ${newStatus}.`,
          action: {
            label: "Retry",
            onClick: () => {
              setRetryCount(prev => ({ ...prev, [operationKey]: currentRetry + 1 }));
              handleStatusChange(newStatus, reason);
            },
          },
          duration: 8000,
        });
      }
    }
  }, [orderId, effectiveStatus, retryCount, isMountedRef, updateStatusMutation, onClose]);

  const handleConfirmClick = useCallback(() => {
    if (!hasCallLog) {
      setShowNoCallWarning(true);
    } else {
      setShowNoCallWarning(false);
      handleStatusChange("confirmed");
    }
  }, [hasCallLog, handleStatusChange]);

  const handleConfirmAnyway = useCallback(() => {
    setShowNoCallWarning(false);
    handleStatusChange("confirmed");
  }, [handleStatusChange]);

  const handleDispatchClick = useCallback(async () => {
    if (!customerAddress || customerAddress.trim() === "") {
      toast.warning("Please add a delivery address before dispatching", {
        description: "Address field is highlighted below.",
      });
      onFocusAddress?.();
      return;
    }
    await handleStatusChange("packaged", "Sent to courier");
    if (isMountedRef.current()) {
      toast.success("Order sent to Yalidin");
    }
  }, [customerAddress, handleStatusChange, isMountedRef, onFocusAddress]);

  return {
    // State
    effectiveStatus,
    showNoCallWarning,
    setShowNoCallWarning,
    showCancelConfirm,
    setShowCancelConfirm,
    
    // Handlers
    handleStatusChange,
    handleConfirmClick,
    handleConfirmAnyway,
    handleDispatchClick,
  };
}
