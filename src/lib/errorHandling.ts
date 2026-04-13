import { toast } from 'sonner';

// Error types
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

// Error class for application-specific errors
export class AppErrorClass extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly details?: any;
  public readonly context?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: any,
    context?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.context = context;
  }
}

// Error factory functions
export const createValidationError = (message: string, field?: string): AppErrorClass => {
  return new AppErrorClass(
    message,
    ErrorType.VALIDATION,
    ErrorSeverity.LOW,
    'VALIDATION_ERROR',
    { field },
    field ? `Validation error in field: ${field}` : 'Form validation error'
  );
};

export const createNetworkError = (message: string, details?: any): AppErrorClass => {
  return new AppErrorClass(
    message,
    ErrorType.NETWORK,
    ErrorSeverity.MEDIUM,
    'NETWORK_ERROR',
    details,
    'Network operation failed'
  );
};

export const createAuthError = (message: string, details?: any): AppErrorClass => {
  return new AppErrorClass(
    message,
    ErrorType.AUTHENTICATION,
    ErrorSeverity.HIGH,
    'AUTH_ERROR',
    details,
    'Authentication failed'
  );
};

export const createNotFoundError = (resource: string, id?: string): AppErrorClass => {
  return new AppErrorClass(
    `${resource}${id ? ` with ID: ${id}` : ''} not found`,
    ErrorType.NOT_FOUND,
    ErrorSeverity.MEDIUM,
    'NOT_FOUND',
    { resource, id },
    'Resource not found'
  );
};

export const createServerError = (message: string, details?: any): AppErrorClass => {
  return new AppErrorClass(
    message,
    ErrorType.SERVER,
    ErrorSeverity.HIGH,
    'SERVER_ERROR',
    details,
    'Server operation failed'
  );
};

// Error handling utilities
export const handleError = (error: unknown, context?: string): AppErrorClass => {
  if (error instanceof AppErrorClass) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('Network error') || error.message.includes('fetch')) {
      return createNetworkError(error.message, { originalError: error });
    }

    if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
      return createAuthError(error.message, { originalError: error });
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return createNotFoundError('Resource', context);
    }

    if (error.message.includes('validation') || error.message.includes('required')) {
      return createValidationError(error.message, context);
    }

    return new AppErrorClass(
      error.message,
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      undefined,
      { originalError: error },
      context
    );
  }

  return new AppErrorClass(
    'An unexpected error occurred',
    ErrorType.UNKNOWN,
    ErrorSeverity.MEDIUM,
    'UNKNOWN_ERROR',
    { originalError: error },
    context
  );
};

// Error reporting and user feedback
export const reportError = (error: AppErrorClass): void => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('App Error:', error);
  }

  // Log to external service in production (optional)
  // This could be integrated with error tracking services like Sentry
  if (process.env.NODE_ENV === 'production' && error.severity === ErrorSeverity.CRITICAL) {
    // Send to error tracking service
    // trackError(error);
  }

  // Show user-friendly message based on severity
  switch (error.severity) {
    case ErrorSeverity.LOW:
      // Don't show low severity errors to user
      break;
    case ErrorSeverity.MEDIUM:
      toast.error(error.message);
      break;
    case ErrorSeverity.HIGH:
      toast.error(error.message);
      break;
    case ErrorSeverity.CRITICAL:
      toast.error('A critical error occurred. Please refresh the page.');
      break;
  }
};

// Success feedback utilities
export const showSuccess = (message: string): void => {
  toast.success(message);
};

export const showInfo = (message: string): void => {
  toast.info(message);
};

export const showWarning = (message: string): void => {
  toast.warning(message);
};

// Error boundary utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppErrorClass) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

// Retry utilities
export const createRetryableOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
};

// Async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string,
  options?: {
    showSuccessMessage?: boolean;
    successMessage?: string;
    showError?: boolean;
  }
): Promise<T | null> => {
  try {
    const result = await operation();

    if (options?.showSuccessMessage && (options?.successMessage || result)) {
      showSuccess(options.successMessage || 'Operation completed successfully');
    }

    return result;
  } catch (error) {
    const appError = handleError(error, context);

    if (options?.showError !== false) {
      reportError(appError);
    }

    return null;
  }
};

// Form submission utilities
export const handleFormSubmission = async <T>(
  formData: Record<string, any>,
  submitFn: (data: Record<string, any>) => Promise<T>,
  options?: {
    successMessage?: string;
    resetForm?: () => void;
  }
): Promise<T | null> => {
  try {
    const result = await submitFn(formData);

    if (options?.successMessage) {
      showSuccess(options.successMessage);
    }

    if (options?.resetForm) {
      options.resetForm();
    }

    return result;
  } catch (error) {
    const appError = handleError(error, 'form submission');
    reportError(appError);
    return null;
  }
};

// API response handling
export const handleApiResponse = async <T>(response: Response, context?: string): Promise<T> => {
  if (!response.ok) {
    throw createNetworkError(
      `HTTP ${response.status}: ${response.statusText}`,
      { status: response.status, statusText: response.statusText }
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  if (contentType && contentType.includes('text/')) {
    return response.text() as unknown as Promise<T>;
  }

  return response.blob() as unknown as Promise<T>;
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = handleError(event.reason, 'unhandled promise rejection');
    reportError(error);
    event.preventDefault();
  });
}
