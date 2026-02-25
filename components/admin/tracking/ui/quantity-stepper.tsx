import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center border border-[#ECECEC] rounded-lg bg-white overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-8 w-8 p-0 hover:bg-[#F5F5F5] rounded-none border-r border-[#ECECEC]"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5 text-[#3A3A3A]" />
      </Button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-12 h-8 text-center text-[13px] font-semibold text-[#3A3A3A] bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Quantity"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-8 w-8 p-0 hover:bg-[#F5F5F5] rounded-none border-l border-[#ECECEC]"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5 text-[#3A3A3A]" />
      </Button>
    </div>
  );
}
