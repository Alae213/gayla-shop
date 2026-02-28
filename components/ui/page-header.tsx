import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Phase 2 - T2.5: PageHeader Component
// Flexible page header with breadcrumbs, title, description, and actions

const pageHeaderVariants = cva(
  "flex flex-col gap-4",
  {
    variants: {
      size: {
        sm: "pb-4",
        md: "pb-6",
        lg: "pb-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const titleVariants = cva("font-extrabold tracking-tight text-foreground", {
  variants: {
    size: {
      sm: "text-2xl",
      md: "text-3xl md:text-4xl",
      lg: "text-4xl md:text-5xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  size = "md",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ size }), className)} {...props}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className={titleVariants({ size })}>{title}</h1>
          {description && (
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
