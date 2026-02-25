/**
 * Keyboard Navigation Hook
 * 
 * Provides comprehensive keyboard navigation patterns following
 * WAI-ARIA Authoring Practices Guide (APG).
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
 */

import { useEffect, useCallback, RefObject } from 'react';

export type NavigationDirection = 'horizontal' | 'vertical' | 'both';

interface KeyboardNavigationOptions {
  /** Container element ref */
  containerRef: RefObject<HTMLElement>;
  /** Navigation direction */
  direction?: NavigationDirection;
  /** Enable arrow key navigation */
  enableArrowKeys?: boolean;
  /** Enable Tab key navigation */
  enableTab?: boolean;
  /** Enable Home/End keys */
  enableHomeEnd?: boolean;
  /** Enable Enter/Space activation */
  enableActivation?: boolean;
  /** Enable Escape to close */
  enableEscape?: boolean;
  /** Callback when escape pressed */
  onEscape?: () => void;
  /** Callback when item activated */
  onActivate?: (element: HTMLElement) => void;
  /** Enable focus trap (for modals) */
  enableFocusTrap?: boolean;
  /** Loop navigation at boundaries */
  loop?: boolean;
  /** Selector for focusable items */
  itemSelector?: string;
}

const DEFAULT_FOCUSABLE_SELECTOR = 
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook for keyboard navigation
 */
export function useKeyboardNavigation({
  containerRef,
  direction = 'vertical',
  enableArrowKeys = true,
  enableTab = true,
  enableHomeEnd = true,
  enableActivation = true,
  enableEscape = false,
  onEscape,
  onActivate,
  enableFocusTrap = false,
  loop = true,
  itemSelector = DEFAULT_FOCUSABLE_SELECTOR,
}: KeyboardNavigationOptions) {
  
  /**
   * Get all focusable items in container
   */
  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
    );
    
    return items.filter(item => {
      const style = window.getComputedStyle(item);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !item.hasAttribute('disabled')
      );
    });
  }, [containerRef, itemSelector]);

  /**
   * Get current focused element index
   */
  const getCurrentIndex = useCallback((): number => {
    const items = getFocusableItems();
    const activeElement = document.activeElement as HTMLElement;
    return items.indexOf(activeElement);
  }, [getFocusableItems]);

  /**
   * Focus item at specific index
   */
  const focusItemAtIndex = useCallback((index: number) => {
    const items = getFocusableItems();
    if (items.length === 0) return;

    let targetIndex = index;

    // Handle looping
    if (loop) {
      if (targetIndex < 0) {
        targetIndex = items.length - 1;
      } else if (targetIndex >= items.length) {
        targetIndex = 0;
      }
    } else {
      // Clamp to boundaries
      targetIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
    }

    items[targetIndex]?.focus();
  }, [getFocusableItems, loop]);

  /**
   * Handle arrow key navigation
   */
  const handleArrowKeys = useCallback((event: KeyboardEvent) => {
    if (!enableArrowKeys) return;

    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;

    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'both') {
          event.preventDefault();
          focusItemAtIndex(currentIndex + 1);
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'both') {
          event.preventDefault();
          focusItemAtIndex(currentIndex - 1);
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'both') {
          event.preventDefault();
          focusItemAtIndex(currentIndex + 1);
          handled = true;
        }
        break;

      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'both') {
          event.preventDefault();
          focusItemAtIndex(currentIndex - 1);
          handled = true;
        }
        break;
    }

    return handled;
  }, [enableArrowKeys, direction, getCurrentIndex, focusItemAtIndex]);

  /**
   * Handle Home/End keys
   */
  const handleHomeEnd = useCallback((event: KeyboardEvent) => {
    if (!enableHomeEnd) return;

    const items = getFocusableItems();
    if (items.length === 0) return;

    let handled = false;

    switch (event.key) {
      case 'Home':
        event.preventDefault();
        focusItemAtIndex(0);
        handled = true;
        break;

      case 'End':
        event.preventDefault();
        focusItemAtIndex(items.length - 1);
        handled = true;
        break;
    }

    return handled;
  }, [enableHomeEnd, getFocusableItems, focusItemAtIndex]);

  /**
   * Handle Enter/Space activation
   */
  const handleActivation = useCallback((event: KeyboardEvent) => {
    if (!enableActivation) return;

    const target = event.target as HTMLElement;
    
    // Don't handle if it's already a button or link
    if (target.tagName === 'BUTTON' || target.tagName === 'A') {
      return;
    }

    let handled = false;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      if (onActivate) {
        onActivate(target);
      } else {
        target.click();
      }
      
      handled = true;
    }

    return handled;
  }, [enableActivation, onActivate]);

  /**
   * Handle Escape key
   */
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (!enableEscape) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      return true;
    }

    return false;
  }, [enableEscape, onEscape]);

  /**
   * Handle Tab key for focus trap
   */
  const handleTab = useCallback((event: KeyboardEvent) => {
    if (!enableFocusTrap || !enableTab) return;

    const items = getFocusableItems();
    if (items.length === 0) return;

    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift+Tab: backward
        if (activeElement === firstItem) {
          event.preventDefault();
          lastItem.focus();
          return true;
        }
      } else {
        // Tab: forward
        if (activeElement === lastItem) {
          event.preventDefault();
          firstItem.focus();
          return true;
        }
      }
    }

    return false;
  }, [enableFocusTrap, enableTab, getFocusableItems]);

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if event originated from inside our container
    if (!containerRef.current?.contains(event.target as Node)) {
      return;
    }

    // Try handlers in order
    handleEscape(event) ||
    handleTab(event) ||
    handleArrowKeys(event) ||
    handleHomeEnd(event) ||
    handleActivation(event);
  }, [
    containerRef,
    handleEscape,
    handleTab,
    handleArrowKeys,
    handleHomeEnd,
    handleActivation,
  ]);

  /**
   * Set up keyboard listeners
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add listener to document for broader capture
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown]);

  /**
   * Focus first item (useful for initial focus)
   */
  const focusFirst = useCallback(() => {
    focusItemAtIndex(0);
  }, [focusItemAtIndex]);

  /**
   * Focus last item
   */
  const focusLast = useCallback(() => {
    const items = getFocusableItems();
    focusItemAtIndex(items.length - 1);
  }, [getFocusableItems, focusItemAtIndex]);

  return {
    focusFirst,
    focusLast,
    focusItemAtIndex,
    getFocusableItems,
    getCurrentIndex,
  };
}

/**
 * Hook for roving tabindex pattern
 * Only one item in a group is tabbable at a time
 */
export function useRovingTabIndex({
  containerRef,
  itemSelector = DEFAULT_FOCUSABLE_SELECTOR,
  defaultIndex = 0,
}: {
  containerRef: RefObject<HTMLElement>;
  itemSelector?: string;
  defaultIndex?: number;
}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>(itemSelector)
    );

    // Set tabindex for all items
    items.forEach((item, index) => {
      if (index === defaultIndex) {
        item.setAttribute('tabindex', '0');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });

    // Update tabindex on focus
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      items.forEach(item => {
        if (item === target) {
          item.setAttribute('tabindex', '0');
        } else {
          item.setAttribute('tabindex', '-1');
        }
      });
    };

    items.forEach(item => {
      item.addEventListener('focus', handleFocus);
    });

    return () => {
      items.forEach(item => {
        item.removeEventListener('focus', handleFocus);
      });
    };
  }, [containerRef, itemSelector, defaultIndex]);
}
