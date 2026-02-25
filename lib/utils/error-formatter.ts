/**
 * Error Formatter Utility
 * 
 * Converts technical error messages into user-friendly, actionable messages.
 * Removes jargon and provides clear guidance on what to do next.
 */

export interface FormattedError {
  /** User-friendly error message */
  message: string;
  /** Title for error display */
  title?: string;
  /** Actionable suggestion */
  action?: string;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
  /** Can user retry? */
  retryable: boolean;
}

/**
 * Common error messages
 */
const ERROR_MESSAGES: Record<string, FormattedError> = {
  // Network Errors
  'Failed to fetch': {
    message: 'Could not connect to the server. Please check your internet connection and try again.',
    title: 'Connection Error',
    action: 'Check your connection',
    severity: 'error',
    retryable: true,
  },
  'NetworkError': {
    message: 'A network error occurred. Please check your connection and try again.',
    title: 'Network Error',
    action: 'Check your connection',
    severity: 'error',
    retryable: true,
  },
  'Timeout': {
    message: 'The request took too long to complete. Please try again.',
    title: 'Request Timeout',
    action: 'Try again',
    severity: 'warning',
    retryable: true,
  },

  // Authentication Errors
  'Unauthorized': {
    message: 'Please log in to continue.',
    title: 'Login Required',
    action: 'Log in',
    severity: 'warning',
    retryable: false,
  },
  'Forbidden': {
    message: "You don't have permission to access this resource.",
    title: 'Access Denied',
    action: 'Contact admin',
    severity: 'error',
    retryable: false,
  },
  'Session expired': {
    message: 'Your session has expired. Please log in again.',
    title: 'Session Expired',
    action: 'Log in again',
    severity: 'warning',
    retryable: false,
  },

  // Validation Errors
  'Validation failed': {
    message: 'Please check your input and try again.',
    title: 'Invalid Input',
    action: 'Review your input',
    severity: 'warning',
    retryable: true,
  },
  'Required field': {
    message: 'Please fill in all required fields.',
    title: 'Missing Information',
    action: 'Complete the form',
    severity: 'warning',
    retryable: true,
  },

  // Server Errors
  'Internal Server Error': {
    message: 'Something went wrong on our end. Our team has been notified.',
    title: 'Server Error',
    action: 'Try again later',
    severity: 'error',
    retryable: true,
  },
  'Service Unavailable': {
    message: 'The service is temporarily unavailable. Please try again in a few minutes.',
    title: 'Service Unavailable',
    action: 'Try again later',
    severity: 'error',
    retryable: true,
  },

  // Rate Limiting
  'Too Many Requests': {
    message: 'Too many requests. Please wait a moment and try again.',
    title: 'Rate Limit Exceeded',
    action: 'Wait and retry',
    severity: 'warning',
    retryable: true,
  },

  // Not Found
  'Not Found': {
    message: 'The requested resource could not be found.',
    title: 'Not Found',
    action: 'Check the URL',
    severity: 'warning',
    retryable: false,
  },
};

/**
 * Format error for user display
 */
export function formatError(
  error: Error | string,
  context?: string
): FormattedError {
  const errorMessage = typeof error === 'string' ? error : error.message;

  // Check for known error patterns
  for (const [pattern, formatted] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(pattern)) {
      return formatted;
    }
  }

  // Check HTTP status codes
  const statusMatch = errorMessage.match(/HTTP (\d{3})/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1]);
    return formatHttpError(status);
  }

  // Default error message
  return {
    message: context 
      ? `Unable to ${context}. Please try again.`
      : 'An unexpected error occurred. Please try again.',
    title: 'Error',
    action: 'Try again',
    severity: 'error',
    retryable: true,
  };
}

/**
 * Format HTTP status code errors
 */
function formatHttpError(status: number): FormattedError {
  switch (status) {
    case 400:
      return {
        message: 'The request was invalid. Please check your input and try again.',
        title: 'Invalid Request',
        action: 'Check your input',
        severity: 'warning',
        retryable: true,
      };
    
    case 401:
      return ERROR_MESSAGES['Unauthorized'];
    
    case 403:
      return ERROR_MESSAGES['Forbidden'];
    
    case 404:
      return ERROR_MESSAGES['Not Found'];
    
    case 429:
      return ERROR_MESSAGES['Too Many Requests'];
    
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES['Internal Server Error'];
    
    default:
      return {
        message: 'An error occurred. Please try again.',
        title: `Error ${status}`,
        action: 'Try again',
        severity: 'error',
        retryable: true,
      };
  }
}

/**
 * Format validation errors
 */
export function formatValidationError(
  field: string,
  rule: string,
  value?: any
): string {
  const fieldLabel = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  switch (rule) {
    case 'required':
      return `${fieldLabel} is required`;
    
    case 'email':
      return 'Please enter a valid email address';
    
    case 'phone':
      return 'Please enter a valid phone number';
    
    case 'min':
      return `${fieldLabel} must be at least ${value} characters`;
    
    case 'max':
      return `${fieldLabel} must be no more than ${value} characters`;
    
    case 'minValue':
      return `${fieldLabel} must be at least ${value}`;
    
    case 'maxValue':
      return `${fieldLabel} must be no more than ${value}`;
    
    case 'pattern':
      return `${fieldLabel} format is invalid`;
    
    case 'unique':
      return `${fieldLabel} is already taken`;
    
    default:
      return `${fieldLabel} is invalid`;
  }
}

/**
 * Format multiple validation errors
 */
export function formatValidationErrors(
  errors: Record<string, string | string[]>
): string[] {
  const messages: string[] = [];

  for (const [field, error] of Object.entries(errors)) {
    if (Array.isArray(error)) {
      messages.push(...error);
    } else {
      messages.push(error);
    }
  }

  return messages;
}

/**
 * Get error message for context
 */
export function getErrorMessage(
  error: Error | string,
  action: string
): string {
  const formatted = formatError(error, action);
  return formatted.message;
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: Error | string): boolean {
  const formatted = formatError(error);
  return formatted.retryable;
}

/**
 * Context-specific error messages
 */
export const contextErrorMessages = {
  // Order operations
  createOrder: 'create order',
  updateOrder: 'update order',
  deleteOrder: 'delete order',
  loadOrders: 'load orders',
  
  // Product operations
  createProduct: 'create product',
  updateProduct: 'update product',
  deleteProduct: 'delete product',
  loadProducts: 'load products',
  
  // Authentication
  login: 'log in',
  logout: 'log out',
  register: 'create account',
  
  // File operations
  uploadFile: 'upload file',
  deleteFile: 'delete file',
  
  // Search
  search: 'search',
  filter: 'filter results',
};

/**
 * Example usage:
 * 
 * try {
 *   await createOrder(data);
 * } catch (error) {
 *   const formatted = formatError(error, 'create order');
 *   toast.error(formatted.message);
 *   
 *   if (formatted.retryable) {
 *     // Show retry button
 *   }
 * }
 * 
 * // Validation errors
 * const errors = {
 *   email: 'Invalid email',
 *   phone: 'Invalid phone',
 * };
 * const messages = formatValidationErrors(errors);
 * // ['Invalid email', 'Invalid phone']
 */
