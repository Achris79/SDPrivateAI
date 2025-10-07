/**
 * Retry utility for resilient operations
 * Implements retry logic with exponential backoff
 */

import { logger } from '../errors';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @returns Result of the operation
 * @throws Last error if all retries fail
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxAttempts) {
        logger.log(lastError, {
          operation: 'retry',
          attempts: attempt,
          message: 'All retry attempts failed',
        });
        throw lastError;
      }

      logger.warn('Operation failed, retrying', {
        attempt,
        maxAttempts,
        delay,
        error: lastError.message,
      });

      onRetry?.(lastError, attempt);

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures before opening
  successThreshold?: number; // Number of successes to close from half-open
  timeout?: number; // Time in ms before attempting to close
}

/**
 * Circuit breaker pattern implementation
 * Prevents cascading failures by stopping requests to failing services
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;
  
  constructor(
    private readonly options: CircuitBreakerOptions = {}
  ) {
    this.options.failureThreshold = options.failureThreshold ?? 5;
    this.options.successThreshold = options.successThreshold ?? 2;
    this.options.timeout = options.timeout ?? 60000;
  }

  /**
   * Execute operation through circuit breaker
   * @param operation - Async function to execute
   * @returns Result of operation
   * @throws Error if circuit is open or operation fails
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        const error = new Error('Circuit breaker is OPEN');
        logger.warn('Circuit breaker blocked request', {
          state: this.state,
          nextAttempt: new Date(this.nextAttempt).toISOString(),
        });
        throw error;
      }
      
      // Try to recover
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
      logger.info('Circuit breaker entering HALF_OPEN state');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.options.successThreshold!) {
        this.state = CircuitState.CLOSED;
        logger.info('Circuit breaker closed', {
          successCount: this.successCount,
        });
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold!) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.timeout!;
      
      logger.warn('Circuit breaker opened', {
        failureCount: this.failureCount,
        nextAttempt: new Date(this.nextAttempt).toISOString(),
      });
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
    logger.info('Circuit breaker manually reset');
  }
}
