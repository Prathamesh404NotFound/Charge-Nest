import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsyncOperation<T = any>(options?: UseAsyncOperationOptions<T>) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));
    
    try {
      const result = await asyncFn();
      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
      
      throw error;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

export function useAsyncOperationWithRetry<T = any>(maxRetries = 3, options?: UseAsyncOperationOptions<T>) {
  const [retryCount, setRetryCount] = useState(0);
  const { execute, reset, ...state } = useAsyncOperation<T>(options);

  const executeWithRetry = useCallback(async (asyncFn: () => Promise<T>) => {
    try {
      const result = await execute(asyncFn);
      setRetryCount(0);
      return result;
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return executeWithRetry(asyncFn);
      }
      throw error;
    }
  }, [execute, retryCount, maxRetries]);

  return {
    ...state,
    execute: executeWithRetry,
    reset,
    retryCount,
  };
}
