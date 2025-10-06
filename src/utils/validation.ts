/**
 * Input validation utilities
 * Provides defensive validation with security focus
 */

import { ValidationError, SecurityError } from '../errors';

/**
 * Validate that a string is not empty
 */
export function validateNotEmpty(value: string, fieldName: string): void {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  if (value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
  }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 10000
): void {
  validateNotEmpty(value, fieldName);
  
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName,
      { minLength, actualLength: value.length }
    );
  }
  
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} characters`,
      fieldName,
      { maxLength, actualLength: value.length }
    );
  }
}

/**
 * Sanitize string input to prevent XSS
 * Removes potentially dangerous characters
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = value.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Validate ID format
 * IDs should be alphanumeric with hyphens only
 */
export function validateId(id: string, fieldName: string = 'id'): void {
  validateNotEmpty(id, fieldName);
  
  // Allow alphanumeric characters, hyphens, and underscores
  const idPattern = /^[a-zA-Z0-9_-]+$/;
  
  if (!idPattern.test(id)) {
    throw new ValidationError(
      `${fieldName} contains invalid characters. Only alphanumeric, hyphens, and underscores allowed`,
      fieldName
    );
  }
  
  if (id.length > 255) {
    throw new ValidationError(
      `${fieldName} is too long (max 255 characters)`,
      fieldName
    );
  }
}

/**
 * Validate SQL-like patterns to prevent injection
 * Checks for suspicious SQL keywords in user input
 */
export function validateNoSqlInjection(value: string, fieldName: string): void {
  const suspiciousPatterns = [
    /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b).*\b(TABLE|DATABASE|SCHEMA)\b/i,
    /--/,  // SQL comment
    /;.*(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/i,
    /\bEXEC\b.*\(/i,
    /\bSCRIPT\b.*>/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(value)) {
      throw new SecurityError(
        `${fieldName} contains suspicious content`,
        { field: fieldName }
      );
    }
  }
}

/**
 * Validate JSON string
 */
export function validateJson(value: string, fieldName: string): void {
  try {
    JSON.parse(value);
  } catch (error) {
    throw new ValidationError(
      `${fieldName} is not valid JSON`,
      fieldName,
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Validate array input
 */
export function validateArray(
  value: any,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 1000
): void {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName);
  }
  
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must have at least ${minLength} items`,
      fieldName,
      { minLength, actualLength: value.length }
    );
  }
  
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} items`,
      fieldName,
      { maxLength, actualLength: value.length }
    );
  }
}

/**
 * Validate number input
 */
export function validateNumber(
  value: any,
  fieldName: string,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER
): void {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
  }
  
  if (value < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min}`,
      fieldName,
      { min, actual: value }
    );
  }
  
  if (value > max) {
    throw new ValidationError(
      `${fieldName} must not exceed ${max}`,
      fieldName,
      { max, actual: value }
    );
  }
}

/**
 * Validate object is not null/undefined
 */
export function validateExists<T>(value: T | null | undefined, fieldName: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

/**
 * Safe parse JSON with default value
 */
export function safeJsonParse<T>(value: string | null, defaultValue: T): T {
  if (!value) {
    return defaultValue;
  }
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}
