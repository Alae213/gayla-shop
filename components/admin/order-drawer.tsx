"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  MapPin,
  Package,
  Truck,
  DollarSign,
  Edit2,
  Save,
  X,
  User,
  Home,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond" // legacy
  | "Called 01"
  | "Called 02"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered"
  | "Retour";

export interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  customerCommune: string;
  customerAddress: string;
  deliveryType: "Domicile" | "Stopdesk";
  deliveryCost: number;
  productName: string;
  productPrice: number;
  productSlug?: string;
  selectedVariant?: { size?: string; color?: string };
  totalAmount: number;
  lastUpdated: number;
  // Phase 1 fields — optional (may not exist on older documents)
  callAttempts?: number;
  callLog?: Array<{
    timestamp: number;
    outcome: "answered" | "no_answer";
    note?: string;
  }>;
  statusHistory?: Array<{
    status: string;
    timestamp: number;
    reason?: string;
  }>;
  adminNotes?: Array<{ text: string; timestamp: number }>;
  fraudScore?: number;
  isBanned?: boolean;
  courierSentAt?: number;
  courierTrackingId?: string;
  courierError?: string;
  retourReason?: string;
}

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

// ─── Status config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  OrderStatus,
  { color: string; bgColor: string; icon: string }
> = {
  Pending: {
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: "⏳",
  },
  Confirmed: {
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: "✓",
  },
  "Called no respond": {
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: "📞",
  },
  "Called 01": {
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: "📞",
  },
  "Called 02": {
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: "📞",
  },
  Cancelled: {
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: "✕",
  },
  Packaged: {
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    icon: "📦",
  },
  Shipped: {
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: "🚚",
  },
  Delivered: {
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: "✓✓",
  },
  Retour: {
    color: "text-slate-700",
    bgColor: "bg-slate-50 border-slate-200",
    icon: "↩",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────────────────

export function OrderDrawer({
  isOpen,
  onClose,
  order,
  onSuccess,
}: OrderDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerWilaya: "",
    customerCommune: "",
    customerAddress: "",
    status: "Pending" as OrderStatus,
    deliveryCost: 0,
  });

  const updateOrder = useMutation(api.orders.update);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  // Sync form when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerWilaya: order.customerWilaya,
        customerCommune: order.customerCommune,
        customerAddress: order.customerAddress,
        status: order.status,
        deliveryCost: order.deliveryCost,
      });
    }
  }, [order]);

  // Reset editing state whenever drawer closes
  useEffect(() => {
    if (!isOpen) setIsEditing(false);
  }, [isOpen]);

  if (!order) return null;

  const config = statusConfig[order.status] ?? statusConfig["Pending"];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrder({
        id: order._id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerWilaya: formData.customerWilaya,
        customerCommune: formData.customerCommune,
        customerAddress: formData.customerAddress,
        status: formData.status,
        deliveryCost: formData.deliveryCost,
      });
      toast.success("Order updated successfully!");
      setIsEditing(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus({ id: order._id, status: newStatus });
      setFormData((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString()} DA`;

  return (
    // modal={false} → no overlay, no focus-trap, no scroll-lock
    // The Kanban board stays fully visible and interactive behind the drawer.
    <Sheet open={isOpen} onOpenChange={onClose} modal={false}>
      <SheetContent
        side="right"
        hideClose
        className="w-[520px] max-w-[95vw] sm:max-w-[520px] p-0 flex flex-col border-l border-gray-200 shadow-2xl"
      >
        {/* ── Sticky Header ─────────────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between shrink-0">
          <SheetHeader className="gap-1">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Package className="h-5 w-5 text-indigo-600" />
              Order #{order.orderNumber}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <span>Created {formatDate(order._creationTime)}</span>
              <span className="text-gray-300">•</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  config.bgColor
                } ${config.color}`}
              >
                {config.icon} {order.status}
              </span>
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

        {/* ── Scrollable Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* ─ Status Section ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Order Status
            </Label>
            {/* Note: This dropdown will be replaced with guided action buttons in Phase 3 */}
            <Select
              value={formData.status}
              onValueChange={(v) => handleStatusChange(v as OrderStatus)}
            >
              <SelectTrigger
                className={`${config.bgColor} border-2 ${config.color} font-medium`}
              >
                <div className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">
                  <div className="flex items-center gap-2">⏳ Pending</div>
                </SelectItem>
                <SelectItem value="Called 01">
                  <div className="flex items-center gap-2">📞 Called 01 — No Answer</div>
                </SelectItem>
                <SelectItem value="Called 02">
                  <div className="flex items-center gap-2">📞 Called 02 — No Answer</div>
                </SelectItem>
                <SelectItem value="Confirmed">
                  <div className="flex items-center gap-2">✓ Confirmed</div>
                </SelectItem>
                <SelectItem value="Cancelled">
                  <div className="flex items-center gap-2">✕ Cancelled</div>
                </SelectItem>
                <SelectItem value="Packaged">
                  <div className="flex items-center gap-2">📦 Packaged</div>
                </SelectItem>
                <SelectItem value="Shipped">
                  <div className="flex items-center gap-2">🚚 Shipped</div>
                </SelectItem>
                <SelectItem value="Delivered">
                  <div className="flex items-center gap-2">✓✓ Delivered</div>
                </SelectItem>
                <SelectItem value="Retour">
                  <div className="flex items-center gap-2">↩ Retour</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* ─ Product Information ────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Ordered Product
              </h3>
              <Badge variant="secondary" className="text-xs">
                Read-only
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Product name + variant chips */}
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-gray-500 mb-1">Product Name</p>
                  <p className="font-medium text-gray-900">{order.productName}</p>
                  {order.selectedVariant &&
                    (order.selectedVariant.size || order.selectedVariant.color) && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {order.selectedVariant.size && (
                          <Badge variant="outline" className="text-xs">
                            Size: {order.selectedVariant.size}
                          </Badge>
                        )}
                        {order.selectedVariant.color && (
                          <Badge variant="outline" className="text-xs">
                            Color: {order.selectedVariant.color}
                          </Badge>
                        )}
                      </div>
                    )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-500 mb-1">Unit Price</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {formatCurrency(order.productPrice)}
                  </p>
                </div>
              </div>

              <Separator className="bg-indigo-200" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery Type
                  </p>
                  <Badge variant="outline" className="text-sm">
                    {order.deliveryType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Delivery Cost
                  </p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.deliveryCost}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          deliveryCost: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="h-8 w-32"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.deliveryCost)}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-indigo-200" />

              {/* Order Summary — grouped (Issue #13) */}
              <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Products</span>
                  <span>{formatCurrency(order.productPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>
                    + {formatCurrency(isEditing ? formData.deliveryCost : order.deliveryCost)}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total COD</span>
                  <span className="font-bold text-xl text-gray-900">
                    {formatCurrency(
                      order.productPrice +
                        (isEditing ? formData.deliveryCost : order.deliveryCost)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ─ Customer Information ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Customer Information
              </h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        customerName: order.customerName,
                        customerPhone: order.customerPhone,
                        customerWilaya: order.customerWilaya,
                        customerCommune: order.customerCommune,
                        customerAddress: order.customerAddress,
                        status: order.status,
                        deliveryCost: order.deliveryCost,
                      });
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> Name
                      </span>
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customerName: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone
                      </span>
                    </Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customerPhone: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerWilaya">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Wilaya
                      </span>
                    </Label>
                    <Input
                      id="customerWilaya"
                      value={formData.customerWilaya}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customerWilaya: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerCommune">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Commune
                      </span>
                    </Label>
                    <Input
                      id="customerCommune"
                      value={formData.customerCommune}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, customerCommune: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerAddress">
                    <span className="flex items-center gap-1">
                      <Home className="h-3 w-3" /> Full Address
                    </span>
                  </Label>
                  <Input
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, customerAddress: e.target.value }))
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {order.customerWilaya}, {order.customerCommune}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium text-gray-900">{order.customerAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Type</p>
                    <Badge variant="outline" className="mt-1">
                      {order.deliveryType}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* ─ Timeline ───────────────────────────────────────────────────────── */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <h4 className="font-medium text-sm text-gray-700">Timeline</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(order._creationTime)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(order.lastUpdated)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Footer ────────────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
