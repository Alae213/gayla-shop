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

  // Trap body scroll while panel is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-[100] transition-opacity duration-250 animate-in fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Slide-in Panel — outer scroll is here */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[480px] bg-white z-[110] shadow-tracking-elevated transition-transform duration-250 ease-out transform animate-in slide-in-from-right flex flex-col",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECECEC] shrink-0">
          <h2 id="panel-title" className="text-[18px] font-semibold text-[#3A3A3A] m-0">
            {title}
          </h2>
          <TrackingButton
            variant="icon"
            size="icon"
            onClick={handleDismiss}
            aria-label="Close panel"
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
