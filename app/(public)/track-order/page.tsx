// app/(public)/track-order/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");

  const order = useQuery(
    api.orders.getByOrderNumber,
    searchedOrderNumber ? { orderNumber: searchedOrderNumber } : "skip"
  );

  const handleSearch = () => {
    setSearchedOrderNumber(orderNumber);
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Enter your order number (e.g., GAY-123456-ABCD)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {searchedOrderNumber && order === undefined && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {searchedOrderNumber && order === null && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Order not found. Please check your order number.
            </p>
          </CardContent>
        </Card>
      )}

      {order && (
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={
                  order.status === "Delivered"
                    ? "default"
                    : order.status === "Cancelled"
                    ? "destructive"
                    : "secondary"
                }
              >
                {order.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-semibold">{order.productName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-semibold">{order.customerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold">{order.customerPhone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Location:</span>
              <span className="font-semibold text-right">
                {order.customerWilaya}, {order.customerCommune}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Type:</span>
              <span className="font-semibold">{order.deliveryType}</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold text-lg">
                {formatPrice(order.totalAmount, "en-US")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
