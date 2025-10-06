/**
 * Utility functions for the application
 * Implements defensive programming with input validation
 */

import { ValidationError } from '../errors';
import { validateNotEmpty } from './validation';

/**
 * Generate a unique ID
 * @returns Unique identifier string
 */
export function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Format date to locale string
 * @param date - Date to format
 * @param locale - Locale string (default: 'de-DE')
 * @returns Formatted date string
 * @throws {ValidationError} If date is invalid
 */
export function formatDate(date: Date, locale: string = 'de-DE'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError('Invalid date provided', 'date');
  }
  
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    throw new ValidationError(
      'Failed to format date',
      'locale',
      { 
        locale,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Debounce function to limit function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * @throws {ValidationError} If parameters are invalid
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  if (typeof func !== 'function') {
    throw new ValidationError('First parameter must be a function', 'func');
  }
  
  if (typeof wait !== 'number' || wait < 0 || !Number.isFinite(wait)) {
    throw new ValidationError('Wait time must be a positive number', 'wait');
  }
  
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 * @throws {ValidationError} If parameters are invalid
 */
export function truncateText(text: string, maxLength: number): string {
  validateNotEmpty(text, 'text');
  
  if (typeof maxLength !== 'number' || maxLength < 1 || !Number.isFinite(maxLength)) {
    throw new ValidationError('Max length must be a positive number', 'maxLength');
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}
