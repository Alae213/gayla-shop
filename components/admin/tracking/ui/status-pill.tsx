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

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  new: {
    label: "New",
    icon: <CircleDashed className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  packaged: {
    label: "Packaged",
    icon: <Package className="h-3 w-3" />,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  shipped: {
    label: "Shipped",
    icon: <Truck className="h-3 w-3" />,
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  canceled: {
    label: "Canceled",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  blocked: {
    label: "Blocked",
    icon: <Ban className="h-3 w-3" />,
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
  hold: {
    label: "Hold",
    icon: <PhoneForwarded className="h-3 w-3" />,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
}

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OrderStatus
}

export function StatusPill({ status, className, ...props }: StatusPillProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
      {...props}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
