/**
 * Cache Service for performance optimization
 * Provides in-memory caching with TTL (Time To Live) support
 */

import { logger } from '../../errors';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

/**
 * Simple in-memory cache with TTL and size limits
 */
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl ?? 5 * 60 * 1000; // Default: 5 minutes
    this.maxSize = options.maxSize ?? 1000; // Default: 1000 entries
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      logger.info('Cache entry expired', { key });
      return null;
    }

    logger.info('Cache hit', { key });
    return entry.value as T;
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional TTL in milliseconds (overrides default)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Enforce max size by removing oldest entries
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        logger.warn('Cache size limit reached, removed oldest entry', { removedKey: firstKey });
      }
    }

    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
    logger.info('Cache entry set', { key, ttl: ttl ?? this.defaultTTL });
  }

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    logger.info('Cache entry deleted', { key });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { entriesCleared: size });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cache cleanup completed', { entriesRemoved: cleaned });
    }
  }
}

// Singleton instance for application-wide use
let cacheInstance: CacheService | null = null;

/**
 * Get the singleton cache instance
 */
export function getCache(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService({
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000,
    });

    // Run cleanup every minute
    setInterval(() => {
      cacheInstance?.cleanup();
    }, 60 * 1000);
  }
  return cacheInstance;
}

/**
 * Create a memoized version of an async function with caching
 * @param fn - Async function to memoize
 * @param keyGenerator - Function to generate cache key from arguments
 * @param ttl - Optional TTL for cache entries
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  const cache = getCache();

  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get<Awaited<ReturnType<T>>>(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  }) as T;
}
