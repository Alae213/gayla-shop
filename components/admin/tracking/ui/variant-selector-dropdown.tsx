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
  currentVariant: Record<string, string>;
  onChange: (newVariant: Record<string, string>) => void;
  disabled?: boolean;
  className?: string;
}

// Wrapped in React.memo so it only re-renders when props actually change.
// Without memo, every parent re-render causes Radix Select to remount and
// fire onValueChange with the current value — triggering setState — loop.
export const VariantSelectorDropdown = React.memo(
  function VariantSelectorDropdown({
    productId,
    currentVariant,
    onChange,
    disabled = false,
    className,
  }: VariantSelectorDropdownProps) {
    const product = useQuery(api.products.getById, { id: productId });

    // Keep a stable ref to onChange so handleVariantChange never changes
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => { onChangeRef.current = onChange; });

    const handleVariantChange = React.useCallback(
      (groupName: string, value: string) => {
        // Guard: only call onChange when the value actually changed
        if (currentVariant[groupName] === value) return;
        const newVariant = { ...currentVariant, [groupName]: value };
        onChangeRef.current(newVariant);
      },
      // currentVariant is stable because MemoizedLineItemRow only passes a
      // new reference when item.variants actually changed (equality-guarded
      // in handleVariantChange in the editor).
      [currentVariant]
    );

    if (!product) {
      return (
        <div className="text-[12px] text-[#AAAAAA] italic">Loading variants...</div>
      );
    }

    if (!product.variantGroups || product.variantGroups.length === 0) {
      return null;
    }

    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {product.variantGroups.map((group) => {
          const currentValue = currentVariant[group.name] ?? "";
          const enabledValues = group.values
            .filter((v) => v.enabled)
            .sort((a, b) => a.order - b.order);

          if (enabledValues.length === 0) {
            return (
              <div key={group.name} className="text-[12px] text-[#AAAAAA] italic">
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
);
