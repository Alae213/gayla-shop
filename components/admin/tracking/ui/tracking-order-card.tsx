import * as React from "react"
import { cn } from "@/lib/utils"
import { StatusPill, OrderStatus } from "./status-pill"
import { TrackingCheckbox } from "./tracking-checkbox"

export interface TrackingOrderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  orderNumber: string
  customerName: string
  totalPrice: number
  status: OrderStatus
  date: string
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
  onCardClick?: () => void
}

export const TrackingOrderCard = React.forwardRef<HTMLDivElement, TrackingOrderCardProps>(
  ({ 
    className, 
    orderNumber, 
    customerName, 
    totalPrice, 
    status, 
    date,
    selected = false, 
    onSelectChange, 
    onCardClick,
    ...props 
  }, ref) => {
    
    const handleCheckboxChange = (checked: boolean) => {
      onSelectChange?.(checked)
    }

    const handleCardClick = (e: React.MouseEvent) => {
      // Prevent clicking the card if we're just clicking the checkbox
      const target = e.target as HTMLElement
      if (target.closest('label') || target.tagName.toLowerCase() === 'input') {
        return
      }
      onCardClick?.()
    }

    return (
      <div
        ref={ref}
        onClick={handleCardClick}
        className={cn(
          "group relative flex flex-col gap-4 p-5 rounded-tracking-card transition-all duration-200 cursor-pointer text-[#3A3A3A] select-none",
          selected
            ? "bg-[#F0F0F0] border-2 border-[#3A3A3A] shadow-tracking-card"
            : "bg-[#F7F7F7] border-2 border-transparent shadow-tracking-card hover:shadow-tracking-elevated hover:bg-white",
          className
        )}
        {...props}
      >
        {/* Header: Checkbox (visible on hover or if selected) + Status */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <TrackingCheckbox 
              checked={selected} 
              onCheckedChange={handleCheckboxChange} 
              aria-label={`Select order ${orderNumber}`}
            />
          </div>
          <StatusPill status={status} />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold">{orderNumber}</span>
          <span className="text-[13px] text-[#AAAAAA]">{customerName}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1 pt-4 border-t border-[#ECECEC]">
          <span className="text-[13px] font-medium">{totalPrice} DZD</span>
          <span className="text-[12px] text-[#AAAAAA]">{date}</span>
        </div>
      </div>
    )
  }
)
TrackingOrderCard.displayName = "TrackingOrderCard"