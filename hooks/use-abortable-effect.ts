import { useEffect, useRef, DependencyList } from 'react';

/**
 * Hook that provides an AbortSignal for effects with async operations
 * Automatically aborts pending operations when component unmounts or deps change
 * 
 * @example
 * ```tsx
 * useAbortableEffect((signal) => {
 *   const fetchData = async () => {
 *     const response = await fetch('/api/data', { signal });
 *     if (!signal.aborted) {
 *       setData(await response.json());
 *     }
 *   };
 *   fetchData();
 * }, [dependency]);
 * ```
 */
export function useAbortableEffect(
  effect: (signal: AbortSignal) => void | (() => void),
  deps: DependencyList
) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Create new AbortController for this effect run
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Run the effect with abort signal
    const cleanup = effect(signal);

    // Cleanup function
    return () => {
      // Abort any pending operations
      abortControllerRef.current?.abort();
      
      // Call user-provided cleanup if exists
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook to check if component is still mounted
 * Useful for preventing setState warnings on unmounted components
 * 
 * @example
 * ```tsx
 * const isMounted = useIsMounted();
 * 
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 * ```
 */
export function useIsMounted() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return () => mountedRef.current;
}

/**
 * Hook that returns an AbortController that persists across renders
 * Useful when you need to abort operations from event handlers
 * 
 * @example
 * ```tsx
 * const abortController = useAbortController();
 * 
 * const handleClick = () => {
 *   fetch('/api/data', { signal: abortController.signal })
 *     .then(handleSuccess)
 *     .catch(handleError);
 * };
 * 
 * const handleCancel = () => {
 *   abortController.abort();
 * };
 * ```
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    const controller = abortControllerRef.current;
    return () => {
      controller.abort();
    };
  }, []);

  return abortControllerRef.current;
}
