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
import { Loader2 } from "lucide-react";

interface VariantSelectorDropdownProps {
  productId: Id<"products">;
  currentVariant: Record<string, string>;
  onChange: (newVariant: Record<string, string>) => void;
  disabled?: boolean;
  className?: string;
}

// Inner component — defined as a plain named function so Webpack always
// resolves it as a callable. React.memo is applied separately below.
// (Combining `export const X = React.memo(function X(){})` in a single
// statement confuses Webpack's module graph when the export shape changed
// from a previous `export function`, causing "Component is not a function".)
function VariantSelectorDropdownInner({
  productId,
  currentVariant,
  onChange,
  disabled = false,
  className,
}: VariantSelectorDropdownProps) {
  const product = useQuery(api.products.getById, { id: productId });

  // Keep onChange in a ref so handleVariantChange stays stable without
  // needing onChange in its dependency array.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const handleVariantChange = React.useCallback(
    (groupName: string, value: string) => {
      // Guard: skip if value didn't actually change — prevents Radix Select
      // from triggering setState on mount and causing an infinite loop.
      if (currentVariant[groupName] === value) return;
      const newVariant = { ...currentVariant, [groupName]: value };
      onChangeRef.current(newVariant);
    },
    [currentVariant],
  );

  // Loading state
  if (product === undefined) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-[#AAAAAA] italic">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Loading variants...</span>
      </div>
    );
  }

  // Product not found or error
  if (product === null) {
    return (
      <div className="text-[12px] text-rose-600 italic">
        Product not found
      </div>
    );
  }

  // No variant groups - hide completely
  if (!product.variantGroups || product.variantGroups.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2 md:gap-3", className)}>
      {product.variantGroups.map((group) => {
        const currentValue = currentVariant[group.name] ?? "";
        const enabledValues = group.values
          .filter((v) => v.enabled)
          .sort((a, b) => a.order - b.order);

        // If no enabled values, show warning message
        if (enabledValues.length === 0) {
          return (
            <div key={group.name} className="text-[12px] text-amber-600 italic bg-amber-50 px-2 py-1 rounded-md">
              No {group.name.toLowerCase()} available
            </div>
          );
        }

        return (
          <div key={group.name} className="flex flex-col gap-1 flex-1 md:flex-initial">
            <label
              htmlFor={`variant-${group.name}-${productId}`}
              className="text-[10px] md:text-[11px] font-semibold text-[#555555] uppercase tracking-wider"
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
                className="h-8 md:h-9 text-[13px] w-full md:w-[120px] bg-white border-[#ECECEC] focus:ring-[#AAAAAA]"
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

// Apply React.memo separately so the named export is always a plain function
// reference at the module level — never a MemoExoticComponent object literal.
export const VariantSelectorDropdown = React.memo(VariantSelectorDropdownInner);
VariantSelectorDropdown.displayName = "VariantSelectorDropdown";
