/**
 * Custom error classes for the application
 * Provides type-safe error handling with detailed context
 */

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Input validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', { ...details, field });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * AI/ML processing errors
 */
export class AIError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AI_ERROR', details);
    this.name = 'AIError';
    Object.setPrototypeOf(this, AIError.prototype);
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource} not found${id ? `: ${id}` : ''}`,
      'NOT_FOUND',
      { resource, id }
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error logger utility
 * Logs errors with context information for debugging
 */
export class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with context
   */
  log(error: Error, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    };

    if (error instanceof AppError) {
      console.error('[AppError]', errorInfo.timestamp, {
        code: error.code,
        message: error.message,
        details: error.details,
        context,
      });
    } else {
      console.error('[UnhandledError]', errorInfo);
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.warn('[Warning]', timestamp, message, context);
  }

  /**
   * Log info
   */
  info(message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.info('[Info]', timestamp, message, context);
  }
}

/**
 * Get the error logger singleton
 */
export const logger = ErrorLogger.getInstance();
