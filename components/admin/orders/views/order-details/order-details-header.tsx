"use client";

import * as React from "react";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";
import { StatusPill } from "../../components/status-pill";

type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";

interface OrderDetailsHeaderProps {
  orderNumber: string;
  customerName: string;
  effectiveStatus: MVPStatus;
  creationTime: number;
  isEditing: boolean;
  editForm: { customerName: string };
  onEditFormChange: (field: string, value: string) => void;
}

/**
 * Order Details Header
 * 
 * Displays:
 * - Creation timestamp
 * - Customer name (editable in edit mode)
 * - Order number badge
 * - Status pill
 */
export function OrderDetailsHeader({
  orderNumber,
  customerName,
  effectiveStatus,
  creationTime,
  isEditing,
  editForm,
  onEditFormChange,
}: OrderDetailsHeaderProps) {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[#AAAAAA] uppercase tracking-[0.1em] mb-2">
        <Clock className="w-3.5 h-3.5" />
        {format(creationTime, "MMM d, yyyy 'at' HH:mm")}
      </div>
      
      {isEditing ? (
        <input
          type="text"
          value={editForm.customerName}
          onChange={e => onEditFormChange("customerName", e.target.value)}
          aria-label="Customer Name"
          className="text-[28px] font-bold text-[#3A3A3A] leading-tight mb-1 bg-white border border-[#ECECEC] rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] w-full"
          placeholder="Customer Name"
        />
      ) : (
        <div className="flex items-center gap-2 mb-1">
          <User className="w-6 h-6 text-[#AAAAAA]" />
          <h2 className="text-[28px] font-bold text-[#3A3A3A] leading-tight">
            {customerName}
          </h2>
        </div>
      )}
      
      <div className="inline-flex items-center gap-2 bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#ECECEC]">
        <span className="text-[13px] font-mono font-bold text-[#3A3A3A] tracking-tight">
          {orderNumber}
        </span>
        <StatusPill status={effectiveStatus} />
      </div>
    </header>
  );
}
