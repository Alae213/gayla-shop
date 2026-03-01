/**
 * Confirmation Dialog Component
 * 
 * Shows confirmation before destructive actions (delete, etc.).
 * Includes impact preview and keyboard shortcuts.
 */

'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { generateEditLabel } from '@/lib/utils/aria-utils';

export interface ConfirmationDialogProps {
  /** Is dialog open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Confirm handler */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Impact preview (what will happen) */
  impact?: string[];
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Variant type */
  variant?: 'danger' | 'warning' | 'info';
  /** Is loading */
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  impact,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Focus trap
  useFocusTrap({
    containerRef: dialogRef as RefObject<HTMLElement>,
    enabled: isOpen,
    autoFocus: true,
    restoreFocus: true,
    onEscape: onClose,
  });

  /**
   * Handle confirm
   */
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isConfirming) {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirming]);

  if (!isOpen) return null;

  // Variant styles
  const variantStyles = {
    danger: {
      icon: 'bg-error-100 text-error-300',
      button: 'bg-error-300 hover:bg-error-400 focus-visible:outline-error-300',
    },
    warning: {
      icon: 'bg-warning-100 text-warning-300',
      button: 'bg-warning-300 hover:bg-warning-400 focus-visible:outline-warning-300',
    },
    info: {
      icon: 'bg-primary-100 text-primary-300',
      button: 'bg-primary-300 hover:bg-primary-400 focus-visible:outline-primary-300',
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        aria-modal="true"
        className="
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-full max-w-md bg-white rounded-xl shadow-2xl
          animate-slide-up
        "
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 p-3 rounded-full ${styles.icon}`}>
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>

            {/* Title & Close */}
            <div className="flex-1">
              <h2
                id="dialog-title"
                className="text-xl font-semibold text-system-400"
              >
                {title}
              </h2>
            </div>

            <button
              onClick={onClose}
              disabled={isConfirming || isLoading}
              aria-label="Close dialog"
              className="
                p-1 rounded hover:bg-system-100 transition-colors
                focus-visible:outline focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-primary-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <X className="w-5 h-5 text-system-300" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Message */}
          <p
            id="dialog-description"
            className="text-system-300 mb-4 pl-14"
          >
            {message}
          </p>

          {/* Impact Preview */}
          {impact && impact.length > 0 && (
            <div className="pl-14 mb-4">
              <p className="text-sm font-medium text-system-400 mb-2">
                This will:
              </p>
              <ul className="space-y-1">
                {impact.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-system-300 flex gap-2"
                  >
                    <span className="text-error-300 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pl-14">
            <button
              onClick={handleConfirm}
              disabled={isConfirming || isLoading}
              aria-label={generateEditLabel('confirm action', confirmText)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg
                text-white font-medium
                transition-colors
                focus-visible:outline focus-visible:outline-2 
                focus-visible:outline-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${styles.button}
              `}
            >
              {isConfirming || isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isConfirming || isLoading}
              aria-label={generateEditLabel('cancel action', cancelText)}
              className="
                flex-1 px-4 py-2.5 rounded-lg
                bg-white border-2 border-system-200 text-system-400
                hover:bg-system-100 transition-colors font-medium
                focus-visible:outline focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-primary-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {cancelText}
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-system-300 text-center mt-4">
            Press <kbd className="px-1.5 py-0.5 bg-system-100 rounded text-system-400">Enter</kbd> to confirm or{' '}
            <kbd className="px-1.5 py-0.5 bg-system-100 rounded text-system-400">Escape</kbd> to cancel
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Hook for confirmation dialog
 */
import { useCallback } from 'react';

export function useConfirmation() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    impact?: string[];
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = useCallback(
    (options: {
      title: string;
      message: string;
      impact?: string[];
      variant?: 'danger' | 'warning' | 'info';
    }) => {
      return new Promise<boolean>((resolve) => {
        setDialogState({
          isOpen: true,
          ...options,
          onConfirm: async () => {
            resolve(true);
            setDialogState((prev) => ({ ...prev, isOpen: false }));
          },
        });
      });
    },
    []
  );

  const close = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...dialogState,
    confirm,
    close,
  };
}

/**
 * Add to globals.css:
 * 
 * @keyframes fade-in {
 *   from { opacity: 0; }
 *   to { opacity: 1; }
 * }
 * 
 * @keyframes slide-up {
 *   from {
 *     opacity: 0;
 *     transform: translate(-50%, -48%) scale(0.95);
 *   }
 *   to {
 *     opacity: 1;
 *     transform: translate(-50%, -50%) scale(1);
 *   }
 * }
 * 
 * .animate-fade-in {
 *   animation: fade-in 0.2s ease-out;
 * }
 * 
 * .animate-slide-up {
 *   animation: slide-up 0.2s ease-out;
 * }
 */
