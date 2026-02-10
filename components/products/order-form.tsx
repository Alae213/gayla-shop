"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { WILAYAS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const orderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerWilaya: z.string().min(1, "Wilaya is required"),
  customerCommune: z.string().min(1, "Commune is required"),
  customerAddress: z.string().min(5, "Address is required"),
  deliveryType: z.enum(["Domicile", "Stopdesk"]),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

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

export function OrderForm({ product }: OrderFormProps) {
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"Domicile" | "Stopdesk">("Domicile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");

  const createOrder = useMutation(api.orders.create);

  const deliveryCostData = useQuery(
    api.deliveryCosts.getByWilayaId,
    selectedWilaya ? { wilayaId: parseInt(selectedWilaya) } : "skip"
  );

  const deliveryCost =
    deliveryCostData && deliveryType === "Domicile"
      ? deliveryCostData.domicileCost
      : deliveryCostData && deliveryType === "Stopdesk"
      ? deliveryCostData.stopdeskCost
      : 0;

  const totalAmount = product.price + deliveryCost;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      deliveryType: "Domicile",
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);

      const wilaya = WILAYAS.find((w) => w.id.toString() === data.customerWilaya);

      const orderData = {
        productId: product._id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerWilaya: wilaya?.name || "",
        customerCommune: data.customerCommune,
        customerAddress: data.customerAddress,
        deliveryType: data.deliveryType,
        deliveryCost: deliveryCost,
        selectedVariant:
          data.selectedSize || data.selectedColor
            ? {
                size: data.selectedSize,
                color: data.selectedColor,
              }
            : undefined,
      };

      const result = await createOrder(orderData);

      setOrderNumber(result.orderNumber);
      setShowSuccessDialog(true);
      reset();
      setSelectedWilaya("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizes = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)))
    : [];
  const colors = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)))
    : [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order this Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Customer Information</h3>

              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  placeholder="Full Name"
                />
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  {...register("customerPhone")}
                  placeholder="0555123456"
                  type="tel"
                />
                {errors.customerPhone && (
                  <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerWilaya">Wilaya (Province)</Label>
                <Select
                  value={selectedWilaya}
                  onValueChange={(value) => {
                    setSelectedWilaya(value);
                    setValue("customerWilaya", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {WILAYAS.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerWilaya && (
                  <p className="text-sm text-destructive">{errors.customerWilaya.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerCommune">City/Commune</Label>
                <Input
                  id="customerCommune"
                  {...register("customerCommune")}
                  placeholder="City/Commune"
                />
                {errors.customerCommune && (
                  <p className="text-sm text-destructive">{errors.customerCommune.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Full Address</Label>
                <Textarea
                  id="customerAddress"
                  {...register("customerAddress")}
                  placeholder="Full Address"
                  rows={3}
                />
                {errors.customerAddress && (
                  <p className="text-sm text-destructive">{errors.customerAddress.message}</p>
                )}
              </div>
            </div>

            {/* Variants */}
            {(sizes.length > 0 || colors.length > 0) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Options</h3>

                {sizes.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="selectedSize">Size</Label>
                    <Select onValueChange={(value) => setValue("selectedSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size!}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {colors.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="selectedColor">Color</Label>
                    <Select onValueChange={(value) => setValue("selectedColor", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color!}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Type */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Delivery Type</h3>
              <Select
                value={deliveryType}
                onValueChange={(value: "Domicile" | "Stopdesk") => {
                  setDeliveryType(value);
                  setValue("deliveryType", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domicile">Home Delivery</SelectItem>
                  <SelectItem value="Stopdesk">Stopdesk Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Product Price:</span>
                <span className="font-semibold">
                  {formatPrice(product.price, "en-US")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Cost:</span>
                <span className="font-semibold">
                  {formatPrice(deliveryCost, "en-US")}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount:</span>
                <span>{formatPrice(totalAmount, "en-US")}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Order
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Created Successfully!</DialogTitle>
            <DialogDescription>
              Your order number: <strong>{orderNumber}</strong>
              <br />
              <br />
              You can track your order using this number.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
