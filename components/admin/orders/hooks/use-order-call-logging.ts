"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

const MAX_RETRY_ATTEMPTS = 3;

const OUTCOME_META: Record<CallOutcome, { label: string }> = {
  answered:       { label: "Answered" },
  "no answer":    { label: "No Answer" },
  "wrong number": { label: "Wrong Number" },
  refused:        { label: "Refused" },
};

interface UseOrderCallLoggingProps {
  orderId: Id<"orders">;
  callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }>;
  callAttempts: number;
  isMountedRef: React.MutableRefObject<() => boolean>;
  onClose: () => void;
}

/**
 * Custom hook for managing call logging in order details.
 * 
 * Handles:
 * - Call outcome selection and note input
 * - Optimistic UI updates with rollback on error
 * - Auto-cancel after 2 "no answer" attempts
 * - Retry mechanism with max 3 attempts
 * - Undo functionality for auto-canceled orders
 */
export function useOrderCallLogging({
  orderId,
  callLog: initialCallLog,
  callAttempts: initialCallAttempts,
  isMountedRef,
  onClose,
}: UseOrderCallLoggingProps) {
  const [callNote, setCallNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<CallOutcome | null>(null);
  const [isLoggingCall, setIsLoggingCall] = useState(false);

  // Optimistic state
  const [optimisticCallLog, setOptimisticCallLog] = useState<typeof initialCallLog | null>(null);
  const [optimisticCallAttempts, setOptimisticCallAttempts] = useState<number | null>(null);

  // Retry tracking
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const logCallOutcomeMutation = useMutation(api.orders.logCallOutcome);
  const resetCallAttemptsMutation = useMutation(api.orders.resetCallAttempts);

  // Effective values (optimistic || server)
  const callLog = optimisticCallLog ?? initialCallLog;
  const callAttempts = optimisticCallAttempts ?? initialCallAttempts;

  const handleOutcomeClick = useCallback((outcome: CallOutcome) => {
    setPendingOutcome(outcome);
    setShowNoteInput(true);
    setCallNote("");
  }, []);

  const handleCancelNote = useCallback(() => {
    setShowNoteInput(false);
    setPendingOutcome(null);
    setCallNote("");
  }, []);

  const handleUndoCancel = useCallback(async () => {
    const operationKey = "resetCallAttempts";
    const currentRetry = retryCount[operationKey] || 0;

    try {
      await resetCallAttemptsMutation({ id: orderId });
      if (isMountedRef.current()) {
        setRetryCount(prev => ({ ...prev, [operationKey]: 0 }));
        toast.success("Order restored to New");
        console.log("[CallAttempts] Reset successfully");
      }
    } catch (error) {
      if (!isMountedRef.current()) return;
      
      console.error("[CallAttempts] Reset failed:", error);
      
      if (currentRetry >= MAX_RETRY_ATTEMPTS) {
        toast.error("Failed to restore order", {
          description: "Please contact support if this issue persists.",
          duration: 10000,
        });
      } else {
        toast.error("Failed to restore order", {
          action: {
            label: "Retry",
            onClick: () => {
              setRetryCount(prev => ({ ...prev, [operationKey]: currentRetry + 1 }));
              handleUndoCancel();
            },
          },
          duration: 8000,
        });
      }
    }
  }, [orderId, retryCount, isMountedRef, resetCallAttemptsMutation]);

  const handleLogCall = useCallback(async () => {
    if (!pendingOutcome) return;
    
    const operationKey = "logCallOutcome";
    const currentRetry = retryCount[operationKey] || 0;
    
    setIsLoggingCall(true);
    
    // Optimistic update
    const newEntry = {
      timestamp: Date.now(),
      outcome: pendingOutcome,
      ...(callNote.trim() ? { note: callNote.trim() } : {}),
    };
    const previousCallLog = callLog;
    const previousCallAttempts = callAttempts;
    
    setOptimisticCallLog([...callLog, newEntry]);
    if (pendingOutcome === "no answer") {
      setOptimisticCallAttempts(callAttempts + 1);
    }
    
    console.log("[CallLog] Optimistic update:", pendingOutcome);
    
    try {
      const result = await logCallOutcomeMutation({
        orderId,
        outcome: pendingOutcome,
        ...(callNote.trim() ? { note: callNote.trim() } : {}),
      });
      
      if (!isMountedRef.current()) return;
      
      // Clear optimistic state (server state will take over)
      setOptimisticCallLog(null);
      setOptimisticCallAttempts(null);
      setRetryCount(prev => ({ ...prev, [operationKey]: 0 }));
      
      const meta = OUTCOME_META[pendingOutcome];
      
      if (result.autoCanceled) {
        toast.error(`Order canceled \u2014 ${meta.label.toLowerCase()}`, {
          description: result.cancelReason,
          duration: 8000,
          action: pendingOutcome === "no answer"
            ? { label: "Undo", onClick: handleUndoCancel }
            : undefined,
        });
        onClose();
      } else if ((result as any).wrongNumber) {
        toast.warning("Wrong number \u2014 order placed on hold. Please correct the phone number.");
      } else {
        toast.success(`\u2713 ${meta.label} logged`);
      }
      
      setShowNoteInput(false);
      setPendingOutcome(null);
      setCallNote("");
      console.log("[CallLog] Saved successfully");
    } catch (error) {
      if (!isMountedRef.current()) return;
      
      // Rollback optimistic update
      console.error("[CallLog] Failed:", error);
      setOptimisticCallLog(previousCallLog);
      setOptimisticCallAttempts(previousCallAttempts);
      
      if (currentRetry >= MAX_RETRY_ATTEMPTS) {
        toast.error("Failed to log call", {
          description: "Please contact support if this issue persists.",
          duration: 10000,
        });
      } else {
        toast.error("Failed to log call", {
          description: "The call outcome wasn't saved.",
          action: {
            label: "Retry",
            onClick: () => {
              setRetryCount(prev => ({ ...prev, [operationKey]: currentRetry + 1 }));
              handleLogCall();
            },
          },
          duration: 8000,
        });
      }
    } finally {
      if (isMountedRef.current()) {
        setIsLoggingCall(false);
      }
    }
  }, [pendingOutcome, callNote, callLog, callAttempts, orderId, retryCount, isMountedRef, logCallOutcomeMutation, handleUndoCancel, onClose]);

  return {
    // State
    callNote,
    setCallNote,
    showNoteInput,
    pendingOutcome,
    isLoggingCall,
    callLog,
    callAttempts,
    
    // Handlers
    handleOutcomeClick,
    handleCancelNote,
    handleLogCall,
    handleUndoCancel,
  };
}
