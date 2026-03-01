"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useIsMounted } from "@/hooks/use-abortable-effect";
import { NetworkStatusBanner } from "../components/network-status-banner";
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
import { Order } from "./kanban-board";
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
} from "./order-details/index";

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onRegisterRequestClose?: (fn: () => void) => void;
}

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

export function OrderDetails({ order, onClose, onRegisterRequestClose }: OrderDetailsProps) {
  const isMounted = useIsMounted();
  const isMountedRef = useRef(isMounted);
  useEffect(() => { isMountedRef.current = isMounted; });

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const effectiveStatusFromOrder: MVPStatus = (order as any)._normalizedStatus ?? order.status ?? "new";
  const callLogFromOrder = (order as any).callLog ?? [];
  const callAttemptsFromOrder = (order as any).callAttempts ?? 0;
  const statusHistory = (order as any).statusHistory ?? [];

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

  return (
    <>
      <AlertDialog
        open={showUnsavedDialog}
        onOpenChange={(open) => { if (!open) setShowUnsavedDialog(false); }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-warning mb-1">
              <TriangleAlert className="h-5 w-5 shrink-0" />
              <AlertDialogTitle className="text-warning">Unsaved changes</AlertDialogTitle>
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
              className="bg-foreground hover:bg-foreground/90 text-background"
            >
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full bg-card">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="mb-6">
            <NetworkStatusBanner />
          </div>

          <div className="mb-6">
            <OrderDetailsHeader
              orderNumber={order.orderNumber}
              customerName={order.customerName}
              effectiveStatus={effectiveStatus}
              creationTime={order._creationTime}
              isEditing={isEditing}
              editForm={editForm}
              onEditFormChange={handleEditFormChange}
            />
          </div>

          <div className="mb-6">
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
          </div>

          <div className="mb-6">
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
          </div>

          <OrderTimelinesSection
            callLog={callLog}
            statusHistory={statusHistory}
            courierTrackingId={(order as any).courierTrackingId}
            showCallLog={effectiveStatus === "new" || effectiveStatus === "hold" || callLog.length > 0}
            showStatusHistory={statusHistory.length > 0}
          />
        </div>

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
      </div>
    </>
  );
}
