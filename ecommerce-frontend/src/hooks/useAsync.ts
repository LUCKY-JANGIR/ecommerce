'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { CustomError, handleApiError } from '@/lib/errorHandler';
import toast from 'react-hot-toast';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: CustomError | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false,
  showToast = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
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
export function useFormSubmit<T = any>(
  submitFunction: (...args: any[]) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: CustomError) => void
) {
  const { data, loading, error, execute, reset } = useAsync(submitFunction, false, false);

  const handleSubmit = useCallback(
    async (...args: any[]) => {
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
export function useFetch<T = any>(
  fetchFunction: (...args: any[]) => Promise<T>,
  dependencies: any[] = [],
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