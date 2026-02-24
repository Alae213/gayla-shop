import * as React from "react"
import { cn } from "@/lib/utils"
import {
  CircleDashed,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  Ban,
  PhoneForwarded,
} from "lucide-react"

export type OrderStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold"

interface StatusConfig {
  icon: React.ElementType
  colorClass: string
  bgClass: string
  borderClass: string
  label?: string
}

const statusConfigMap: Record<OrderStatus, StatusConfig> = {
  new:       { icon: CircleDashed,   colorClass: "text-blue-600",    bgClass: "bg-blue-50",    borderClass: "border-blue-200" },
  confirmed: { icon: CheckCircle2,   colorClass: "text-emerald-600", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
  packaged:  { icon: Package,        colorClass: "text-amber-600",   bgClass: "bg-amber-50",   borderClass: "border-amber-200" },
  shipped:   { icon: Truck,          colorClass: "text-purple-600",  bgClass: "bg-purple-50",  borderClass: "border-purple-200" },
  canceled:  { icon: XCircle,        colorClass: "text-rose-600",    bgClass: "bg-rose-50",    borderClass: "border-rose-200" },
  blocked:   { icon: Ban,            colorClass: "text-gray-600",    bgClass: "bg-gray-100",   borderClass: "border-gray-200" },
  // hold = "wrong number" hold — visually orange/amber to distinguish from rose canceled
  hold:      { icon: PhoneForwarded, colorClass: "text-orange-600",  bgClass: "bg-orange-50",  borderClass: "border-orange-200", label: "hold" },
}

export interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  status: OrderStatus
}

export function StatusPill({ status, className, ...props }: StatusPillProps) {
  const config = statusConfigMap[status]
  if (!config) return null

  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium lowercase border",
        config.colorClass,
        config.bgClass,
        config.borderClass,
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{config.label ?? status}</span>
    </div>
  )
}
