"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, MapPin, Phone, User, Home } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as Id<"orders">;

  const order = useQuery(api.orders.getById, { id: orderId });

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 mx-auto mb-4 bg-muted rounded-full" />
          <div className="h-6 w-48 mx-auto bg-muted rounded" />
        </div>
      </div>
    );
  }

  const lineItems = order.lineItems || [
    {
      productId: order.productId!,
      productName: order.productName,
      productSlug: order.productSlug,
      quantity: 1,
      unitPrice: order.productPrice || 0,
      variants: order.selectedVariant,
      lineTotal: order.productPrice || 0,
      thumbnail: undefined,
    },
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll contact you shortly to confirm.
        </p>
      </div>

      {/* Order Number */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-bold font-mono">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                {order.status === "new" ? "Processing" : order.status}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index}>
              <div className="flex gap-4">
                {item.thumbnail && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{item.productName}</p>
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(item.variants).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Qty: {item.quantity} × {item.unitPrice.toLocaleString("fr-DZ")} DA
                  </p>
                </div>
                <div className="text-right font-medium">
                  {item.lineTotal.toLocaleString("fr-DZ")} DA
                </div>
              </div>
              {index < lineItems.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            {order.deliveryType === "Domicile" ? (
              <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
            ) : (
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {order.deliveryType === "Domicile" ? "Home Delivery" : "Stopdesk Pickup"}
              </p>
              <p className="font-medium">
                {order.customerWilaya}
                {order.customerCommune && `, ${order.customerCommune}`}
              </p>
              {order.customerAddress && (
                <p className="text-sm text-muted-foreground mt-1">{order.customerAddress}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{subtotal.toLocaleString("fr-DZ")} DA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Cost</span>
              <span className="font-medium">
                {order.deliveryCost.toLocaleString("fr-DZ")} DA
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{order.totalAmount.toLocaleString("fr-DZ")} DA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>What's next?</strong> Our team will contact you within 24 hours to confirm your
          order and delivery details. Please keep your phone available.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => router.push("/")} className="flex-1" size="lg">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
