import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const trackingButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[#3A3A3A] text-white hover:bg-[#1A1A1A] rounded-tracking-button",
        secondary:
          "border border-[#ECECEC] bg-white text-[#3A3A3A] hover:bg-[#F5F5F5] rounded-tracking-button",
        icon:
          "bg-[#F5F5F5] text-[#3A3A3A] hover:bg-[#ECECEC] rounded-full",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10", // 40px circle
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface TrackingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof trackingButtonVariants> {
  asChild?: boolean
}

const TrackingButton = React.forwardRef<HTMLButtonElement, TrackingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(trackingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
TrackingButton.displayName = "TrackingButton"

export { TrackingButton, trackingButtonVariants }