import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Phase 1 - T1.6: EmptyState Component
// A flexible empty state component for consistent UX across the app

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      size: {
        sm: "py-8 px-4",
        md: "py-12 px-6",
        lg: "py-16 px-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const iconVariants = cva("text-muted-foreground mb-4", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-12 w-12",
      lg: "h-16 w-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const titleVariants = cva("font-semibold text-foreground", {
  variants: {
    size: {
      sm: "text-base mb-1",
      md: "text-xl mb-2",
      lg: "text-2xl mb-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const descriptionVariants = cva("text-muted-foreground", {
  variants: {
    size: {
      sm: "text-sm mb-4 max-w-xs",
      md: "text-base mb-6 max-w-md",
      lg: "text-lg mb-8 max-w-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  // Determine heading level based on size (h2 for lg, h3 otherwise)
  const HeadingTag = size === "lg" ? "h2" : "h3";

  return (
    <div
      className={cn(emptyStateVariants({ size }), className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      {Icon && (
        <Icon
          className={iconVariants({ size })}
          aria-hidden="true"
        />
      )}

      <HeadingTag className={titleVariants({ size })}>
        {title}
      </HeadingTag>

      {description && (
        <p className={descriptionVariants({ size })}>
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size={size === "sm" ? "sm" : "default"}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
