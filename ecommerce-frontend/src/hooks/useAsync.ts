'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { CustomError, handleApiError } from '@/lib/errorHandler';
import toast from 'react-hot-toast';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: CustomError | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
}

export function useAsync<T = unknown>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = false,
  showToast = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        setState(prev => ({ ...prev, data, loading: false }));
        return data;
      } catch (error) {
        let customError: CustomError;

        if (error instanceof CustomError) {
          customError = error;
        } else {
          customError = handleApiError(error);
        }

        setState(prev => ({ ...prev, error: customError, loading: false }));

        if (showToast) {
          toast.error(customError.message || 'An error occurred');
        }

        return null;
      }
    },
    [asyncFunction, showToast]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute, reset, setData };
}

// Hook for handling form submissions
export function useFormSubmit<T = unknown>(
  submitFunction: (...args: unknown[]) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: CustomError) => void
) {
  const { data, loading, error, execute, reset } = useAsync(submitFunction, false, false);

  const handleSubmit = useCallback(
    async (...args: unknown[]) => {
      const result = await execute(...args);
      if (result) {
        onSuccess?.(result);
      } else if (error) {
        onError?.(error);
      }
      return result;
    },
    [execute, onSuccess, onError, error]
  );

  return {
    data,
    loading,
    error,
    handleSubmit,
    reset,
  };
}

// Hook for handling data fetching
export function useFetch<T = unknown>(
  fetchFunction: (...args: unknown[]) => Promise<T>,
      dependencies: unknown[] = [],
  immediate = true
) {
  const { data, loading, error, execute, reset } = useAsync(fetchFunction, false);


  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    reset,
  };
} 