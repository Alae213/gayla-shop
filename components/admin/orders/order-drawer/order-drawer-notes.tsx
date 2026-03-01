"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import type { AdminNote } from "../types";

interface OrderDrawerNotesProps {
  notes: AdminNote[];
  newNote: string;
  isSaving: boolean;
  onNoteChange: (note: string) => void;
  onSave: () => void;
}

/**
 * OrderDrawer Notes Section
 * 
 * Manages internal admin notes for the order.
 * Not visible to customers.
 */
export function OrderDrawerNotes({
  notes,
  newNote,
  isSaving,
  onNoteChange,
  onSave,
}: OrderDrawerNotesProps) {
  const fmt = (ts: number) =>
    new Date(ts).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" /> Internal Notes
        <span className="text-xs text-gray-400 font-normal">— not visible to customer</span>
      </h3>
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a private note about this order or customer…"
          className="resize-none text-sm"
          rows={3}
        />
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || !newNote.trim()}
          className="gap-1.5"
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" />
              Saving…
            </>
          ) : (
            "Save Note"
          )}
        </Button>
      </div>
      {notes && notes.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          {[...notes].reverse().map((n, i) => (
            <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-800">{n.text}</p>
              <p className="text-xs text-gray-400 mt-1">{fmt(n.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
