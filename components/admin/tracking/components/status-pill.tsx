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
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  packaged: {
    label: "Packaged",
    icon: <Package className="h-3 w-3" />,
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  shipped: {
    label: "Shipped",
    icon: <Truck className="h-3 w-3" />,
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  canceled: {
    label: "Canceled",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  blocked: {
    label: "Blocked",
    icon: <Ban className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground border-border",
  },
  hold: {
    label: "Hold",
    icon: <PhoneForwarded className="h-3 w-3" />,
    className: "bg-warning/10 text-warning border-warning/20",
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
