import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Phase 3 - T3.2: QuantityInput Component
// Quantity selector with +/- buttons and manual input

const quantityInputVariants = cva(
  "flex items-center gap-1",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-10",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface QuantityInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof quantityInputVariants> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
  className,
  ...props
}: QuantityInputProps) {
  const [inputValue, setInputValue] = React.useState(String(value));

  // Sync internal state with prop
  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only update parent if valid number
    const num = parseInt(newValue, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
    }
  };

  const handleInputBlur = () => {
    // Reset to current value if input is invalid
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      setInputValue(String(value));
    } else {
      const clamped = Math.max(min, Math.min(max, num));
      setInputValue(String(clamped));
      if (clamped !== value) {
        onChange(clamped);
      }
    }
  };

  const buttonSize = size === "sm" ? "icon" : "icon";
  const buttonClassName = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const inputClassName = size === "sm" ? "h-8 w-14 text-sm" : "h-10 w-16";

  return (
    <div
      className={cn(quantityInputVariants({ size }), className)}
      role="group"
      aria-label="Quantity selector"
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={buttonClassName}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        min={min}
        max={max}
        className={cn(
          "text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          inputClassName
        )}
        aria-label="Quantity"
      />

      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={buttonClassName}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
