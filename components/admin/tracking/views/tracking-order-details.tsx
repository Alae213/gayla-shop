"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback, useMemo, Profiler, ProfilerOnRenderCallback } from "react";
import { toast } from "sonner";
import { useIsMounted } from "@/hooks/use-abortable-effect";
import { NetworkStatusBanner } from "../ui/network-status-banner";
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
import { TriangleAlert } from "lucide-react";
import { Order } from "./tracking-kanban-board";
import {
  useOrderCallLogging,
  useOrderEditing,
  useOrderStatusActions,
} from "../hooks";
import {
  OrderDetailsHeader,
  CustomerDetailsSection,
  OrderItemsSection,
  OrderTimelinesSection,
  StatusActionBar,
} from "./order-details";

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface TrackingOrderDetailsProps {
  order: Order;
  onClose: () => void;
  onRegisterRequestClose?: (fn: () => void) => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// TEMPORARY: React Profiler for Phase 4 Task 4.1
// Will be removed after profiling complete
// ──────────────────────────────────────────────────────────────────────────────

const PROFILING_ENABLED = true; // Set to false to disable profiling

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (!PROFILING_ENABLED) return;
  
  const color = phase === "mount" ? "#00C853" : "#2979FF";
  const emoji = phase === "mount" ? "🏁" : "🔄";
  
  console.log(
    `%c${emoji} [Profiler] ${id}`,
    `color: ${color}; font-weight: bold`,
    {
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      improvement: baseDuration > 0 ? `${((1 - actualDuration / baseDuration) * 100).toFixed(1)}%` : "N/A",
      startTime: `${startTime.toFixed(2)}ms`,
      commitTime: `${commitTime.toFixed(2)}ms`,
    }
  );
  
  // Warn if render is slow (> 16ms = 1 frame at 60fps)
  if (actualDuration > 16) {
    console.warn(
      `⚠️ [Profiler] Slow render detected: ${id} took ${actualDuration.toFixed(2)}ms (> 16ms)`
    );
  }
};

// ──────────────────────────────────────────────────────────────────────────────

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

/**
 * Tracking Order Details Dialog Content
 * 
 * Main orchestrator component that:
 * - Initializes custom hooks for state management
 * - Handles unsaved changes guard
 * - Renders section components
 * - Manages dialog close behavior
 * 
 * Refactored from 900 lines to ~300 lines by extracting:
 * - Call logging logic → useOrderCallLogging hook
 * - Customer editing logic → useOrderEditing hook
 * - Status actions logic → useOrderStatusActions hook
 * - UI sections → 6 modular components
 * 
 * NOTE: Temporarily wrapped with React.Profiler for Phase 4 Task 4.1
 */
