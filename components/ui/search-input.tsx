import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Phase 2 - T2.7: SearchInput Component
// Search input with clear button and keyboard accessibility

const searchInputVariants = cva(
  "relative flex items-center",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-10",
        lg: "h-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const inputSizeMap = {
  sm: "pl-8 pr-8 h-8 text-sm",
  md: "pl-10 pr-10 h-10 text-base",
  lg: "pl-12 pr-12 h-12 text-lg",
};

const iconSizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof searchInputVariants> {
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, size = "md", className, ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0);

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        // Simulate input change event with empty value
        const syntheticEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn(searchInputVariants({ size }), "w-full", className)}>
        {/* Search Icon */}
        <Search
          className={cn(
            "absolute left-3 text-muted-foreground pointer-events-none",
            iconSizeMap[size || "md"]
          )}
          aria-hidden="true"
        />

        {/* Input */}
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          className={cn(inputSizeMap[size || "md"])}
          role="searchbox"
          aria-label="Search"
          {...props}
        />

        {/* Clear Button */}
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className={cn(
              "absolute right-1 h-7 w-7 hover:bg-muted",
              size === "sm" && "h-6 w-6",
              size === "lg" && "h-9 w-9"
            )}
            aria-label="Clear search"
          >
            <X className={iconSizeMap[size || "md"]} />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
