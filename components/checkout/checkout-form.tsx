"use client";

import { useCheckout } from "@/hooks/use-checkout";
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
import { WILAYAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Loader2, Home, Building2 } from "lucide-react";

export function CheckoutForm() {
  const {
    form,
    setField,
    setDeliveryType,
    errors,
    deliveryCost,
    totalAmount,
    availableCommunes,
    isDeliveryCostLoading,
    items,
    subtotal,
    isSubmitting,
    submit,
  } = useCheckout();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">

          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="customerName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(e) => setField("customerName", e.target.value)}
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
              value={form.customerPhone}
              onChange={(e) => setField("customerPhone", e.target.value)}
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
                onClick={() => setDeliveryType("Stopdesk")}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors",
                  form.deliveryType === "Stopdesk"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-primary/40"
                )}
              >
                <Building2 className="h-4 w-4" />
                Stopdesk
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("Domicile")}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors",
                  form.deliveryType === "Domicile"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-primary/40"
                )}
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
              value={form.wilayaId}
              onValueChange={(v) => {
                setField("wilayaId", v);
                setField("commune", "");
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
          {form.deliveryType === "Domicile" && (
            <div className="space-y-1">
              <Label>
                Commune <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.commune}
                onValueChange={(v) => setField("commune", v)}
                disabled={!form.wilayaId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      form.wilayaId ? "Select a commune..." : "Select wilaya first"
                    }
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
          {form.deliveryType === "Domicile" && (
            <div className="space-y-1">
              <Label htmlFor="address">
                Full Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Street, building, apartment..."
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>
          )}

          <Separator className="my-6" />

          {/* Order Summary */}
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
                  {isDeliveryCostLoading
                    ? "..."
                    : form.wilayaId
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !form.wilayaId || items.length === 0}
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
