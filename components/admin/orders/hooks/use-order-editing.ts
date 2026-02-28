"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Order } from "../views/kanban-board";

const MAX_RETRY_ATTEMPTS = 3;

function formatDZPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("213") && digits.length >= 12) {
    const local = digits.slice(3);
    return `+213 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    const local = digits.slice(1);
    return `+213 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return raw;
}

function orderToForm(order: Order) {
  return {
    customerName:    order.customerName    ?? "",
    customerPhone:   order.customerPhone   ?? "",
    customerAddress: order.customerAddress ?? "",
    customerWilaya:  order.customerWilaya  ?? "",
    customerCommune: order.customerCommune ?? "",
    notes:           order.notes           ?? "",
  };
}

interface UseOrderEditingProps {
  order: Order;
  isMountedRef: React.MutableRefObject<() => boolean>;
}

export function useOrderEditing({ order, isMountedRef }: UseOrderEditingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => orderToForm(order));
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const updateCustomerInfoMutation = useMutation(api.orders.updateCustomerInfo);

  useEffect(() => {
    if (!isEditing && isMountedRef.current()) {
      setEditForm(orderToForm(order));
    }
  }, [
    order.customerName, order.customerPhone, order.customerAddress,
    order.customerWilaya, order.customerCommune, order.notes,
    isEditing, isMountedRef,
  ]);

  const hasUnsavedChanges = isEditing && (
    editForm.customerName    !== (order.customerName    ?? "") ||
    editForm.customerPhone   !== (order.customerPhone   ?? "") ||
    editForm.customerAddress !== (order.customerAddress ?? "") ||
    editForm.customerWilaya  !== (order.customerWilaya  ?? "") ||
    editForm.customerCommune !== (order.customerCommune ?? "") ||
    editForm.notes           !== (order.notes           ?? "")
  );

  const handleSave = useCallback(async () => {
    const operationKey = "updateCustomerInfo";
    const currentRetry = retryCount[operationKey] || 0;
    try {
      await updateCustomerInfoMutation({ id: order._id, ...editForm });
      if (isMountedRef.current()) {
        setIsEditing(false);
        setRetryCount(prev => ({ ...prev, [operationKey]: 0 }));
        toast.success("Order updated");
      }
    } catch (error) {
      if (!isMountedRef.current()) return;
      if (currentRetry >= MAX_RETRY_ATTEMPTS) {
        toast.error("Failed to update order", { description: "Please contact support if this issue persists.", duration: 10000 });
      } else {
        toast.error("Failed to update order", {
          description: "Your changes weren't saved.",
          action: { label: "Retry", onClick: () => { setRetryCount(prev => ({ ...prev, [operationKey]: currentRetry + 1 })); handleSave(); } },
          duration: 8000,
        });
      }
    }
  }, [order._id, editForm, retryCount, isMountedRef, updateCustomerInfoMutation]);

  const handleDiscard = useCallback(() => {
    setEditForm(orderToForm(order));
    setIsEditing(false);
  }, [order]);

  const handlePhoneBlur = useCallback((value: string) => {
    setEditForm(prev => ({ ...prev, customerPhone: formatDZPhone(value) }));
  }, []);

  return { isEditing, setIsEditing, editForm, setEditForm, hasUnsavedChanges, handleSave, handleDiscard, handlePhoneBlur };
}