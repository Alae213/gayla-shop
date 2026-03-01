"use client";

import { Button } from "@/components/ui/button";

interface ActionBtn {
  toStatus: string;
  label: string;
  icon: string;
  cls: string;
  requiresReason: boolean;
}

interface OrderDrawerFooterProps {
  orderNumber: string;
  primaryAction: ActionBtn | null;
  isActioning: boolean;
  onActionClick: (action: ActionBtn) => void;
  onClose: () => void;
}

/**
 * OrderDrawer Footer Section
 * 
 * Displays primary action button and close button at the bottom of the drawer.
 */
export function OrderDrawerFooter({
  orderNumber,
  primaryAction,
  isActioning,
  onActionClick,
  onClose,
}: OrderDrawerFooterProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between gap-3">
      {primaryAction ? (
        <Button
          size="sm"
          disabled={isActioning}
          className={`gap-1.5 ${primaryAction.cls}`}
          onClick={() => onActionClick(primaryAction)}
        >
          <span>{primaryAction.icon}</span> {primaryAction.label}
        </Button>
      ) : (
        <p className="text-xs text-gray-400 font-mono">{orderNumber}</p>
      )}
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
