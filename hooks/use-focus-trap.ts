/**
 * Focus Trap Hook
 * 
 * Traps focus within a container (modal, dialog, etc.)
 * and restores focus when the trap is released.
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

import { useEffect, useRef, RefObject } from 'react';

interface FocusTrapOptions {
  /** Container element to trap focus within */
  containerRef: RefObject<HTMLElement>;
  /** Enable/disable the focus trap */
  enabled?: boolean;
  /** Auto-focus first element on mount */
  autoFocus?: boolean;
  /** Restore focus to previous element on unmount */
  restoreFocus?: boolean;
  /** Handle Escape key to close */
  onEscape?: () => void;
  /** Prevent background scroll */
  preventScroll?: boolean;
  /** Initial focus selector */
  initialFocusSelector?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook for focus trap functionality
 */
export function useFocusTrap({
  containerRef,
  enabled = true,
  autoFocus = true,
  restoreFocus = true,
  onEscape,
  preventScroll = true,
  initialFocusSelector,
}: FocusTrapOptions) {
  // Store the element that had focus before trap activated
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within container
   */
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      );
    });
  };

  /**
   * Handle Tab key to trap focus
   */
  const handleTab = (event: KeyboardEvent) => {
    if (!enabled || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    // If not focused within container, focus first element
    if (!containerRef.current?.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    // Shift + Tab (backward)
    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab (forward)
    else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Handle Escape key
   */
  const handleEscape = (event: KeyboardEvent) => {
    if (!enabled || event.key !== 'Escape') return;

    event.preventDefault();
    onEscape?.();
  };

  /**
   * Handle all keyboard events
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    handleTab(event);
    handleEscape(event);
  };

  /**
   * Focus first focusable element
   */
  const focusFirst = () => {
    if (!containerRef.current) return;

    let elementToFocus: HTMLElement | null = null;

    // Try initial focus selector first
    if (initialFocusSelector) {
      elementToFocus = containerRef.current.querySelector<HTMLElement>(
        initialFocusSelector
      );
    }

    // Fall back to first focusable element
    if (!elementToFocus) {
      const focusableElements = getFocusableElements();
      elementToFocus = focusableElements[0] || null;
    }

    // Fall back to container itself
    if (!elementToFocus && containerRef.current) {
      containerRef.current.setAttribute('tabindex', '-1');
      elementToFocus = containerRef.current;
    }

    elementToFocus?.focus();
  };

  /**
   * Set up focus trap
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Prevent background scroll
    if (preventScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [enabled, containerRef, preventScroll]);

  /**
   * Auto-focus on mount
   */
  useEffect(() => {
    if (!enabled || !autoFocus) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      focusFirst();
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [enabled, autoFocus]);

  /**
   * Set up keyboard listeners
   */
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  /**
   * Restore focus on unmount
   */
  useEffect(() => {
    return () => {
      if (restoreFocus && previouslyFocusedElement.current) {
        // Small delay to ensure modal/dialog is removed from DOM
        setTimeout(() => {
          previouslyFocusedElement.current?.focus();
        }, 10);
      }
    };
  }, [restoreFocus]);

  return {
    focusFirst,
    getFocusableElements,
  };
}

/**
 * Hook to manage focus visibility (show outline only for keyboard)
 */
export function useFocusVisible() {
  useEffect(() => {
    let isMouseDown = false;

    const handleMouseDown = () => {
      isMouseDown = true;
      document.body.classList.add('using-mouse');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only Tab key indicates keyboard navigation
      if (event.key === 'Tab') {
        isMouseDown = false;
        document.body.classList.remove('using-mouse');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

/**
 * Hook to announce content changes to screen readers
 */
export function useAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region for announcements
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      document.body.removeChild(announcer);
    };
  }, []);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;

    announcerRef.current.setAttribute('aria-live', priority);
    
    // Clear then set message (ensures announcement even if same text)
    announcerRef.current.textContent = '';
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  };

  return announce;
}
