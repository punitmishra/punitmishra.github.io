/**
 * Error Handler Utilities
 * Centralized error handling and retry logic
 */

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error) {
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      type: 'network',
      retryable: true,
    };
  }

  const status = error.response.status;
  
  switch (status) {
    case 401:
      return {
        message: 'Authentication required. Please refresh the page.',
        type: 'auth',
        retryable: false,
      };
    case 403:
      return {
        message: 'Access forbidden. You may have reached the rate limit.',
        type: 'rate_limit',
        retryable: true,
      };
    case 404:
      return {
        message: 'Resource not found.',
        type: 'not_found',
        retryable: false,
      };
    case 429:
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        type: 'rate_limit',
        retryable: true,
      };
    case 500:
    case 502:
    case 503:
      return {
        message: 'Server error. Please try again later.',
        type: 'server',
        retryable: true,
      };
    default:
      return {
        message: 'An unexpected error occurred. Please try again.',
        type: 'unknown',
        retryable: true,
      };
  }
}

/**
 * Error boundary component data
 */
export class ErrorBoundary {
  constructor() {
    this.errors = [];
  }

  captureError(error, errorInfo = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...errorInfo,
    };
    
    this.errors.push(errorData);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error captured:', errorData);
    }
    
    // In production, you could send to error tracking service
    // e.g., Sentry, LogRocket, etc.
    
    return errorData;
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorBoundary = new ErrorBoundary();

/**
 * Safe async wrapper with error handling
 */
export async function safeAsync(fn, fallback = null, onError = null) {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      errorBoundary.captureError(error);
    }
    return fallback;
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
  const handled = handleApiError(error);
  return handled.retryable;
}

