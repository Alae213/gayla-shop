"use client";

/**
 * CheckoutForm - Order placement with delivery integration
 * Reuses COD form logic with cart support
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/constants";
import { isValidAlgerianPhone } from "@/lib/utils/yalidin-api";
import { Loader2, Home, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

type DeliveryType = "Stopdesk" | "Domicile";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("Stopdesk");
  const [wilayaId, setWilayaId] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const createOrder = useMutation(api.orders.create);
  const deliveryCostData = useQuery(
    api.deliveryCosts.getByWilayaId,
    wilayaId ? { wilayaId: parseInt(wilayaId) } : "skip"
  );

  // Calculate costs
  const deliveryCost = deliveryCostData
    ? deliveryType === "Domicile"
      ? deliveryCostData.domicileCost
      : deliveryCostData.stopdeskCost
    : 0;

  const totalAmount = subtotal + deliveryCost;

  // Available communes for selected wilaya
  const availableCommunes = wilayaId
    ? COMMUNES_BY_WILAYA[parseInt(wilayaId)] || []
    : [];

  // Validation
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.customerName = "Full name is required";
    }

    if (!isValidAlgerianPhone(customerPhone)) {
      newErrors.customerPhone = "Enter a valid Algerian phone number";
    }

    if (!wilayaId) {
      newErrors.wilaya = "Please select a wilaya";
    }

    if (deliveryType === "Domicile") {
      if (!commune) {
        newErrors.commune = "Please select a commune";
      }
      if (!address.trim() || address.trim().length < 5) {
        newErrors.address = "Please enter your full address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const wilayaObj = WILAYAS.find((w) => w.id.toString() === wilayaId);

      // Convert cart items to lineItems format
      const lineItems = items.map((item) => ({
        productId: item.productId as Id<"products">,
        productName: item.name,
        productSlug: item.slug,
        quantity: item.quantity,
        unitPrice: item.price,
        variants: Object.keys(item.variants).length > 0 ? item.variants : undefined,
        lineTotal: item.price * item.quantity,
        thumbnail: item.thumbnail,
      }));

      // Create order with multiple line items
      const result = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\s/g, ""),
        customerWilaya: wilayaObj?.name || "",
        customerCommune: commune || undefined,
        customerAddress: deliveryType === "Domicile" ? address.trim() : undefined,
        deliveryType,
        deliveryCost,
        lineItems, // Send all cart items
      });

      toast.success("Order placed successfully!", {
        description: `Order number: ${result.orderNumber}`,
      });

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      router.push(`/order-confirmation/${result.orderId}`);
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to place order", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="customerName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ahmed Benali"
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="customerPhone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0555 123 456"
            />
            {errors.customerPhone && (
              <p className="text-sm text-destructive">{errors.customerPhone}</p>
            )}
          </div>

          {/* Delivery Type Toggle */}
          <div className="space-y-1">
            <Label>
              Delivery Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setDeliveryType("Stopdesk");
                  setCommune("");
                  setAddress("");
                }}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  deliveryType === "Stopdesk"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Stopdesk
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("Domicile")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  deliveryType === "Domicile"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <Home className="h-4 w-4" />
                Home Delivery
              </button>
            </div>
          </div>

          {/* Wilaya */}
          <div className="space-y-1">
            <Label>
              Wilaya <span className="text-destructive">*</span>
            </Label>
            <Select
              value={wilayaId}
              onValueChange={(v) => {
                setWilayaId(v);
                setCommune("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a wilaya..." />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {WILAYAS.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.id.toString().padStart(2, "0")} - {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.wilaya && (
              <p className="text-sm text-destructive">{errors.wilaya}</p>
            )}
          </div>

          {/* Commune (Domicile only) */}
          {deliveryType === "Domicile" && (
            <div className="space-y-1">
              <Label>
                Commune <span className="text-destructive">*</span>
              </Label>
              <Select
                value={commune}
                onValueChange={setCommune}
                disabled={!wilayaId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={wilayaId ? "Select a commune..." : "Select wilaya first"}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {availableCommunes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.commune && (
                <p className="text-sm text-destructive">{errors.commune}</p>
              )}
            </div>
          )}

          {/* Address (Domicile only) */}
          {deliveryType === "Domicile" && (
            <div className="space-y-1">
              <Label htmlFor="address">
                Full Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, building, apartment..."
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>
          )}

          <Separator className="my-6" />

          {/* Order Summary - Now before button */}
          <div className="space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
                <span className="font-medium">
                  {subtotal.toLocaleString("fr-DZ")} DA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Cost</span>
                <span className="font-medium">
                  {wilayaId && deliveryCostData !== undefined
                    ? `${deliveryCost.toLocaleString("fr-DZ")} DA`
                    : "Select wilaya"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">
                  {totalAmount.toLocaleString("fr-DZ")} DA
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button - Moved to bottom */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !wilayaId || items.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Confirm Order (${totalAmount.toLocaleString("fr-DZ")} DA)`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By placing your order, you agree to our terms and conditions
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
