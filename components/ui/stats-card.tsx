import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Phase 2 - T2.6: StatsCard Component
// Dashboard stats card with value, icon, and trend indicators

const statsCardVariants = cva("", {
  variants: {
    variant: {
      default: "bg-card",
      accent: "bg-primary-50 border-brand-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const trendVariants = cva("inline-flex items-center gap-1 text-sm font-medium", {
  variants: {
    trend: {
      up: "text-success-200",
      down: "text-error-200",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
});

export interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    type: "up" | "down" | "neutral";
    value: string;
  };
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
  ...props
}: StatsCardProps) {
  const TrendIcon = trend?.type === "up" 
    ? TrendingUp 
    : trend?.type === "down" 
    ? TrendingDown 
    : Minus;

  return (
    <Card
      className={cn(statsCardVariants({ variant }), className)}
      role="article"
      aria-label={`${label}: ${value}`}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          {label}
        </h3>
        {Icon && (
          <Icon
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">
            {value}
          </p>

          {trend && (
            <div className={trendVariants({ trend: trend.type })}>
              <TrendIcon className="h-4 w-4" aria-hidden="true" />
              <span aria-label={`Trend ${trend.type}: ${trend.value}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
