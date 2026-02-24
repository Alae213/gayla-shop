import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TrackingButton } from "./tracking-button";

export interface TrackingPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, fires instead of onClose for backdrop, X button, and Escape.
   *  Use this to let the child component intercept the close (e.g. unsaved-changes guard). */
  onRequestClose?: () => void;
  title?: string;
}

export function TrackingPanel({
  isOpen,
  onClose,
  onRequestClose,
  title,
  children,
  className,
  ...props
}: TrackingPanelProps) {
  const handleDismiss = onRequestClose ?? onClose;

  // Close on Escape — respects onRequestClose
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss]);

  // Prevent body scroll while panel is open.
  // We save and restore any existing overflow value so we don’t clobber
  // a parent layout that sets its own overflow.
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-[100] animate-in fade-in duration-200"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Slide-in Panel
          • Full-width on mobile, 480px on sm+, never wider than 100vw
          • duration-300 (duration-250 is not a valid Tailwind value) */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-[100vw] bg-white z-[110]",
          "shadow-tracking-elevated flex flex-col",
          "animate-in slide-in-from-right duration-300 ease-out",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECECEC] shrink-0">
          <h2 id="panel-title" className="text-[18px] font-semibold text-[#3A3A3A] m-0 truncate pr-4">
            {title}
          </h2>
          <TrackingButton
            variant="icon"
            size="icon"
            onClick={handleDismiss}
            aria-label="Close panel"
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </TrackingButton>
        </div>

        {/* Content — children handle their own internal scroll */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}
