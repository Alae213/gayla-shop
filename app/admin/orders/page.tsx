"use client";

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // ✅ ADD THIS LINE
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Phone, MapPin, Truck, Calendar, Copy } from "lucide-react";


const STATUSES = [
  { value: "Pending", label: "Pending", color: "bg-yellow-500" },
  { value: "Confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "Called no respond", label: "No Response", color: "bg-orange-500" },
  { value: "Packaged", label: "Packaged", color: "bg-purple-500" },
  { value: "Shipped", label: "Shipped", color: "bg-indigo-500" },
  { value: "Delivered", label: "Delivered", color: "bg-green-500" },
  { value: "Cancelled", label: "Cancelled", color: "bg-red-500" },
] as const;

export default function OrdersPage() {
  const orders = useQuery(api.orders.list, {});
  const orderCounts = useQuery(api.orders.getCountByStatus);
  const updateStatus = useMutation(api.orders.updateStatus);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleStatusChange = async (orderId: Id<"orders">, newStatus: any) => {
    try {
      await updateStatus({ id: orderId, status: newStatus });
      setShowOrderDialog(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleDragStart = (orderId: string) => {
    setDraggedOrderId(orderId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    
    if (orderId && orderId !== draggedOrderId) {
      return;
    }

    if (draggedOrderId) {
      await updateStatus({
        id: draggedOrderId as Id<"orders">,
        status: newStatus as any,
      });
      setDraggedOrderId(null);
    }
  };

  if (!orders || !orderCounts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Drag and drop orders to update status</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 pb-8">
        {STATUSES.map((status) => {
          const statusOrders = orders.filter((o) => o.status === status.value);
          const count = orderCounts[status.value] || 0;

          return (
            <div
              key={status.value}
              className="bg-muted/40 rounded-lg p-3 min-h-[600px]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("ring-2", "ring-primary");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("ring-2", "ring-primary");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("ring-2", "ring-primary");
                handleDrop(e, status.value);
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-muted/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  <h3 className="font-semibold text-sm">{status.label}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </div>

              {/* Order Cards */}
              <div className="space-y-2">
                {statusOrders.map((order) => (
                  <Card
                    key={order._id}
                    className="cursor-grab active:cursor-grabbing hover:shadow-lg transition bg-white"
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(order._id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("orderId", order._id);
                    }}
                    onClick={() => handleViewOrder(order)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <p className="font-mono text-xs text-muted-foreground">
                          {order.orderNumber}
                        </p>
                        <p className="font-semibold text-sm">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.productName}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.customerWilaya}
                          </span>
                          <span className="text-sm font-bold">
                            {formatPrice(order.totalAmount, "en-US")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {statusOrders.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No orders
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Order Details
              <Badge
                variant={
                  selectedOrder?.status === "Delivered"
                    ? "default"
                    : selectedOrder?.status === "Cancelled"
                    ? "destructive"
                    : "secondary"
                }
              >
                {selectedOrder?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Order Number: <strong>{selectedOrder?.orderNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Changer */}
              <div className="space-y-2">
                <Label>Change Status</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(newStatus) =>
                    handleStatusChange(selectedOrder._id, newStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      <a href={`tel:${selectedOrder.customerPhone}`} className="hover:text-primary">
                        {selectedOrder.customerPhone}
                      </a>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">
                      {selectedOrder.customerAddress}
                      <br />
                      {selectedOrder.customerCommune}, {selectedOrder.customerWilaya}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Product Details</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">
                      {formatPrice(selectedOrder.productPrice, "en-US")}
                    </span>
                  </div>
                  {selectedOrder.selectedVariant && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variant</span>
                      <span className="font-medium">
                        {selectedOrder.selectedVariant.size && `Size: ${selectedOrder.selectedVariant.size}`}
                        {selectedOrder.selectedVariant.size && selectedOrder.selectedVariant.color && " • "}
                        {selectedOrder.selectedVariant.color && `Color: ${selectedOrder.selectedVariant.color}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Type</span>
                    <span className="font-medium">{selectedOrder.deliveryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Cost</span>
                    <span className="font-medium">
                      {formatPrice(selectedOrder.deliveryCost, "en-US")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">
                      {formatPrice(selectedOrder.totalAmount, "en-US")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
                <Calendar className="h-3 w-3" />
                <span>
                  Ordered: {new Date(selectedOrder._creationTime).toLocaleString()}
                </span>
                {selectedOrder.lastUpdated && (
                  <>
                    <span>•</span>
                    <span>
                      Updated: {new Date(selectedOrder.lastUpdated).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const message = `Order: ${selectedOrder.orderNumber}\nCustomer: ${selectedOrder.customerName}\nPhone: ${selectedOrder.customerPhone}\nAddress: ${selectedOrder.customerAddress}, ${selectedOrder.customerCommune}, ${selectedOrder.customerWilaya}\nProduct: ${selectedOrder.productName}\nTotal: ${selectedOrder.totalAmount} DZD`;
                    navigator.clipboard.writeText(message);
                    alert("Order details copied to clipboard!");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(`tel:${selectedOrder.customerPhone}`);
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
