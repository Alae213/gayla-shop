import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  CircleDashed, 
  CheckCircle2, 
  Package, 
  Truck, 
  XCircle, 
  Ban 
} from "lucide-react"

export type OrderStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked"

interface StatusConfig {
  icon: React.ElementType
  colorClass: string
  bgClass: string
}

const statusConfigMap: Record<OrderStatus, StatusConfig> = {
  new: { icon: CircleDashed, colorClass: "text-blue-600", bgClass: "bg-blue-50" },
  confirmed: { icon: CheckCircle2, colorClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  packaged: { icon: Package, colorClass: "text-amber-600", bgClass: "bg-amber-50" },
  shipped: { icon: Truck, colorClass: "text-purple-600", bgClass: "bg-purple-50" },
  canceled: { icon: XCircle, colorClass: "text-rose-600", bgClass: "bg-rose-50" },
  blocked: { icon: Ban, colorClass: "text-gray-600", bgClass: "bg-gray-100" },
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium lowercase",
        config.colorClass,
        config.bgClass,
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{status}</span>
    </div>
  )
}