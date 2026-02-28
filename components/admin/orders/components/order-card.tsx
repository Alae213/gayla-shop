import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusPill, OrderStatus } from "./status-pill";
import { Checkbox } from "./checkbox";
import { CallLogIndicator } from "./call-log-indicator";
import { ColorDot } from "./color-dot";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { generateShimmerDataURL } from "@/lib/utils/image-placeholder";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

export interface OrderCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  orderNumber: string;
  customerName: string;
  productName?: string;
  productVariant?: string;
  thumbnail?: string;
  wilaya?: string;
  deliveryType?: "Stopdesk" | "Domicile";
  quantity?: number;
  variantLabel?: string;
  variantColor?: string;
  moreItemsCount?: number;
  callLog?: Array<{ outcome: CallOutcome; timestamp?: number }>;
  showCallLog?: boolean;
  totalPrice: number;
  status: OrderStatus;
  date: string;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onCardClick?: () => void;
}

export const OrderCard = React.forwardRef<HTMLDivElement, OrderCardProps>(
  ({
    className,
    orderNumber,
    customerName,
    productName,
    productVariant,
    thumbnail,
    wilaya,
    deliveryType,
    quantity,
    variantLabel,
    variantColor,
    moreItemsCount,
    callLog,
    showCallLog = false,
    totalPrice,
    status,
    date,
    selected = false,
    onSelectChange,
    onCardClick,
    ...props
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const handleCheckboxChange = (checked: boolean) => {
      onSelectChange?.(checked);
    };

    const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[role="checkbox"]') ||
        target.closest('label')
      ) return;

      if (e.type === 'keydown') {
        const keyEvent = e as React.KeyboardEvent;
        if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') return;
        keyEvent.preventDefault();
      }
      onCardClick?.();
    };

    const locationText = React.useMemo(() => {
      const parts: string[] = [];
      if (wilaya) parts.push(wilaya);
      if (deliveryType) {
        parts.push(deliveryType === "Stopdesk" ? "Stop desk" : "Domicile");
      }
      return parts.join(" | ");
    }, [wilaya, deliveryType]);

    return (
      <div
        ref={ref}
        onClick={handleCardClick}
        onKeyDown={handleCardClick}
        role="listitem"
        tabIndex={0}
        aria-selected={selected}
        aria-label={`Order ${orderNumber}${
          productName ? `, ${productName}` : ""
        } from ${customerName}, total ${totalPrice} DZD, status ${status}`}
        className={cn(
          "group relative flex flex-col gap-4 p-5 rounded-lg transition-all duration-200 cursor-pointer text-foreground select-none text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          selected
            ? "bg-secondary border-2 border-foreground shadow-sm"
            : "bg-muted border-2 border-transparent shadow-sm hover:shadow-md hover:bg-card",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "transition-opacity duration-200",
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
            )}>
              <Checkbox
                checked={selected}
                onCheckedChange={handleCheckboxChange}
                aria-label={`Select order ${orderNumber}`}
                tabIndex={-1}
              />
            </div>
            {showCallLog && callLog && callLog.length > 0 && (
              <CallLogIndicator callLog={callLog} />
            )}
          </div>
          <StatusPill status={status} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold font-mono leading-tight">{orderNumber}</span>
          <span className="text-sm font-medium text-foreground leading-snug">{customerName}</span>
          {locationText && (
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {locationText}
            </span>
          )}
        </div>

        {productName && (
          <div className="flex gap-3 items-start">
            {thumbnail && !imageError && (
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-muted/50 border border-border">
                <Image
                  src={thumbnail}
                  alt={productName || "Product"}
                  fill
                  className="object-cover"
                  sizes="48px"
                  placeholder="blur"
                  blurDataURL={generateShimmerDataURL(48, 48)}
                  loading="lazy"
                  quality={85}
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            {(!thumbnail || imageError) && (
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-muted/50 border border-border flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate leading-snug mb-1">
                {productName}
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                {quantity && quantity > 1 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                    ×{quantity}
                  </Badge>
                )}
                {variantLabel && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium">
                    {variantLabel}
                  </Badge>
                )}
                {variantColor && <ColorDot color={variantColor} size={8} />}
                {!variantLabel && productVariant && (
                  <span className="text-xs text-muted-foreground">{productVariant}</span>
                )}
              </div>
              {moreItemsCount && moreItemsCount > 0 && (
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  +{moreItemsCount} more item{moreItemsCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pt-4 border-t border-border">
          <span className="text-sm font-bold text-foreground">{totalPrice.toLocaleString()} DZD</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>
    );
  }
);
OrderCard.displayName = "OrderCard";