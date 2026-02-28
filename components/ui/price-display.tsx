import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Phase 3 - T3.3: PriceDisplay Component
// Consistent price formatting with discount badges

const priceDisplayVariants = cva(
  "flex items-baseline gap-2",
  {
    variants: {
      variant: {
        default: "text-foreground",
        large: "text-foreground",
        compact: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const priceVariants = cva("font-bold", {
  variants: {
    variant: {
      default: "text-lg",
      large: "text-2xl md:text-3xl",
      compact: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const compareAtVariants = cva("line-through text-muted-foreground", {
  variants: {
    variant: {
      default: "text-sm",
      large: "text-lg",
      compact: "text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface PriceDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof priceDisplayVariants> {
  amount: number;
  currency?: string;
  locale?: string;
  compareAt?: number;
  showDiscount?: boolean;
}

export function PriceDisplay({
  amount,
  currency = "DZD",
  locale = "fr-DZ",
  compareAt,
  showDiscount = true,
  variant = "default",
  className,
  ...props
}: PriceDisplayProps) {
  // Format price using Intl.NumberFormat
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate discount percentage
  const discountPercent = React.useMemo(() => {
    if (!compareAt || compareAt <= amount) return null;
    return Math.round(((compareAt - amount) / compareAt) * 100);
  }, [amount, compareAt]);

  const hasDiscount = compareAt && compareAt > amount;

  return (
    <div
      className={cn(priceDisplayVariants({ variant }), className)}
      {...props}
    >
      {/* Current Price */}
      <span
        className={cn(
          priceVariants({ variant }),
          hasDiscount && "text-error-200"
        )}
        aria-label={`Current price: ${formatPrice(amount)}`}
      >
        {formatPrice(amount)}
      </span>

      {/* Original Price (if discounted) */}
      {hasDiscount && (
        <span
          className={compareAtVariants({ variant })}
          aria-label={`Original price: ${formatPrice(compareAt)}`}
        >
          {formatPrice(compareAt)}
        </span>
      )}

      {/* Discount Badge */}
      {hasDiscount && showDiscount && discountPercent && (
        <Badge
          variant="destructive"
          className={cn(
            "ml-1",
            variant === "large" && "text-sm px-2 py-1",
            variant === "compact" && "text-xs px-1.5 py-0.5"
          )}
        >
          -{discountPercent}%
        </Badge>
      )}
    </div>
  );
}
