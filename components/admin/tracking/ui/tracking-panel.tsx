import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { TrackingButton } from "./tracking-button"

export interface TrackingPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function TrackingPanel({
  isOpen,
  onClose,
  title,
  children,
  className,
  ...props
}: TrackingPanelProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 z-[100] transition-opacity duration-250 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Slide-in Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[480px] bg-white z-[110] shadow-tracking-elevated transition-transform duration-250 ease-out transform animate-in slide-in-from-right overflow-y-auto",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        {...props}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-[#ECECEC]">
            <h2 id="panel-title" className="text-[18px] font-semibold text-[#3A3A3A] m-0">
              {title}
            </h2>
            <TrackingButton 
              variant="icon" 
              size="icon" 
              onClick={onClose} 
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </TrackingButton>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}