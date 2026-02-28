"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface VariantSelectorProps {
  productId: Id<"products">;
  currentVariant: Record<string, string>;
  onChange: (newVariant: Record<string, string>) => void;
  disabled?: boolean;
  className?: string;
}

function VariantSelectorInner({ productId, currentVariant, onChange, disabled = false, className }: VariantSelectorProps) {
  const product = useQuery(api.products.getById, { id: productId });
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => { onChangeRef.current = onChange; });

  const handleVariantChange = React.useCallback(
    (groupName: string, value: string) => {
      if (currentVariant[groupName] === value) return;
      onChangeRef.current({ ...currentVariant, [groupName]: value });
    },
    [currentVariant]
  );

  if (product === undefined) return <div className="flex items-center gap-2 text-xs text-muted-foreground italic"><Loader2 className="w-3 h-3 animate-spin" /><span>Loading variants...</span></div>;
  if (product === null) return <div className="text-xs text-destructive italic">Product not found</div>;
  if (!product.variantGroups || product.variantGroups.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 md:gap-3", className)}>
      {product.variantGroups.map((group) => {
        const currentValue = currentVariant[group.name] ?? "";
        const enabledValues = group.values.filter((v) => v.enabled).sort((a, b) => a.order - b.order);
        if (enabledValues.length === 0) return <div key={group.name} className="text-xs text-warning italic bg-warning/10 px-2 py-1 rounded-md">No {group.name.toLowerCase()} available</div>;
        return (
          <div key={group.name} className="flex flex-col gap-1 flex-1 md:flex-initial">
            <label htmlFor={`variant-${group.name}-${productId}`} className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{group.name}</label>
            <Select value={currentValue} onValueChange={(value) => handleVariantChange(group.name, value)} disabled={disabled}>
              <SelectTrigger id={`variant-${group.name}-${productId}`} className="h-8 md:h-9 text-sm w-full md:w-[120px] bg-background border-border focus:ring-ring">
                <SelectValue placeholder={`Select ${group.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {enabledValues.map((variant) => <SelectItem key={variant.label} value={variant.label} className="text-sm">{variant.label}</SelectItem>)}
                {group.values.filter((v) => !v.enabled).map((variant) => <SelectItem key={variant.label} value={variant.label} disabled className="text-sm text-muted-foreground line-through">{variant.label} (Unavailable)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}

export const VariantSelector = React.memo(VariantSelectorInner);
VariantSelector.displayName = "VariantSelector";