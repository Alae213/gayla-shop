import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, XCircle, AlertCircle, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Phase 1 - T1.5: StatusBadge Component
// A semantic status indicator with consistent styling and icons

export type StatusType = "pending" | "success" | "error" | "warning" | "info";

const statusConfig: Record<
  StatusType,
  {
    className: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultLabel: string;
  }
> = {
  pending: {
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
    defaultLabel: "Pending",
  },
  success: {
    className: "bg-success-100 text-success-200 border-success-200",
    icon: CheckCircle2,
    defaultLabel: "Success",
  },
  error: {
    className: "bg-error-100 text-error-200 border-error-200",
    icon: XCircle,
    defaultLabel: "Error",
  },
  warning: {
    className: "bg-warning-100 text-warning-200 border-warning-200",
    icon: AlertCircle,
    defaultLabel: "Warning",
  },
  info: {
    className: "bg-primary-50 text-brand-200 border-brand-200",
    icon: Info,
    defaultLabel: "Info",
  },
};

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 border font-medium",
  {
    variants: {
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusType;
  label?: string;
  icon?: boolean;
}

export function StatusBadge({
  status,
  label,
  icon = true,
  size = "md",
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge
      className={cn(
        statusBadgeVariants({ size }),
        config.className,
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {icon && (
        <IconComponent
          className={cn(
            "shrink-0",
            size === "sm" ? "h-3 w-3" : "h-4 w-4"
          )}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </Badge>
  );
}