export function TrackingOrderDetails({ order, onClose, onRegisterRequestClose }: TrackingOrderDetailsProps) {
  const isMounted = useIsMounted();
  const isMountedRef = useRef(isMounted);
  useEffect(() => { isMountedRef.current = isMounted; });

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Extract normalized data from order
  const effectiveStatusFromOrder: MVPStatus = (order as any)._normalizedStatus ?? order.status ?? "new";
  const callLogFromOrder = (order as any).callLog ?? [];
  const callAttemptsFromOrder = (order as any).callAttempts ?? 0;
  const statusHistory = (order as any).statusHistory ?? [];

  // Memoize line items to prevent infinite loops in OrderLineItemsEditor
  const lineItems = useMemo(
    () => extractLineItems(order),
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

  // ── Custom Hooks ──────────────────────────────────────────────────────────

  const {
    callNote,
    setCallNote,
    showNoteInput,
    pendingOutcome,
    isLoggingCall,
    callLog,
    callAttempts,
    handleOutcomeClick,
    handleCancelNote,
    handleLogCall,
  } = useOrderCallLogging({
    orderId: order._id,
    callLog: callLogFromOrder,
    callAttempts: callAttemptsFromOrder,
    isMountedRef,
    onClose,
  });

  const {
    isEditing,
    setIsEditing,
    editForm,
    setEditForm,
    hasUnsavedChanges,
    handleSave,
    handleDiscard,
    handlePhoneBlur,
  } = useOrderEditing({
    order,
    isMountedRef,
  });

  const {
    effectiveStatus,
    showNoCallWarning,
    setShowNoCallWarning,
    showCancelConfirm,
    setShowCancelConfirm,
    handleStatusChange,
    handleConfirmClick,
    handleConfirmAnyway,
    handleDispatchClick,
  } = useOrderStatusActions({
    orderId: order._id,
    currentStatus: effectiveStatusFromOrder,
    hasCallLog: callLog.length > 0,
    customerAddress: order.customerAddress,
    isMountedRef,
    onClose,
    onFocusAddress: () => {
      setIsEditing(true);
      setTimeout(() => addressInputRef.current?.focus(), 100);
    },
  });

  // ── Unsaved Changes Guard ─────────────────────────────────────────────────

  const handleRequestClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEditFormChange = useCallback((field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, [setEditForm]);

  const handleLineItemsSaveSuccess = useCallback((newTotal: number) => {
    if (isMountedRef.current()) {
      toast.success(`Order total updated: ${newTotal.toLocaleString()} DZD`);
    }
  }, [isMountedRef]);

  const handlePrintLabel = useCallback(() => {
    window.open(`/api/labels/${order._id}`, "_blank");
  }, [order._id]);

  // ── Render ────────────────────────────────────────────────────────────────

  const dialogContent = (
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

      {/* Main Dialog Content */}
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Network Status Banner */}
          <Profiler id="NetworkStatusBanner" onRender={onRenderCallback}>
            <NetworkStatusBanner className="mb-6" />
          </Profiler>

          {/* Header */}
          <Profiler id="OrderDetailsHeader" onRender={onRenderCallback}>
            <OrderDetailsHeader
              orderNumber={order.orderNumber}
              customerName={order.customerName}
              effectiveStatus={effectiveStatus}
              creationTime={order._creationTime}
              isEditing={isEditing}
              editForm={editForm}
              onEditFormChange={handleEditFormChange}
            />
          </Profiler>

          {/* Customer Details */}
          <Profiler id="CustomerDetailsSection" onRender={onRenderCallback}>
            <CustomerDetailsSection
              isEditing={isEditing}
              onStartEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onDiscard={handleDiscard}
              customerPhone={order.customerPhone}
              customerAddress={order.customerAddress}
              customerCommune={order.customerCommune}
              customerWilaya={order.customerWilaya}
              notes={order.notes}
              editForm={editForm}
              onEditFormChange={handleEditFormChange}
              onPhoneBlur={handlePhoneBlur}
              addressInputRef={addressInputRef}
            />
          </Profiler>

          {/* Order Items */}
          <Profiler id="OrderItemsSection" onRender={onRenderCallback}>
            <OrderItemsSection
              orderId={order._id}
              lineItems={lineItems}
              deliveryCost={order.deliveryCost ?? 0}
              wilaya={order.customerWilaya ?? ""}
              deliveryType={(order.deliveryType as "Stopdesk" | "Domicile") ?? "Stopdesk"}
              onSaveSuccess={handleLineItemsSaveSuccess}
              productName={order.productName}
              productPrice={order.productPrice}
              selectedVariant={order.selectedVariant}
              quantity={order.quantity}
              totalAmount={order.totalAmount}
            />
          </Profiler>

          {/* Call History & Status Timeline */}
          <Profiler id="OrderTimelinesSection" onRender={onRenderCallback}>
            <OrderTimelinesSection
              callLog={callLog}
              statusHistory={statusHistory}
              courierTrackingId={(order as any).courierTrackingId}
              showCallLog={effectiveStatus === "new" || effectiveStatus === "hold" || callLog.length > 0}
              showStatusHistory={statusHistory.length > 0}
            />
          </Profiler>
        </div>

        {/* Fixed Bottom Action Bar */}
        <Profiler id="StatusActionBar" onRender={onRenderCallback}>
          <StatusActionBar
            effectiveStatus={effectiveStatus}
            callAttempts={callAttempts}
            showNoCallWarning={showNoCallWarning}
            showCancelConfirm={showCancelConfirm}
            showNoteInput={showNoteInput}
            pendingOutcome={pendingOutcome}
            callNote={callNote}
            isLoggingCall={isLoggingCall}
            onConfirmClick={handleConfirmClick}
            onConfirmAnyway={handleConfirmAnyway}
            onStatusChange={handleStatusChange}
            onDispatchClick={handleDispatchClick}
            onStartEdit={() => setIsEditing(true)}
            onPrintLabel={handlePrintLabel}
            onSetShowCancelConfirm={setShowCancelConfirm}
            onOutcomeClick={handleOutcomeClick}
            onCallNoteChange={setCallNote}
            onCancelNote={handleCancelNote}
            onLogCall={handleLogCall}
            orderId={order._id}
            cancelReason={(order as any).cancelReason}
          />
        </Profiler>
      </div>
    </>
  );

  // Wrap entire component with Profiler for overall metrics
  if (PROFILING_ENABLED) {
    return (
      <Profiler id="TrackingOrderDetails" onRender={onRenderCallback}>
        {dialogContent}
      </Profiler>
    );
  }

  return dialogContent;
}
