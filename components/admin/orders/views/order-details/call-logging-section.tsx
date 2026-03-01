"use client";

import * as React from "react";
import { Check, PhoneCall, PhoneMissed, PhoneForwarded, PhoneOff } from "lucide-react";
import { TrackingButton } from "../../ui/tracking-button";

type CallOutcome = "answered" | "no answer" | "wrong number" | "refused";

const OUTCOME_META: Record<CallOutcome, {
  label: string;
  icon: React.ElementType;
  color: string;
}> = {
  answered:       { label: "Answered",     icon: PhoneCall,      color: "text-emerald-600" },
  "no answer":    { label: "No Answer",    icon: PhoneMissed,    color: "text-amber-600" },
  "wrong number": { label: "Wrong Number", icon: PhoneForwarded, color: "text-orange-600" },
  refused:        { label: "Refused",      icon: PhoneOff,       color: "text-rose-600" },
};

interface CallLoggingSectionProps {
  showNoteInput: boolean;
  pendingOutcome: CallOutcome | null;
  callNote: string;
  isLoggingCall: boolean;
  
  onOutcomeClick: (outcome: CallOutcome) => void;
  onCallNoteChange: (note: string) => void;
  onCancelNote: () => void;
  onLogCall: () => void;
}

/**
 * Call Logging Section
 * 
 * Displays:
 * - 4 call outcome buttons (answered, no answer, wrong number, refused)
 * - Note input textarea (when outcome selected)
 * - Log/Cancel buttons
 */
export function CallLoggingSection({
  showNoteInput,
  pendingOutcome,
  callNote,
  isLoggingCall,
  onOutcomeClick,
  onCallNoteChange,
  onCancelNote,
  onLogCall,
}: CallLoggingSectionProps) {
  if (!showNoteInput) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <TrackingButton
          variant="secondary"
          onClick={() => onOutcomeClick("answered")}
          className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        >
          <PhoneCall className="w-4 h-4" /> Answered
        </TrackingButton>
        <TrackingButton
          variant="secondary"
          onClick={() => onOutcomeClick("no answer")}
          className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <PhoneMissed className="w-4 h-4" /> No Answer
        </TrackingButton>
        <TrackingButton
          variant="secondary"
          onClick={() => onOutcomeClick("wrong number")}
          className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <PhoneForwarded className="w-4 h-4" /> Wrong Number
        </TrackingButton>
        <TrackingButton
          variant="secondary"
          onClick={() => onOutcomeClick("refused")}
          className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          <PhoneOff className="w-4 h-4" /> Refused
        </TrackingButton>
      </div>
    );
  }

  if (!pendingOutcome) return null;

  const meta = OUTCOME_META[pendingOutcome];
  const Icon = meta.icon;

  return (
    <div className="space-y-4 animate-in zoom-in-95 duration-200">
      <div className="relative group">
        <div className="absolute left-3 top-3 pointer-events-none">
          <Icon className={`w-4 h-4 ${meta.color}`} aria-hidden="true" />
        </div>
        <div className="absolute left-9 top-2.5 px-2 py-0.5 rounded bg-white text-[11px] font-bold uppercase tracking-wider shadow-sm z-10 border border-[#ECECEC]">
          {meta.label}
        </div>
        <textarea
          value={callNote}
          onChange={e => onCallNoteChange(e.target.value)}
          placeholder="Add a note (customer said, follow-up time...)"
          rows={3}
          aria-label="Call note"
          className="w-full pl-3 pr-3 pt-9 pb-3 bg-[#F7F7F7] border border-[#ECECEC] rounded-xl text-[14px] text-[#3A3A3A] placeholder-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] transition leading-relaxed"
        />
      </div>
      <div className="flex gap-2">
        <TrackingButton variant="secondary" onClick={onCancelNote} className="flex-1">
          Cancel
        </TrackingButton>
        <TrackingButton
          variant="primary"
          onClick={onLogCall}
          disabled={isLoggingCall}
          className="flex-[2] gap-2 h-11"
        >
          {isLoggingCall ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" aria-hidden="true" />
          )}
          Log Call Outcome
        </TrackingButton>
      </div>
    </div>
  );
}
