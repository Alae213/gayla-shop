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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Calendar,
  Edit2,
  Save,
  X,
  User,
  Home,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered";

  interface Order {
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
    productSlug?: string; // ✅ This makes it optional
    totalAmount: number;
    lastUpdated: number;
  }
  

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

const statusConfig: Record<
  OrderStatus,
  { color: string; bgColor: string; icon: string }
> = {
  Pending: { color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: "⏳" },
  Confirmed: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: "✓" },
  "Called no respond": {
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: "📞",
  },
  Cancelled: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: "✕" },
  Packaged: { color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: "📦" },
  Shipped: { color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200", icon: "🚚" },
  Delivered: { color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: "✓✓" },
};

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: OrderDetailsModalProps) {
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

  if (!order) return null;

  const config = statusConfig[order.status];

  const handleSave = async () => {
    if (!order) return;

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
    if (!order) return;

    try {
      await updateOrderStatus({
        id: order._id,
        status: newStatus,
      });

      setFormData((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Order status changed to ${newStatus}`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} DA`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <Package className="h-6 w-6 text-indigo-600" />
                Order Details
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2">
  <span className="font-mono text-lg font-semibold text-indigo-600">
    {order.orderNumber}
  </span>
  <span className="text-gray-400">•</span>
  <span className="text-sm text-gray-500">
    Created {formatDate(order._creationTime)}
  </span>
</DialogDescription>

            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Section */}
          <div className="space-y-3">
            <Label htmlFor="status" className="text-base font-semibold text-gray-900">
              Order Status
            </Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
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
                  <div className="flex items-center gap-2">
                    <span>⏳</span> Pending
                  </div>
                </SelectItem>
                <SelectItem value="Confirmed">
                  <div className="flex items-center gap-2">
                    <span>✓</span> Confirmed
                  </div>
                </SelectItem>
                <SelectItem value="Called no respond">
                  <div className="flex items-center gap-2">
                    <span>📞</span> Called no respond
                  </div>
                </SelectItem>
                <SelectItem value="Cancelled">
                  <div className="flex items-center gap-2">
                    <span>✕</span> Cancelled
                  </div>
                </SelectItem>
                <SelectItem value="Packaged">
                  <div className="flex items-center gap-2">
                    <span>📦</span> Packaged
                  </div>
                </SelectItem>
                <SelectItem value="Shipped">
                  <div className="flex items-center gap-2">
                    <span>🚚</span> Shipped
                  </div>
                </SelectItem>
                <SelectItem value="Delivered">
                  <div className="flex items-center gap-2">
                    <span>✓✓</span> Delivered
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Product Information */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Product Information
              </h3>
              <Badge variant="secondary" className="text-xs">
                Read-only
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product Name</p>
                  <p className="font-medium text-gray-900">{order.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="font-bold text-indigo-600 text-lg">
                    {formatCurrency(order.productPrice)}
                  </p>
                </div>
              </div>

              <Separator className="bg-indigo-200" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Delivery Type
                  </p>
                  <Badge variant="outline" className="text-sm">
                    {order.deliveryType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Delivery Cost
                  </p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.deliveryCost}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
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

              <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="font-bold text-2xl text-indigo-600">
                    {formatCurrency(
                      order.productPrice + (isEditing ? formData.deliveryCost : order.deliveryCost)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
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
                  <Edit2 className="h-4 w-4" />
                  Edit
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
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Customer Name
                      </span>
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      className="mt-2"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone Number
                      </span>
                    </Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      className="mt-2"
                      placeholder="0555 12 34 56"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerWilaya">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Wilaya
                      </span>
                    </Label>
                    <Input
                      id="customerWilaya"
                      value={formData.customerWilaya}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerWilaya: e.target.value,
                        }))
                      }
                      className="mt-2"
                      placeholder="e.g., Alger"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerCommune">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Commune
                      </span>
                    </Label>
                    <Input
                      id="customerCommune"
                      value={formData.customerCommune}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerCommune: e.target.value,
                        }))
                      }
                      className="mt-2"
                      placeholder="e.g., Bab Ezzouar"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerAddress">
                    <span className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      Full Address
                    </span>
                  </Label>
                  <Input
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerAddress: e.target.value,
                      }))
                    }
                    className="mt-2"
                    placeholder="Enter full delivery address"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {order.customerWilaya}, {order.customerCommune}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium text-gray-900">{order.customerAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
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

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <h4 className="font-medium text-sm text-gray-700">Timeline</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
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

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
