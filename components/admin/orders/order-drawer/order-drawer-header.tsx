"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Package, X, AlertTriangle } from "lucide-react";
import type { Order, OrderStatus } from "../types";

interface OrderDrawerHeaderProps {
  order: Order;
  statusConfig: {
    color: string;
    bg: string;
    icon: string;
  };
  onClose: () => void;
}

/**
 * OrderDrawer Header Section
 * 
 * Displays order number, creation date, status badge, and close button.
 * Pure presentational component - no state management.
 */
export function OrderDrawerHeader({
  order,
  statusConfig,
  onClose,
}: OrderDrawerHeaderProps) {
  const fmt = (ts: number) =>
    new Date(ts).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const isBanned = order.isBanned ?? false;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between shrink-0">
      <SheetHeader className="gap-1">
        <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Package className="h-5 w-5 text-indigo-600" />
          Order #{order.orderNumber}
        </SheetTitle>
        <SheetDescription className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>{fmt(order._creationTime)}</span>
          <span className="text-gray-300">•</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.icon} {order.status}
          </span>
          {isBanned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-red-100 border-red-300 text-red-700">
              🚫 Banned
            </span>
          )}
        </SheetDescription>
      </SheetHeader>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-gray-700 -mt-1 ml-4"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
