import { useState, useCallback } from "react";

/**
 * Hook to manage mutation state with built-in double-click prevention
 * 
 * @example
 * ```tsx
 * const deleteMutation = useMutation(api.orders.delete);
 * const { execute, isLoading, error } = useMutationState(deleteMutation);
 * 
 * <Button onClick={() => execute({ id })} disabled={isLoading}>
 *   {isLoading ? "Deleting..." : "Delete"}
 * </Button>
 * ```
 */
export function useMutationState<T extends (...args: any[]) => Promise<any>>(
  mutationFn: T
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      // Prevent double-click: if already loading, ignore
      if (isLoading) {
        console.warn("Mutation already in progress, ignoring duplicate call");
        return undefined;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(...args);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, isLoading]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset,
  };
}

/**
 * Simpler version that just tracks loading state
 * Use when you don't need error handling
 */
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      if (isLoading) return undefined; // Prevent double-click

      setIsLoading(true);
      try {
        return await fn();
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  return { isLoading, wrap, setIsLoading };
}
