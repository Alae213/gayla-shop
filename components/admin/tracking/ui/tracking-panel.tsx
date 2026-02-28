import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TrackingButton } from "./tracking-button";

export interface TrackingPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
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

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss]);

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
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-[100vw] bg-card z-[110]",
          "shadow-lg flex flex-col",
          "animate-in slide-in-from-right duration-300 ease-out",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h2 id="panel-title" className="text-lg font-semibold text-foreground m-0 truncate pr-4">
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

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}
