"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useRef, useEffect } from "react";
import type { OrderStatus } from "../types";

export interface ActionBtn {
  toStatus: OrderStatus;
  label: string;
  icon: string;
  cls: string;
  requiresReason: boolean;
  reasons?: string[];
  useRetour?: boolean;
}

interface OrderDrawerActionsProps {
  actionBtns: ActionBtn[];
  pendingAction: ActionBtn | null;
  actionReason: string;
  isActioning: boolean;
  twoNoAnswers: boolean;
  onActionClick: (btn: ActionBtn) => void;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * OrderDrawer Actions Section
 * 
 * Displays available status transition actions and confirmation flow.
 * Handles action selection, reason input, and confirmation.
 */
export function OrderDrawerActions({
  actionBtns,
  pendingAction,
  actionReason,
  isActioning,
  twoNoAnswers,
  onActionClick,
  onReasonChange,
  onConfirm,
  onCancel,
}: OrderDrawerActionsProps) {
  const reasonSelectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pendingAction?.requiresReason) {
      const t = setTimeout(() => reasonSelectRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [pendingAction]);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</h3>

      {twoNoAnswers && (
        <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">2 unanswered call attempts</p>
            <p className="text-xs text-amber-700 mt-0.5">
              The customer did not answer twice. "Confirm Order" has been removed. Please cancel this
              order below.
            </p>
          </div>
        </div>
      )}

      {actionBtns.length > 0 ? (
        <>
          {!pendingAction && (
            <div className="flex flex-wrap gap-2">
              {actionBtns.map((btn) => (
                <Button
                  key={btn.toStatus}
                  size="sm"
                  disabled={isActioning}
                  className={`gap-1.5 ${btn.cls}`}
                  onClick={() => onActionClick(btn)}
                >
                  <span>{btn.icon}</span> {btn.label}
                </Button>
              ))}
            </div>
          )}

          {pendingAction && (
            <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-900">
                {pendingAction.icon} {pendingAction.label}
              </p>
              {pendingAction.requiresReason && (
                <Select value={actionReason} onValueChange={onReasonChange}>
                  <SelectTrigger ref={reasonSelectRef} className="bg-white text-sm">
                    <SelectValue placeholder="Select a reason…" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingAction.reasons?.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-sm text-amber-800">Confirm this action?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onConfirm}
                  disabled={isActioning || (pendingAction.requiresReason && !actionReason)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isActioning ? "Updating…" : "Yes, continue"}
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-400 text-center">
          Terminal state — no further actions.
        </div>
      )}
    </div>
  );
}
