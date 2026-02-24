import * as React from "react"
import { cn } from "@/lib/utils"
import { StatusPill, OrderStatus } from "./status-pill"
import { TrackingCheckbox } from "./tracking-checkbox"

export interface TrackingOrderCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  orderNumber: string
  customerName: string
  /** Optional product name shown on the card */
  productName?: string
  /** Optional variant string, e.g. "M / Red" */
  productVariant?: string
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
    productName,
    productVariant,
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

    const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
      // FIX 19B: Radix Checkbox renders a <button role="checkbox">, not an
      // <input> inside a <label>. Guard against both the checkbox button
      // itself and any ancestor with role="checkbox" to prevent double-firing.
      const target = e.target as HTMLElement
      if (
        target.closest('[role="checkbox"]') ||
        target.closest('label')
      ) return

      if (e.type === 'keydown') {
        const keyEvent = e as React.KeyboardEvent
        if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') return
        keyEvent.preventDefault()
      }
      onCardClick?.()
    }

    return (
      <div
        ref={ref}
        onClick={handleCardClick}
        onKeyDown={handleCardClick}
        // FIX 19A: Cards live inside role="list" kanban columns.
        // role="listitem" + aria-selected is correct for a selectable
        // collection item. aria-pressed (toggle semantics) was wrong here
        // and caused screen readers to announce "pressed / not pressed"
        // on every navigation instead of "selected / not selected".
        role="listitem"
        tabIndex={0}
        aria-selected={selected}
        aria-label={`Order ${orderNumber}${
          productName ? `, ${productName}` : ""
        } from ${customerName}, total ${totalPrice} DZD, status ${status}`}
        className={cn(
          "group relative flex flex-col gap-4 p-5 rounded-tracking-card transition-all duration-200 cursor-pointer text-[#3A3A3A] select-none text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA] focus-visible:ring-offset-2",
          selected
            ? "bg-[#F0F0F0] border-2 border-[#3A3A3A] shadow-tracking-card"
            : "bg-[#F7F7F7] border-2 border-transparent shadow-tracking-card hover:shadow-tracking-elevated hover:bg-white",
          className
        )}
        {...props}
      >
        {/* Header: Checkbox (visible on hover/selected) + Status */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "transition-opacity duration-200",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
          )}>
            <TrackingCheckbox
              checked={selected}
              onCheckedChange={handleCheckboxChange}
              aria-label={`Select order ${orderNumber}`}
              tabIndex={-1}
            />
          </div>
          <StatusPill status={status} />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold font-mono">{orderNumber}</span>
          {productName && (
            <span className="text-[13px] font-medium text-[#3A3A3A] truncate leading-snug">
              {productName}
              {productVariant && (
                <span className="text-[#AAAAAA] font-normal"> · {productVariant}</span>
              )}
            </span>
          )}
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
