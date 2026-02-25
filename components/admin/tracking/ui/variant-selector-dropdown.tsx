"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface VariantSelectorDropdownProps {
  productId: Id<"products">;
  currentVariant: Record<string, string>; // e.g., { size: "M", color: "Red" }
  onChange: (newVariant: Record<string, string>) => void;
  disabled?: boolean;
  className?: string;
}

export function VariantSelectorDropdown({
  productId,
  currentVariant,
  onChange,
  disabled = false,
  className,
}: VariantSelectorDropdownProps) {
  const product = useQuery(api.products.getById, { id: productId });

  if (!product) {
    return (
      <div className="text-[12px] text-[#AAAAAA] italic">Loading variants...</div>
    );
  }

  // If product has no variant groups, return null
  if (!product.variantGroups || product.variantGroups.length === 0) {
    return null;
  }

  const handleVariantChange = (groupName: string, value: string) => {
    const newVariant = { ...currentVariant, [groupName]: value };
    onChange(newVariant);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {product.variantGroups.map((group) => {
        const currentValue = currentVariant[group.name] ?? "";
        const enabledValues = group.values
          .filter((v) => v.enabled)
          .sort((a, b) => a.order - b.order);

        if (enabledValues.length === 0) {
          return (
            <div
              key={group.name}
              className="text-[12px] text-[#AAAAAA] italic"
            >
              No {group.name.toLowerCase()} available
            </div>
          );
        }

        return (
          <div key={group.name} className="flex flex-col gap-1">
            <label
              htmlFor={`variant-${group.name}-${productId}`}
              className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider"
            >
              {group.name}
            </label>
            <Select
              value={currentValue}
              onValueChange={(value) => handleVariantChange(group.name, value)}
              disabled={disabled}
            >
              <SelectTrigger
                id={`variant-${group.name}-${productId}`}
                className="h-8 text-[13px] w-[120px] bg-white border-[#ECECEC] focus:ring-[#AAAAAA]"
              >
                <SelectValue placeholder={`Select ${group.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {enabledValues.map((variant) => (
                  <SelectItem
                    key={variant.label}
                    value={variant.label}
                    className="text-[13px]"
                  >
                    {variant.label}
                  </SelectItem>
                ))}
                {/* Show disabled variants as non-selectable */}
                {group.values
                  .filter((v) => !v.enabled)
                  .map((variant) => (
                    <SelectItem
                      key={variant.label}
                      value={variant.label}
                      disabled
                      className="text-[13px] text-[#AAAAAA] line-through"
                    >
                      {variant.label} (Unavailable)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
