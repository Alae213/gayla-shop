import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label 
        className={cn(
          "relative flex items-center justify-center w-5 h-5 rounded-[4px] border transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring",
          checked 
            ? "bg-foreground border-foreground text-background" 
            : "bg-background border-border hover:border-muted-foreground",
          className
        )}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"