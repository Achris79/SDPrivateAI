/**
 * Service Container
 * Provides centralized service initialization and access
 * Implements singleton pattern for service instances
 */

import { logger } from '../errors';
import * as DatabaseService from './database';
import * as AIService from './ai';

/**
 * Service initialization state
 */
interface ServiceState {
  database: {
    initialized: boolean;
    instance: typeof DatabaseService | null;
  };
  ai: {
    initialized: boolean;
    instance: typeof AIService | null;
  };
}

/**
 * Service Container Class
 */
class ServiceContainer {
  private static instance: ServiceContainer;
  private state: ServiceState = {
    database: { initialized: false, instance: null },
    ai: { initialized: false, instance: null },
  };

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services
   */
  async initializeAll(): Promise<void> {
    await this.initializeDatabase();
    await this.initializeAI();
  }

  /**
   * Initialize database service
   */
  async initializeDatabase(): Promise<void> {
    if (this.state.database.initialized) {
      logger.warn('Database service already initialized');
      return;
    }

    try {
      await DatabaseService.initDatabase();
      this.state.database.initialized = true;
      this.state.database.instance = DatabaseService;
      logger.info('Database service initialized');
    } catch (error) {
      logger.log(
        error instanceof Error ? error : new Error('Unknown database initialization error'),
        { service: 'database' }
      );
      throw error;
    }
  }

  /**
   * Initialize AI service
   */
  async initializeAI(): Promise<void> {
    if (this.state.ai.initialized) {
      logger.warn('AI service already initialized');
      return;
    }

    try {
      // AI service doesn't require initialization yet
      this.state.ai.initialized = true;
      this.state.ai.instance = AIService;
      logger.info('AI service initialized');
    } catch (error) {
      logger.log(
        error instanceof Error ? error : new Error('Unknown AI initialization error'),
        { service: 'ai' }
      );
      throw error;
    }
  }

  /**
   * Get database service
   */
  getDatabase(): typeof DatabaseService {
    if (!this.state.database.initialized || !this.state.database.instance) {
      throw new Error('Database service not initialized. Call initializeDatabase() first.');
    }
    return this.state.database.instance;
  }

  /**
   * Get AI service
   */
  getAI(): typeof AIService {
    if (!this.state.ai.initialized || !this.state.ai.instance) {
      throw new Error('AI service not initialized. Call initializeAI() first.');
    }
    return this.state.ai.instance;
  }

  /**
   * Check if all services are initialized
   */
  isInitialized(): boolean {
    return this.state.database.initialized && this.state.ai.initialized;
  }

  /**
   * Cleanup all services
   */
  async cleanup(): Promise<void> {
    try {
      if (this.state.database.initialized) {
        await DatabaseService.closeDatabase();
        this.state.database.initialized = false;
        this.state.database.instance = null;
      }
      logger.info('Services cleaned up successfully');
    } catch (error) {
      logger.log(
        error instanceof Error ? error : new Error('Unknown cleanup error'),
        { action: 'cleanup' }
      );
    }
  }
}

/**
 * Export singleton instance
 */
export const serviceContainer = ServiceContainer.getInstance();

/**
 * Convenience functions
 */
export const initializeServices = () => serviceContainer.initializeAll();
export const getDatabaseService = () => serviceContainer.getDatabase();
export const getAIService = () => serviceContainer.getAI();
export const cleanupServices = () => serviceContainer.cleanup();
