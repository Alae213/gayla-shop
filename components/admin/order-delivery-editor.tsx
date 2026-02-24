"use client";

/**
 * OrderDeliveryEditor - Admin component for editing order delivery destination
 * Allows changing wilaya/commune with automatic delivery cost recalculation
 */

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, MapPin, DollarSign, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { WILAYAS } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderDeliveryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentWilaya: string;
  currentCommune: string;
  currentDeliveryCost: number;
  deliveryType: "Domicile" | "Stopdesk";
  onSave: (wilaya: string, commune: string, newCost: number) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderDeliveryEditor({
  isOpen,
  onClose,
  currentWilaya,
  currentCommune,
  currentDeliveryCost,
  deliveryType,
  onSave,
}: OrderDeliveryEditorProps) {
  const [selectedWilaya, setSelectedWilaya] = useState(currentWilaya);
  const [selectedCommune, setSelectedCommune] = useState(currentCommune);
  const [isSaving, setIsSaving] = useState(false);

  const allDeliveryCosts = useQuery(api.deliveryCosts.list);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedWilaya(currentWilaya);
      setSelectedCommune(currentCommune);
    }
  }, [isOpen, currentWilaya, currentCommune]);

  // ─── Calculate new delivery cost ─────────────────────────────────────────

  const selectedWilayaData = WILAYAS.find((w) => w.name === selectedWilaya);
  const deliveryCostData = allDeliveryCosts?.find(
    (dc) => dc.wilayaId === selectedWilayaData?.id
  );

  const newDeliveryCost = deliveryCostData
    ? deliveryType === "Stopdesk"
      ? deliveryCostData.stopdeskCost
      : deliveryCostData.domicileCost
    : 0;

  const costChanged = newDeliveryCost !== currentDeliveryCost;
  const destinationChanged =
    selectedWilaya !== currentWilaya || selectedCommune !== currentCommune;
  const hasChanges = destinationChanged;

  // ─── Get communes for selected wilaya ────────────────────────────────────

  const communes = selectedWilayaData?.communes || [];

  // Auto-select first commune when wilaya changes
  useEffect(() => {
    if (communes.length > 0 && !communes.includes(selectedCommune)) {
      setSelectedCommune(communes[0]);
    }
  }, [selectedWilaya, communes, selectedCommune]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    if (!selectedWilaya || !selectedCommune) {
      toast.error("Please select both wilaya and commune");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(selectedWilaya, selectedCommune, newDeliveryCost);
      toast.success(
        costChanged
          ? `Delivery updated! Cost changed: ${currentDeliveryCost} DA → ${newDeliveryCost} DA`
          : "Delivery destination updated!"
      );
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update delivery");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedWilaya(currentWilaya);
    setSelectedCommune(currentCommune);
    onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            Edit Delivery Destination
          </DialogTitle>
          <DialogDescription>
            Change the delivery destination for this order. The delivery cost will be
            automatically recalculated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wilaya Selector */}
          <div>
            <Label htmlFor="wilaya" className="text-sm mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
              Wilaya
            </Label>
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger id="wilaya">
                <SelectValue placeholder="Select wilaya" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {WILAYAS.map((wilaya) => (
                  <SelectItem key={wilaya.id} value={wilaya.name}>
                    {wilaya.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commune Selector */}
          <div>
            <Label htmlFor="commune" className="text-sm mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
              Commune
            </Label>
            <Select
              value={selectedCommune}
              onValueChange={setSelectedCommune}
              disabled={!selectedWilaya || communes.length === 0}
            >
              <SelectTrigger id="commune">
                <SelectValue
                  placeholder={
                    !selectedWilaya
                      ? "Select wilaya first"
                      : communes.length === 0
                      ? "No communes available"
                      : "Select commune"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {communes.map((commune) => (
                  <SelectItem key={commune} value={commune}>
                    {commune}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Preview */}
          {hasChanges && (
            <div
              className={`rounded-lg p-4 border-2 ${
                costChanged
                  ? "bg-amber-50 border-amber-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <DollarSign
                  className={`h-4 w-4 mt-0.5 ${
                    costChanged ? "text-amber-600" : "text-blue-600"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      costChanged ? "text-amber-900" : "text-blue-900"
                    }`}
                  >
                    Delivery Cost Preview
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`font-medium ${
                        costChanged ? "text-amber-700" : "text-blue-700"
                      }`}
                    >
                      {currentDeliveryCost.toLocaleString()} DA
                    </span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 ${
                        costChanged ? "text-amber-500" : "text-blue-500"
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        costChanged ? "text-amber-900" : "text-blue-900"
                      }`}
                    >
                      {newDeliveryCost.toLocaleString()} DA
                    </span>
                    {costChanged && (
                      <span
                        className={`text-xs ml-1 ${
                          newDeliveryCost > currentDeliveryCost
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ({newDeliveryCost > currentDeliveryCost ? "+" : ""}
                        {newDeliveryCost - currentDeliveryCost} DA)
                      </span>
                    )}
                  </div>
                  {!costChanged && (
                    <p className="text-xs text-blue-600 mt-1">
                      Delivery cost remains the same
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Delivery Cost Warning */}
          {hasChanges && newDeliveryCost === 0 && (
            <div className="flex items-start gap-2 bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  No delivery cost configured
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  The selected wilaya does not have a delivery cost configured. Please
                  set up delivery costs in the admin panel before changing the
                  destination.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || newDeliveryCost === 0}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent mr-2" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
