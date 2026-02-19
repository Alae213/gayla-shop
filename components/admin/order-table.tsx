"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Package } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Called 01"
  | "Called 02"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered"
  | "Retour";

interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  productName: string;
  deliveryType: "Domicile" | "Stopdesk";
  totalAmount: number;
  callAttempts?: number;
  isBanned?: boolean;
}

interface OrderTableProps {
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
  /** When true, renders a checkbox column for multi-select. Default false. */
  selectable?: boolean;
  /** Currently selected IDs (controlled from parent). */
  selectedIds?: Set<Id<"orders">>;
  /** Called when selection changes. Parent owns the state. */
  onSelectionChange?: (ids: Set<Id<"orders">>) => void;
}

// ─── Status colours ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:             "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Called 01":         "bg-orange-100 text-orange-800 border-orange-300",
  "Called 02":         "bg-red-100    text-red-800    border-red-200",
  "Called no respond": "bg-orange-100 text-orange-800 border-orange-300",
  Confirmed:           "bg-blue-100   text-blue-800   border-blue-300",
  Cancelled:           "bg-red-100    text-red-800    border-red-300",
  Packaged:            "bg-purple-100 text-purple-800 border-purple-300",
  Shipped:             "bg-indigo-100 text-indigo-800 border-indigo-300",
  Delivered:           "bg-green-100  text-green-800  border-green-300",
  Retour:              "bg-slate-100  text-slate-700  border-slate-300",
};

const getStatusColor = (s: OrderStatus) =>
  STATUS_COLORS[s] ?? "bg-gray-100 text-gray-700 border-gray-300";

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderTable({
  orders,
  onOrderClick,
  selectable = false,
  selectedIds,
  onSelectionChange,
}: OrderTableProps) {

  const selected = selectedIds ?? new Set<Id<"orders">>();
  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o._id));
  const someSelected = orders.some((o) => selected.has(o._id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      // deselect all rows currently visible
      const next = new Set(selected);
      orders.forEach((o) => next.delete(o._id));
      onSelectionChange(next);
    } else {
      const next = new Set(selected);
      orders.forEach((o) => next.add(o._id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: Id<"orders">) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
        <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {/* Checkbox column — only in selectable mode */}
            {selectable && (
              <TableHead className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleAll}
                  aria-label="Select all orders"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">Order #</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Calls</TableHead>
            <TableHead className="font-semibold">Delivery</TableHead>
            <TableHead className="font-semibold">Total</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const isSelected = selected.has(order._id);
            return (
              <TableRow
                key={order._id}
                onClick={() => onOrderClick(order._id)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-gray-50"
                }`}
              >
                {/* Checkbox cell — stops row click propagation */}
                {selectable && (
                  <TableCell className="w-10 px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(order._id)}
                      aria-label={`Select order ${order.orderNumber}`}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
                    />
                  </TableCell>
                )}

                <TableCell className="font-mono text-sm text-indigo-600">
                  {order.orderNumber}
                </TableCell>

                <TableCell>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm">{order.customerName}</p>
                      {order.isBanned && <span className="text-xs">🚫</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{order.customerPhone}</p>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-gray-700">{order.productName}</TableCell>

                <TableCell>
                  <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  {(order.callAttempts ?? 0) > 0 ? (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      (order.callAttempts ?? 0) >= 2 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      📞 {order.callAttempts}/2
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <div>
                    <p className="text-sm">{order.deliveryType}</p>
                    <p className="text-xs text-gray-500">{order.customerWilaya}</p>
                  </div>
                </TableCell>

                <TableCell className="font-semibold text-sm">
                  {order.totalAmount.toLocaleString()} DA
                </TableCell>

                <TableCell className="text-sm text-gray-500">
                  {new Date(order._creationTime).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); onOrderClick(order._id); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
