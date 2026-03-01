"use client";

/**
 * OrderHistoryTimeline - Enhanced timeline component
 * Merges statusHistory and changeLog into a unified, sortable timeline
 * with icons, colors, and expandable entries
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Package,
  Truck,
  Edit3,
  User,
  ChevronDown,
  ChevronUp,
  FileEdit,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────────────────────────

interface StatusHistoryEntry {
  status: string;
  timestamp: number;
  reason?: string;
}

interface ChangeLogEntry {
  timestamp: number;
  adminName?: string;
  action: string;
  changes?: string;
}

type TimelineEventType = "status" | "line_items" | "delivery" | "edit";

interface TimelineEvent {
  type: TimelineEventType;
  timestamp: number;
  title: string;
  description?: string;
  details?: string;
  adminName?: string;
  status?: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

interface OrderHistoryTimelineProps {
  statusHistory?: StatusHistoryEntry[];
  changeLog?: ChangeLogEntry[];
}

// ─── Status Config ────────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  new: { emoji: "⌛", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  confirmed: { emoji: "✓", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  packaged: { emoji: "📦", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  shipped: { emoji: "🚚", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  canceled: { emoji: "✕", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  blocked: { emoji: "🚫", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  hold: { emoji: "⏸", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
};

// ─── Action Config ────────────────────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  line_items_updated: {
    icon: <Package className="h-4 w-4" />,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Line Items Updated",
  },
  delivery_updated: {
    icon: <Truck className="h-4 w-4" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Delivery Updated",
  },
  customer_updated: {
    icon: <User className="h-4 w-4" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Customer Info Updated",
  },
  order_edited: {
    icon: <Edit3 className="h-4 w-4" />,
    color: "text-gray-600",
    bg: "bg-gray-50",
    label: "Order Edited",
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseChanges(changes: string): { items: string[]; isTruncated: boolean } {
  const parts = changes.split(", ");
  const shouldTruncate = parts.length > 3 || changes.length > 150;
  
  return {
    items: parts,
    isTruncated: shouldTruncate,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────────────────────────

export function OrderHistoryTimeline({ statusHistory = [], changeLog = [] }: OrderHistoryTimelineProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  // Convert statusHistory to timeline events
  const statusEvents: TimelineEvent[] = statusHistory.map((entry) => {
    const config = STATUS_CONFIG[entry.status.toLowerCase()] || STATUS_CONFIG.new;
    return {
      type: "status",
      timestamp: entry.timestamp,
      title: `Status: ${entry.status}`,
      description: entry.reason,
      status: entry.status,
      icon: <span className="text-lg">{config.emoji}</span>,
      colorClass: config.color,
      bgClass: config.bg,
    };
  });

  // Convert changeLog to timeline events
  const changeEvents: TimelineEvent[] = changeLog.map((entry) => {
    const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.order_edited;
    const parsedChanges = entry.changes ? parseChanges(entry.changes) : null;

    return {
      type: entry.action.includes("line_items") ? "line_items"
        : entry.action.includes("delivery") ? "delivery"
        : "edit",
      timestamp: entry.timestamp,
      title: config.label,
      details: entry.changes,
      adminName: entry.adminName,
      icon: config.icon,
      colorClass: config.color,
      bgClass: config.bg,
    };
  });

  // Merge and sort by timestamp (newest first)
  const allEvents = [...statusEvents, ...changeEvents].sort((a, b) => b.timestamp - a.timestamp);

  const toggleExpand = (timestamp: number) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(timestamp)) {
        newSet.delete(timestamp);
      } else {
        newSet.add(timestamp);
      }
      return newSet;
    });
  };

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allEvents.map((event, index) => {
        const isExpanded = expandedEvents.has(event.timestamp);
        const hasDetails = event.details && event.details.length > 0;
        const parsedChanges = hasDetails ? parseChanges(event.details!) : null;
        const shouldShowToggle = parsedChanges?.isTruncated;

        return (
          <div key={`${event.type}-${event.timestamp}-${index}`} className="relative">
            {/* Timeline connector */}
            {index < allEvents.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 z-10",
                  event.bgClass
                )}
              >
                <div className={event.colorClass}>{event.icon}</div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={cn("font-semibold text-sm", event.colorClass)}>
                        {event.title}
                      </h4>
                      {event.status && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs", event.bgClass, event.colorClass)}
                        >
                          {event.status}
                        </Badge>
                      )}
                    </div>
                    {event.adminName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {event.adminName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                {/* Description (for status changes) */}
                {event.description && (
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}

                {/* Details (for change log entries) */}
                {hasDetails && parsedChanges && (
                  <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <div className="space-y-1.5">
                      {(isExpanded ? parsedChanges.items : parsedChanges.items.slice(0, 3)).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-gray-700"
                          >
                            <span className="text-gray-400 shrink-0">•</span>
                            <span>{item}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Expand/Collapse toggle */}
                    {shouldShowToggle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(event.timestamp)}
                        className="mt-2 h-auto py-1 px-2 text-xs text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Show {parsedChanges.items.length - 3} more
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
