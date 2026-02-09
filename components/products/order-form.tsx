"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { useTranslations } from "next-intl";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { WILAYAS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

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
    titleAR: string;
    titleFR: string;
    titleEN: string;
    price: number;
    variants?: Array<{
      size?: string;
      color?: string;
    }>;
  };
}

export function OrderForm({ product }: OrderFormProps) {
  const t = useTranslations("order");
  const params = useParams();
  const locale = params.locale as string;

  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"Domicile" | "Stopdesk">("Domicile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = useMutation(api.orders.create);

  // Get delivery cost for selected wilaya
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
    watch,
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
        deliveryCost: deliveryCost, // ✅ FIXED: Added missing property
        selectedVariant:
          data.selectedSize || data.selectedColor
            ? {
                size: data.selectedSize,
                color: data.selectedColor,
              }
            : undefined,
        languagePreference: locale as "ar" | "fr" | "en",
      };

      const result = await createOrder(orderData);

      toast({
        title: t("success"),
        description: `${t("orderNumber")}: ${result.orderNumber}`,
      });

      // Reset form or redirect
      window.scrollTo(0, 0);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique sizes and colors from variants
  const sizes = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)))
    : [];
  const colors = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("customerInfo")}</h3>

            <div className="space-y-2">
              <Label htmlFor="customerName">{t("name")}</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder={t("name")}
              />
              {errors.customerName && (
                <p className="text-sm text-destructive">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">{t("phone")}</Label>
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
              <Label htmlFor="customerWilaya">{t("wilaya")}</Label>
              <Select
                value={selectedWilaya}
                onValueChange={(value) => {
                  setSelectedWilaya(value);
                  setValue("customerWilaya", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("wilaya")} />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map((wilaya) => (
                    <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                      {locale === "ar" ? wilaya.nameAr : wilaya.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerWilaya && (
                <p className="text-sm text-destructive">{errors.customerWilaya.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerCommune">{t("commune")}</Label>
              <Input
                id="customerCommune"
                {...register("customerCommune")}
                placeholder={t("commune")}
              />
              {errors.customerCommune && (
                <p className="text-sm text-destructive">{errors.customerCommune.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">{t("address")}</Label>
              <Textarea
                id="customerAddress"
                {...register("customerAddress")}
                placeholder={t("address")}
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
              <h3 className="font-semibold text-lg">{t("variants")}</h3>

              {sizes.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="selectedSize">{t("size")}</Label>
                  <Select onValueChange={(value) => setValue("selectedSize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("size")} />
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
                  <Label htmlFor="selectedColor">{t("color")}</Label>
                  <Select onValueChange={(value) => setValue("selectedColor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("color")} />
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
            <h3 className="font-semibold text-lg">{t("deliveryType")}</h3>
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
                <SelectItem value="Domicile">{t("domicile")}</SelectItem>
                <SelectItem value="Stopdesk">{t("stopdesk")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Summary */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span>{t("price")}:</span>
              <span className="font-semibold">
                {formatPrice(product.price, locale === "ar" ? "ar-DZ" : "fr-DZ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("deliveryCost")}:</span>
              <span className="font-semibold">
                {formatPrice(deliveryCost, locale === "ar" ? "ar-DZ" : "fr-DZ")}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>{t("totalAmount")}:</span>
              <span>{formatPrice(totalAmount, locale === "ar" ? "ar-DZ" : "fr-DZ")}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
