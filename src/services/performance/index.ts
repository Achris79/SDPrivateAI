/**
 * Performance Monitoring Service
 * Tracks and logs performance metrics for optimization
 */

import { logger } from '../../errors';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Performance monitor for tracking application performance
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private timers = new Map<string, number>();
  private maxMetrics = 1000; // Keep last 1000 metrics

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   * @param name - Operation name
   */
  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing an operation and record the metric
   * @param name - Operation name
   * @param metadata - Optional metadata to attach to the metric
   */
  end(name: string, metadata?: Record<string, any>): void {
    const startTime = this.timers.get(name);
    
    if (startTime === undefined) {
      logger.warn('Performance timer not found', { name });
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    logger.info('Performance metric recorded', {
      name,
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    });
  }

  /**
   * Measure an async operation
   * @param name - Operation name
   * @param fn - Async function to measure
   * @param metadata - Optional metadata
   * @returns Result of the function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   * @param name - Operation name
   * @param fn - Function to measure
   * @param metadata - Optional metadata
   * @returns Result of the function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   * @param name - Operation name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for an operation
   * @param name - Operation name
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get statistics for an operation
   * @param name - Operation name
   */
  getStats(name: string) {
    const metrics = this.getMetricsByName(name);
    
    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    durations.sort((a, b) => a - b);

    return {
      count: metrics.length,
      min: durations[0],
      max: durations[durations.length - 1],
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: durations[Math.floor(durations.length / 2)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
    logger.info('Performance metrics cleared');
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, any> {
    const operations = new Set(this.metrics.map(m => m.name));
    const summary: Record<string, any> = {};

    for (const op of operations) {
      summary[op] = this.getStats(op);
    }

    return summary;
  }
}

/**
 * Get the performance monitor singleton
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Decorator for measuring function performance
 * @param name - Metric name (defaults to function name)
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(
        metricName,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
