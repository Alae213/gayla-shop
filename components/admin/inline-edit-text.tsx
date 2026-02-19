"use client";

import {
  useState,
  useRef,
  useEffect,
  type ElementType,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditTextProps {
  /** Current saved value from the database */
  value: string;
  /** Called when the user clicks Save — should persist the new value */
  onSave: (newValue: string) => Promise<void>;
  /** Tailwind classes forwarded to the display element */
  className?: string;
  /** Inline styles forwarded to the display element (e.g. gradient background) */
  style?: CSSProperties;
  placeholder?: string;
  /** "input" for single-line, "textarea" for multi-line */
  inputType?: "input" | "textarea";
  /** HTML tag rendered in display mode */
  as?: ElementType;
  /** Called whenever this field enters or exits edit mode */
  onEditingChange?: (isEditing: boolean) => void;
}

export function InlineEditText({
  value,
  onSave,
  className,
  style,
  placeholder = "Double-click to edit…",
  inputType = "input",
  as: Tag = "span",
  onEditingChange,
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState(value);
  const [isSaving, setIsSaving]   = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Keep draft in sync when value is updated externally (Convex live query)
  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  const enterEdit = (e: React.MouseEvent) => {
    // Prevent the double-click from bubbling to the hero background handler
    e.stopPropagation();
    setDraft(value);
    setIsEditing(true);
    onEditingChange?.(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const cancelEdit = () => {
    setDraft(value);
    setIsEditing(false);
    onEditingChange?.(false);
  };

  const commitSave = async () => {
    // No change — just exit
    if (draft.trim() === value.trim()) {
      cancelEdit();
      return;
    }
    setIsSaving(true);
    try {
      await onSave(draft.trim());
      setIsEditing(false);
      onEditingChange?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
    // Enter commits on single-line inputs only
    if (e.key === "Enter" && inputType === "input") { e.preventDefault(); commitSave(); }
  };

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    const sharedInputClass =
      "w-full bg-white/15 backdrop-blur-sm border-2 border-white/50 rounded-lg " +
      "text-white placeholder:text-white/40 focus:outline-none focus:border-white/80 " +
      "transition-colors px-3 py-1.5";

    return (
      // Wrapper is inline-flex column so save/cancel row is flush below the input
      <span className="inline-flex flex-col gap-2 w-full">
        {inputType === "textarea" ? (
          <textarea
            ref={inputRef as any}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown as any}
            placeholder={placeholder}
            rows={3}
            className={cn(sharedInputClass, "resize-none text-sm")}
          />
        ) : (
          <input
            ref={inputRef as any}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown as any}
            placeholder={placeholder}
            // Inherit className so the input visually matches the rendered text size
            className={cn(sharedInputClass, className)}
            // Strip colour / margin classes from the display className for the input
            style={{ color: "white", marginBottom: 0 }}
          />
        )}

        {/* Micro action row — Save & Cancel */}
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={commitSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold
              px-3 py-1.5 rounded-lg bg-white text-gray-900 shadow-md
              hover:bg-gray-100 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSaving
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Check className="h-3 w-3" />}
            {isSaving ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={cancelEdit}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold
              px-3 py-1.5 rounded-lg bg-white/20 text-white
              hover:bg-white/30 active:scale-95 disabled:opacity-50 transition-all"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </span>
      </span>
    );
  }

  // ── Display mode ───────────────────────────────────────────────────────────
  return (
    <Tag
      onDoubleClick={enterEdit}
      className={cn(
        // Dashed outline on hover signals editability without cluttering the view
        "cursor-text select-none rounded outline-2 outline-transparent outline-offset-4",
        "hover:outline-dashed hover:outline-white/50 transition-[outline-color] duration-150",
        className
      )}
      style={style}
      title="Double-click to edit"
    >
      {value || <span className="opacity-40 italic">{placeholder}</span>}
    </Tag>
  );
}
