"use client";

/**
 * OrderDeliveryEditor - Admin component for editing order delivery destination
 * Allows changing wilaya, commune, delivery type with automatic cost recalculation
 */

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Truck, DollarSign, Edit3, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderDeliveryEditorProps {
  currentWilaya: string;
  currentCommune: string;
  currentDeliveryType: "Domicile" | "Stopdesk";
  currentDeliveryCost: number;
  onSave: (updates: {
    wilaya: string;
    commune: string;
    deliveryType: "Domicile" | "Stopdesk";
    deliveryCost: number;
  }) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderDeliveryEditor({
  currentWilaya,
  currentCommune,
  currentDeliveryType,
  currentDeliveryCost,
  onSave,
}: OrderDeliveryEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedWilaya, setSelectedWilaya] = useState(currentWilaya);
  const [selectedCommune, setSelectedCommune] = useState(currentCommune);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<"Domicile" | "Stopdesk">(currentDeliveryType);

  // Find wilaya ID for delivery cost lookup
  const wilayaObj = WILAYAS.find((w) => w.name === selectedWilaya);
  const wilayaId = wilayaObj?.id;

  // Get available communes for selected wilaya
  const availableCommunes = wilayaId ? COMMUNES_BY_WILAYA[wilayaId] || [] : [];

  // Fetch delivery cost from Convex for selected destination
  const deliveryCosts = useQuery(
    api.deliveryCosts.list,
    isEditing && wilayaId ? {} : "skip"
  );

  // Calculate new delivery cost based on selection
  const newDeliveryCost = (() => {
    if (!deliveryCosts || !wilayaId) return currentDeliveryCost;

    const costEntry = deliveryCosts.find((c) => c.wilayaId === wilayaId);
    if (!costEntry) return currentDeliveryCost;

    return selectedDeliveryType === "Stopdesk"
      ? costEntry.stopdeskCost
      : costEntry.domicileCost;
  })();

  const hasChanges =
    selectedWilaya !== currentWilaya ||
    selectedCommune !== currentCommune ||
    selectedDeliveryType !== currentDeliveryType;

  const costChanged = newDeliveryCost !== currentDeliveryCost;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleWilayaChange = (wilayaName: string) => {
    setSelectedWilaya(wilayaName);
    // Reset commune when wilaya changes
    const newWilayaId = WILAYAS.find((w) => w.name === wilayaName)?.id;
    const newCommunes = newWilayaId ? COMMUNES_BY_WILAYA[newWilayaId] || [] : [];
    if (newCommunes.length > 0) {
      setSelectedCommune(newCommunes[0]);
    } else {
      setSelectedCommune("");
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    if (!selectedWilaya || !selectedCommune) {
      toast.error("Please select both wilaya and commune");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        wilaya: selectedWilaya,
        commune: selectedCommune,
        deliveryType: selectedDeliveryType,
        deliveryCost: newDeliveryCost,
      });
      toast.success("Delivery destination updated!");
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update delivery destination");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedWilaya(currentWilaya);
    setSelectedCommune(currentCommune);
    setSelectedDeliveryType(currentDeliveryType);
    setIsEditing(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-indigo-600" />
          Delivery
        </h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-1.5"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200 space-y-4">
          {/* Delivery Type Toggle */}
          <div>
            <Label className="text-xs text-gray-700 mb-2 block">
              Delivery Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedDeliveryType("Domicile")}
                className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedDeliveryType === "Domicile"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                }`}
              >
                🏠 Domicile
              </button>
              <button
                onClick={() => setSelectedDeliveryType("Stopdesk")}
                className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedDeliveryType === "Stopdesk"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                }`}
              >
                📦 Stopdesk
              </button>
            </div>
          </div>

          {/* Wilaya Selector */}
          <div>
            <Label className="text-xs text-gray-700 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Wilaya
            </Label>
            <Select value={selectedWilaya} onValueChange={handleWilayaChange}>
              <SelectTrigger className="bg-white">
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
            <Label className="text-xs text-gray-700 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Commune
            </Label>
            <Select
              value={selectedCommune}
              onValueChange={setSelectedCommune}
              disabled={availableCommunes.length === 0}
            >
              <SelectTrigger className="bg-white">
                <SelectValue
                  placeholder={
                    availableCommunes.length === 0
                      ? "Select wilaya first"
                      : "Select commune"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availableCommunes.map((commune) => (
                  <SelectItem key={commune} value={commune}>
                    {commune}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Preview */}
          {hasChanges && (
            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <DollarSign className="h-4 w-4 text-indigo-600" />
                <span className="font-medium">Delivery Cost</span>
              </div>
              {costChanged ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Current:</span>
                    <span className="font-medium text-gray-700 line-through">
                      {currentDeliveryCost.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">New:</span>
                    <span className="font-bold text-indigo-600 text-base">
                      {newDeliveryCost.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                    <span className="text-xs font-medium text-gray-600">
                      Difference:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        newDeliveryCost > currentDeliveryCost
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {newDeliveryCost > currentDeliveryCost ? "+" : ""}
                      {(newDeliveryCost - currentDeliveryCost).toLocaleString()}{" "}
                      DA
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Cost unchanged: {newDeliveryCost.toLocaleString()} DA</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Read-only display
        <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium text-gray-900 text-sm mt-0.5">
                {currentWilaya}, {currentCommune}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Type</p>
              <Badge variant="outline" className="mt-1">
                {currentDeliveryType === "Domicile" ? "🏠 Domicile" : "📦 Stopdesk"}
              </Badge>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Cost</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {currentDeliveryCost.toLocaleString()} DA
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
