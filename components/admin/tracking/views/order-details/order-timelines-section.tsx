"use client";

import * as React from "react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  PhoneMissed,
  PhoneForwarded,
  PhoneOff,
  CheckCircle2,
  Package,
  Truck,
  X,
  ShieldOff,
} from "lucide-react";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

const OUTCOME_META: Record<CallOutcome, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  answered:       { label: "Answered",     icon: PhoneCall,      color: "text-emerald-600", bg: "bg-emerald-50" },
  "no answer":    { label: "No Answer",    icon: PhoneMissed,    color: "text-amber-600",   bg: "bg-amber-50" },
  "wrong number": { label: "Wrong Number", icon: PhoneForwarded, color: "text-orange-600",  bg: "bg-orange-50" },
  refused:        { label: "Refused",      icon: PhoneOff,       color: "text-rose-600",    bg: "bg-rose-50" },
};

interface OrderTimelinesSectionProps {
  callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }>;
  statusHistory: Array<{ status: string; timestamp: number; reason?: string }>;
  courierTrackingId?: string;
  showCallLog: boolean;
  showStatusHistory: boolean;
}

/**
 * Order Timelines Section
 * 
 * Displays:
 * - Call history timeline (collapsible)
 * - Order status history timeline
 * - Courier tracking link (if shipped)
 */
export function OrderTimelinesSection({
  callLog,
  statusHistory,
  courierTrackingId,
  showCallLog,
  showStatusHistory,
}: OrderTimelinesSectionProps) {
  return (
    <>
      {/* Call Log History */}
      {showCallLog && callLog.length > 0 && (
        <CallLogHistory callLog={callLog} />
      )}

      {/* Order Timeline */}
      {showStatusHistory && statusHistory.length > 0 && (
        <section
          className="mt-8 pt-6 border-t border-[#ECECEC]"
          aria-labelledby="timeline-heading"
        >
          <h3
            id="timeline-heading"
            className="text-[14px] font-semibold text-[#3A3A3A] mb-4 flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-[#AAAAAA]" />
            Order Timeline
          </h3>
          <OrderTimeline entries={statusHistory} />
        </section>
      )}

      {/* Courier tracking link */}
      {courierTrackingId && (
        <a
          href={`https://yalidin.com/track/${courierTrackingId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-blue-600 underline mt-4 inline-block"
        >
          Track with Yalidin →
        </a>
      )}
    </>
  );
}

// Call History Timeline
function CallLogHistory({ callLog }: { callLog: Array<{ timestamp: number; outcome: CallOutcome; note?: string }> }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <section className="mt-8 pt-6 border-t border-[#ECECEC]" aria-labelledby="call-log-heading">
      <button
        onClick={() => setExpanded(p => !p)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={expanded}
      >
        <h3 id="call-log-heading" className="text-[14px] font-semibold text-[#3A3A3A] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#AAAAAA]" />
          Call History
          <span className="ml-1 text-[12px] font-normal text-[#AAAAAA] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
            {callLog.length} attempt{callLog.length !== 1 ? "s" : ""}
          </span>
        </h3>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[#AAAAAA]" />
          : <ChevronDown className="w-4 h-4 text-[#AAAAAA]" />}
      </button>
      {expanded && (
        <div className="mt-4 space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#ECECEC]">
          {[...callLog].reverse().map((entry, i) => {
            const meta = OUTCOME_META[entry.outcome];
            const Icon = meta.icon;
            return (
              <div key={i} className="relative pl-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full ${meta.bg} border-2 border-white flex items-center justify-center z-10 shadow-sm`}>
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-medium ${meta.color}`}>{meta.label}</span>
                    <span className="text-[11px] text-[#AAAAAA]">{formatDistanceToNow(entry.timestamp, { addSuffix: true })}</span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-[13px] text-[#555555] bg-white border border-[#ECECEC] rounded-lg p-2 italic leading-relaxed">
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  )}
                  <span className="mt-1 text-[11px] text-[#AAAAAA] uppercase tracking-wider font-medium">
                    {format(entry.timestamp, "MMM d, HH:mm")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Order Timeline
function OrderTimeline({ entries }: { entries: Array<{ status: string; timestamp: number; reason?: string }> }) {
  const statusIcon: Record<string, React.ElementType> = {
    new:       PhoneCall,
    confirmed: CheckCircle2,
    packaged:  Package,
    shipped:   Truck,
    canceled:  X,
    blocked:   ShieldOff,
    hold:      PhoneForwarded,
  };
  
  return (
    <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#ECECEC]">
      {[...entries].reverse().map((e, i) => {
        const Icon = statusIcon[e.status] ?? Clock;
        return (
          <div key={i} className="relative pl-8 animate-in fade-in duration-300">
            <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#F5F5F5] border-2 border-white flex items-center justify-center shadow-sm z-10">
              <Icon className="w-3 h-3 text-[#AAAAAA]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium capitalize text-[#3A3A3A]">{e.status}</span>
              {e.reason && <p className="text-[12px] text-[#AAAAAA] italic">{e.reason}</p>}
              <span className="text-[11px] text-[#AAAAAA] mt-0.5">{format(e.timestamp, "MMM d, HH:mm")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
