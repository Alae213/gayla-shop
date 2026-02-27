"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { api } from "@/convex/_generated/api";
import { WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/constants";
import { isValidAlgerianPhone } from "@/lib/utils/yalidin-api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export type DeliveryType = "Stopdesk" | "Domicile";

export interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  wilayaId: string;
  commune: string;
  address: string;
}

const DEFAULT_FORM: CheckoutForm = {
  customerName: "",
  customerPhone: "",
  deliveryType: "Stopdesk",
  wilayaId: "",
  commune: "",
  address: "",
};

export interface UseCheckoutReturn {
  // Form state
  form: CheckoutForm;
  setField: <K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) => void;
  setDeliveryType: (type: DeliveryType) => void;
  // Errors
  errors: Record<string, string>;
  // Derived data
  deliveryCost: number;
  totalAmount: number;
  availableCommunes: string[];
  isDeliveryCostLoading: boolean;
  // Cart
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  // Submission
  isSubmitting: boolean;
  submit: (e: React.FormEvent) => Promise<void>;
}

export function useCheckout(): UseCheckoutReturn {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // ── Form state ──────────────────────────────────────────────────
  const [form, setForm] = useState<CheckoutForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Convex ──────────────────────────────────────────────────────
  const createOrder = useMutation(api.orders.create);
  const deliveryCostData = useQuery(
    api.deliveryCosts.getByWilayaId,
    form.wilayaId ? { wilayaId: parseInt(form.wilayaId) } : "skip"
  );

  // ── Derived calculations ─────────────────────────────────────────
  const deliveryCost = deliveryCostData
    ? form.deliveryType === "Domicile"
      ? deliveryCostData.domicileCost
      : deliveryCostData.stopdeskCost
    : 0;

  const totalAmount = subtotal + deliveryCost;

  const availableCommunes = form.wilayaId
    ? COMMUNES_BY_WILAYA[parseInt(form.wilayaId)] || []
    : [];

  // Loading state: query was issued but result not yet returned
  const isDeliveryCostLoading = Boolean(form.wilayaId) && deliveryCostData === undefined;

  // ── Field setter helpers ─────────────────────────────────────────
  function setField<K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // When switching to Stopdesk, clear commune + address (no longer needed)
  function setDeliveryType(type: DeliveryType) {
    setForm((prev) => ({
      ...prev,
      deliveryType: type,
      commune: type === "Stopdesk" ? "" : prev.commune,
      address: type === "Stopdesk" ? "" : prev.address,
    }));
  }

  // ── Validation ───────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      newErrors.customerName = "Full name is required";
    }

    if (!isValidAlgerianPhone(form.customerPhone)) {
      newErrors.customerPhone = "Enter a valid Algerian phone number";
    }

    if (!form.wilayaId) {
      newErrors.wilaya = "Please select a wilaya";
    }

    if (form.deliveryType === "Domicile") {
      if (!form.commune) {
        newErrors.commune = "Please select a commune";
      }
      if (!form.address.trim() || form.address.trim().length < 5) {
        newErrors.address = "Please enter your full address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────
  async function submit(e: React.FormEvent): Promise<void> {
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
      const wilayaObj = WILAYAS.find((w) => w.id.toString() === form.wilayaId);

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

      const result = await createOrder({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.replace(/\s/g, ""),
        customerWilaya: wilayaObj?.name || "",
        customerCommune: form.commune || undefined,
        customerAddress: form.deliveryType === "Domicile" ? form.address.trim() : undefined,
        deliveryType: form.deliveryType,
        deliveryCost,
        lineItems,
      });

      toast.success("Order placed successfully!", {
        description: `Order number: ${result.orderNumber}`,
      });

      clearCart();
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

  return {
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
  };
}
