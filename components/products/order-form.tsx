"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { formatPrice } from "@/lib/utils";
import { WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/constants";
import { Loader2, Home, Building2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderFormProps {
  product: {
    _id: Id<"products">;
    title: string;
    price: number;
    variants?: Array<{
      size?: string;
      color?: string;
    }>;
  };
}

type DeliveryType = "Stopdesk" | "Domicile";

function phoneValid(v: string) {
  return /^0[5-7][0-9]{8}$/.test(v.replace(/\s/g, ""));
}

export function OrderForm({ product }: OrderFormProps) {
  // ── Form state ────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("Stopdesk");
  const [wilayaId, setWilayaId] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // ── UI state ──────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // ── Convex ────────────────────────────────────────────────────
  const createOrder = useMutation(api.orders.create);
  const deliveryCostData = useQuery(
    api.deliveryCosts.getByWilayaId,
    wilayaId ? { wilayaId: parseInt(wilayaId) } : "skip"
  );

  const deliveryCost =
    deliveryCostData
      ? deliveryType === "Domicile"
        ? deliveryCostData.domicileCost
        : deliveryCostData.stopdeskCost
      : 0;

  const totalAmount = product.price + deliveryCost;

  // ── Variants ──────────────────────────────────────────────────
  const sizes = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)))
    : [];
  const colors = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)))
    : [];

  // ── Communes filtered by wilaya ───────────────────────────────
  const availableCommunes = wilayaId
    ? (COMMUNES_BY_WILAYA[parseInt(wilayaId)] || [])
    : [];

  // ── Validation ────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2)
      newErrors.customerName = "Full name is required";

    if (!phoneValid(customerPhone))
      newErrors.customerPhone = "Enter a valid Algerian phone number (e.g. 0555 123 456)";

    if (!wilayaId)
      newErrors.wilaya = "Please select a wilaya";

    if (deliveryType === "Domicile") {
      if (!commune)
        newErrors.commune = "Please select a baladia";
      if (!address.trim() || address.trim().length < 5)
        newErrors.address = "Please enter your full address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const wilayaObj = WILAYAS.find((w) => w.id.toString() === wilayaId);

      const result = await createOrder({
        productId: product._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\s/g, ""),
        customerWilaya: wilayaObj?.name || "",
        customerCommune: commune,
        customerAddress: deliveryType === "Domicile" ? address.trim() : "",
        deliveryType,
        deliveryCost,
        selectedVariant:
          selectedSize || selectedColor
            ? { size: selectedSize || undefined, color: selectedColor || undefined }
            : undefined,
      });

      setOrderNumber(result.orderNumber);
      setShowSuccess(true);

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryType("Stopdesk");
      setWilayaId("");
      setCommune("");
      setAddress("");
      setSelectedSize("");
      setSelectedColor("");
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create order. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order this Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 1. Full Name */}
            <div className="space-y-1">
              <Label htmlFor="customerName">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ahmed Benali"
              />
              {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
            </div>

            {/* 2. Phone */}
            <div className="space-y-1">
              <Label htmlFor="customerPhone">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0555 123 456"
              />
              {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone}</p>}
            </div>

            {/* 3. Delivery Type */}
            <div className="space-y-1">
              <Label>Delivery Type <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => { setDeliveryType("Stopdesk"); setCommune(""); setAddress(""); }}
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
                  onClick={() => { setDeliveryType("Domicile"); }}
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

            {/* 4. Wilaya */}
            <div className="space-y-1">
              <Label>Wilaya <span className="text-red-500">*</span></Label>
              <Select
                value={wilayaId}
                onValueChange={(v) => { setWilayaId(v); setCommune(""); }}
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
              {errors.wilaya && <p className="text-sm text-destructive">{errors.wilaya}</p>}
            </div>

            {/* 5. Baladia (Home only) */}
            {deliveryType === "Domicile" && (
              <div className="space-y-1">
                <Label>Baladia <span className="text-red-500">*</span></Label>
                <Select
                  value={commune}
                  onValueChange={setCommune}
                  disabled={!wilayaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={wilayaId ? "Select a baladia..." : "Select wilaya first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {availableCommunes.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.commune && <p className="text-sm text-destructive">{errors.commune}</p>}
              </div>
            )}

            {/* 6. Full Address (Home only) */}
            {deliveryType === "Domicile" && (
              <div className="space-y-1">
                <Label htmlFor="address">Full Address <span className="text-red-500">*</span></Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, building, apartment..."
                  rows={3}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            )}

            {/* Variants */}
            {(sizes.length > 0 || colors.length > 0) && (
              <div className="space-y-4">
                <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Options</p>
                {sizes.length > 0 && (
                  <div className="space-y-1">
                    <Label>Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {sizes.map((s) => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {colors.length > 0 && (
                  <div className="space-y-1">
                    <Label>Color</Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                      <SelectContent>
                        {colors.map((c) => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            {wilayaId && (
              <div className="space-y-2 p-4 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Product Price:</span>
                  <span className="font-semibold">{formatPrice(product.price, "en-US")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Cost:</span>
                  <span className="font-semibold">
                    {deliveryCostData === undefined
                      ? "..."
                      : formatPrice(deliveryCost, "en-US")}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatPrice(totalAmount, "en-US")}</span>
                </div>
              </div>
            )}

            {/* Global submit error */}
            {errors.submit && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{errors.submit}</p>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</>
              ) : (
                "Confirm Order"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Order Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your order number is: <strong className="text-foreground">{orderNumber}</strong>
              <br /><br />
              You can track your order using this number.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccess(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
