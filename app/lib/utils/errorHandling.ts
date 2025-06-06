import { logger } from './logger';

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Business logic errors
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  INVALID_TIME_SLOT = 'INVALID_TIME_SLOT',
  PAST_DATE_BOOKING = 'PAST_DATE_BOOKING',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  context?: string;
  originalError?: Error;
  retryable?: boolean;
  timestamp: string;
}

export class BookingError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly context?: string;
  public readonly retryable: boolean;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    context?: string,
    retryable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    this.userMessage = userMessage;
    this.context = context;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();

    if (originalError) {
      this.stack = originalError.stack;
    }

    // Log the error
    logger.error(message, context, {
      code,
      userMessage,
      retryable,
      originalError: originalError?.message
    });
  }
}

// Error factory functions
export const createNetworkError = (originalError?: Error): BookingError => {
  return new BookingError(
    ErrorCode.NETWORK_ERROR,
    'Network request failed',
    'Unable to connect to the server. Please check your internet connection and try again.',
    'NETWORK',
    true,
    originalError
  );
};

export const createValidationError = (field: string, message: string): BookingError => {
  return new BookingError(
    ErrorCode.VALIDATION_ERROR,
    `Validation failed for ${field}: ${message}`,
    `Please check your ${field} and try again.`,
    'VALIDATION',
    false
  );
};

export const createBookingConflictError = (conflictingDates: string[]): BookingError => {
  const datesList = conflictingDates.join(', ');
  return new BookingError(
    ErrorCode.BOOKING_CONFLICT,
    `Booking conflict detected for dates: ${datesList}`,
    `The selected dates (${datesList}) are already booked. Please choose different dates.`,
    'BOOKING',
    false
  );
};

export const createDatabaseError = (operation: string, originalError?: Error): BookingError => {
  return new BookingError(
    ErrorCode.DATABASE_ERROR,
    `Database operation failed: ${operation}`,
    'A database error occurred. Please try again later.',
    'DATABASE',
    true,
    originalError
  );
};

export const createBookingNotFoundError = (bookingId?: string): BookingError => {
  const message = bookingId ? `Booking with ID ${bookingId} not found` : 'Booking not found';
  return new BookingError(
    ErrorCode.BOOKING_NOT_FOUND,
    message,
    'The requested booking could not be found. It may have been deleted or does not exist.',
    'BOOKING',
    false
  );
};

export const createApiError = (operation: string, originalError?: Error): BookingError => {
  return new BookingError(
    ErrorCode.API_ERROR,
    `API operation failed: ${operation}`,
    'A server error occurred. Please try again later.',
    'API',
    true,
    originalError
  );
};

// Error classification
export const classifyError = (error: unknown): BookingError => {
  if (error instanceof BookingError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createNetworkError(error);
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return new BookingError(
        ErrorCode.TIMEOUT_ERROR,
        'Request timed out',
        'The request took too long to complete. Please try again.',
        'NETWORK',
        true,
        error
      );
    }

    // API errors with status codes
    if (error.message.includes('401')) {
      return new BookingError(
        ErrorCode.UNAUTHORIZED,
        'Unauthorized access',
        'Please log in to continue.',
        'AUTH',
        false,
        error
      );
    }

    if (error.message.includes('403')) {
      return new BookingError(
        ErrorCode.FORBIDDEN,
        'Access forbidden',
        'You do not have permission to perform this action.',
        'AUTH',
        false,
        error
      );
    }

    if (error.message.includes('404')) {
      return new BookingError(
        ErrorCode.NOT_FOUND,
        'Resource not found',
        'The requested booking could not be found.',
        'API',
        false,
        error
      );
    }

    if (error.message.includes('409')) {
      return new BookingError(
        ErrorCode.CONFLICT,
        'Conflict detected',
        'There was a conflict with your request. Please refresh and try again.',
        'API',
        true,
        error
      );
    }

    // Supabase specific errors
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint') || error.message.includes('23505')) {
      return new BookingError(
        ErrorCode.BOOKING_CONFLICT,
        'Booking conflict detected',
        'This time slot is already booked. Please choose a different time.',
        'DATABASE',
        false,
        error
      );
    }

    // Supabase "no rows found" error
    if (error.message.includes('PGRST116') || error.message.includes('No rows found')) {
      return createBookingNotFoundError();
    }

    // Generic error with original message
    return new BookingError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      'An unexpected error occurred. Please try again.',
      'UNKNOWN',
      true,
      error
    );
  }

  // Non-Error objects
  return new BookingError(
    ErrorCode.UNKNOWN_ERROR,
    String(error),
    'An unexpected error occurred. Please try again.',
    'UNKNOWN',
    true
  );
};

// Error retry utility
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> => {
  let lastError: BookingError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempt ${attempt}/${maxRetries}`, context);
      return await operation();
    } catch (error) {
      lastError = classifyError(error);
      
      if (!lastError.retryable || attempt === maxRetries) {
        logger.error(`Failed after ${attempt} attempts`, context, lastError);
        throw lastError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, context, {
        error: lastError.message,
        retryable: lastError.retryable
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// User-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  const bookingError = classifyError(error);
  return bookingError.userMessage;
};

export const isRetryableError = (error: unknown): boolean => {
  const bookingError = classifyError(error);
  return bookingError.retryable;
};