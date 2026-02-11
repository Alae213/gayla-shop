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
import { Phone, MapPin, Truck, DollarSign, Package } from "lucide-react";
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
  totalAmount: number;
  lastUpdated: number;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onSuccess }: OrderDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerWilaya: "",
    customerCommune: "",
    customerAddress: "",
    status: "Pending" as OrderStatus,
  });

  const updateOrder = useMutation(api.orders.update);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  useEffect(() => {
    if (order) {
      setOrderForm({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerWilaya: order.customerWilaya,
        customerCommune: order.customerCommune,
        customerAddress: order.customerAddress,
        status: order.status,
      });
    }
  }, [order]);

  if (!order) return null;

  const handleSave = async () => {
    try {
      await updateOrder({
        id: order._id,
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerWilaya: orderForm.customerWilaya,
        customerCommune: orderForm.customerCommune,
        customerAddress: orderForm.customerAddress,
        status: orderForm.status,
      });

      toast.success("Order updated successfully!");
      setIsEditing(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus({
        id: order._id,
        status: newStatus,
      });

      setOrderForm((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Order status changed to ${newStatus}`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Order Details
          </DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber} • Created on{" "}
            {new Date(order._creationTime).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div>
            <Label htmlFor="status">Order Status</Label>
            <Select
              value={orderForm.status}
              onValueChange={(value: OrderStatus) => handleStatusChange(value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Called no respond">Called no respond</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Packaged">Packaged</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">{order.productPrice.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Cost:</span>
                <span className="font-medium">{order.deliveryCost.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Type:</span>
                <Badge variant="outline">{order.deliveryType}</Badge>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-indigo-600 text-lg">
                  {order.totalAmount.toLocaleString()} DA
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
              <Button
                size="sm"
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Name</Label>
                  <Input
                    id="customerName"
                    value={orderForm.customerName}
                    onChange={(e) =>
                      setOrderForm((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={orderForm.customerPhone}
                    onChange={(e) =>
                      setOrderForm((prev) => ({ ...prev, customerPhone: e.target.value }))
                    }
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerWilaya">Wilaya</Label>
                    <Input
                      id="customerWilaya"
                      value={orderForm.customerWilaya}
                      onChange={(e) =>
                        setOrderForm((prev) => ({ ...prev, customerWilaya: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerCommune">Commune</Label>
                    <Input
                      id="customerCommune"
                      value={orderForm.customerCommune}
                      onChange={(e) =>
                        setOrderForm((prev) => ({ ...prev, customerCommune: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    value={orderForm.customerAddress}
                    onChange={(e) =>
                      setOrderForm((prev) => ({ ...prev, customerAddress: e.target.value }))
                    }
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">
                      {order.customerWilaya}, {order.customerCommune}
                    </p>
                    <p className="text-sm text-gray-600">{order.customerAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">Delivery Type</p>
                    <Badge variant="outline" className="mt-1">
                      {order.deliveryType}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-xs text-gray-600">
            <p>Created: {new Date(order._creationTime).toLocaleString()}</p>
            <p>Last Updated: {new Date(order.lastUpdated).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
