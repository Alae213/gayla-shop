import * as React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

interface CallLogIndicatorProps {
  callLog: Array<{ outcome: CallOutcome; timestamp?: number }>;
  className?: string;
  maxVisible?: number;
}

const OUTCOME_COLORS: Record<CallOutcome, string> = {
  answered: "bg-emerald-500 dark:bg-emerald-400",
  "no answer": "bg-red-500 dark:bg-red-400",
  "wrong number": "bg-orange-500 dark:bg-orange-400",
  refused: "bg-rose-500 dark:bg-rose-400",
};

const OUTCOME_LABELS: Record<CallOutcome, string> = {
  answered: "Answered",
  "no answer": "No Answer",
  "wrong number": "Wrong Number",
  refused: "Refused",
};

export function CallLogIndicator({
  callLog,
  className,
  maxVisible = 3,
}: CallLogIndicatorProps) {
  if (!callLog || callLog.length === 0) {
    return null;
  }

  const visibleCalls = callLog.slice(0, maxVisible);
  const hiddenCount = Math.max(0, callLog.length - maxVisible);

  const tooltipContent = (
    <div className="space-y-1 max-w-[200px]">
      <p className="font-semibold text-xs mb-2">Call History</p>
      {callLog.map((call, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <div
            className={cn("w-2 h-2 rounded-full shrink-0", OUTCOME_COLORS[call.outcome])}
            aria-hidden="true"
          />
          <span>{OUTCOME_LABELS[call.outcome]}</span>
        </div>
      ))}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted border border-border",
              className
            )}
            role="status"
            aria-label={`${callLog.length} call attempt${callLog.length !== 1 ? "s" : ""}`}
          >
            <Phone className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <div className="flex items-center gap-1">
              {visibleCalls.map((call, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 rounded-sm transition-transform hover:scale-110",
                    OUTCOME_COLORS[call.outcome]
                  )}
                  aria-label={OUTCOME_LABELS[call.outcome]}
                  title={OUTCOME_LABELS[call.outcome]}
                />
              ))}
              {hiddenCount > 0 && (
                <span className="text-[10px] font-bold text-muted-foreground ml-0.5">
                  +{hiddenCount}
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-foreground text-background border-foreground">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
