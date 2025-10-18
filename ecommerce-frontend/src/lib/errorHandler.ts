import toast from 'react-hot-toast';
// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
  details?: {
    name: string;
    code: string;
    url: string;
    method: string;
    timestamp: string;
  };
}

// Custom error class
export class CustomError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Error handler function
export const handleApiError = (error: unknown): never => {
  let customError: CustomError;

  // Axios error
  if (error && typeof error === 'object' && 'response' in error && error.response) {
    const { status, data } = error.response as { status: number; data: { message?: string; error?: { message?: string } } };
    
    // Handle different status codes
    switch (status) {
      case 400:
        customError = new CustomError(
          data?.error?.message || 'Bad request',
          400,
          'BAD_REQUEST',
          data?.error
        );
        break;
      
      case 401:
        customError = new CustomError(
          data?.error?.message || 'Unauthorized',
          401,
          'UNAUTHORIZED',
          data?.error
        );
        break;
      
      case 403:
        customError = new CustomError(
          data?.error?.message || 'Forbidden',
          403,
          'FORBIDDEN',
          data?.error
        );
        break;
      
      case 404:
        customError = new CustomError(
          data?.error?.message || 'Resource not found',
          404,
          'NOT_FOUND',
          data?.error
        );
        break;
      
      case 409:
        customError = new CustomError(
          data?.error?.message || 'Conflict',
          409,
          'CONFLICT',
          data?.error
        );
        break;
      
      case 422:
        customError = new CustomError(
          data?.error?.message || 'Validation failed',
          422,
          'VALIDATION_ERROR',
          data?.error
        );
        break;
      
      case 429:
        customError = new CustomError(
          data?.error?.message || 'Too many requests',
          429,
          'RATE_LIMIT',
          data?.error
        );
        break;
      
      case 500:
        customError = new CustomError(
          data?.error?.message || 'Internal server error',
          500,
          'INTERNAL_ERROR',
          data?.error
        );
        break;
      
      case 503:
        customError = new CustomError(
          data?.error?.message || 'Service unavailable',
          503,
          'SERVICE_UNAVAILABLE',
          data?.error
        );
        break;
      
      default:
        customError = new CustomError(
          data?.error?.message || 'An unexpected error occurred',
          status,
          'UNKNOWN_ERROR',
          data?.error
        );
    }
    // Show toast for error message
    if (data?.message) {
      toast.error(data.message);
    } else if (data?.error?.message) {
      toast.error(data.error.message);
    }
  }
  // Network error
  else if (error && typeof error === 'object' && 'request' in error && error.request) {
    customError = new CustomError(
      'Network error. Please check your connection.',
      0,
      'NETWORK_ERROR'
    );
    toast.error('Network error. Please check your connection.');
  }
  // Other errors
  else {
    customError = new CustomError(
      (error && typeof error === 'object' && 'message' in error ? String(error.message) : null) || 'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR'
    );
    toast.error((error && typeof error === 'object' && 'message' in error ? String(error.message) : null) || 'An unexpected error occurred');
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error, {
      message: customError?.message,
      statusCode: customError?.statusCode,
      code: customError?.code,
      details: customError?.details,
    });
  }

  throw customError;
};

// Validation error handler
export const handleValidationError = (errors: ValidationError[]): never => {
  const message = errors.map(err => `${err.field}: ${err.message}`).join(', ');
  throw new CustomError(message, 422, 'VALIDATION_ERROR', errors);
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showInfoToast = (message: string) => {
  toast(message);
};

export const showWarnToast = (message: string) => {
  toast(message);
};

// Error boundary helper
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof CustomError) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'response' in error && error.response && 
      typeof error.response === 'object' && 'data' in error.response && error.response.data &&
      typeof error.response.data === 'object' && 'error' in error.response.data && error.response.data.error &&
      typeof error.response.data.error === 'object' && 'message' in error.response.data.error) {
    return String(error.response.data.error.message);
  }
  
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
};

// Retry mechanism
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof CustomError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Don't retry on network errors if it's the last attempt
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError;
};

// Error reporting (for production)
export const reportError = (error: unknown, context?: unknown) => {
  if (process.env.NODE_ENV === 'production') {
    // Send error to your error reporting service (Sentry, LogRocket, etc.)
    console.error('Error reported:', { error, context });
    
    // Example with Sentry:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureException(error, { extra: context });
  }
}; 