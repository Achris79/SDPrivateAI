/**
 * WASM loader using transformers.js
 * Fallback loading engine when ONNX is not available
 */

import { pipeline, env } from '@xenova/transformers';
import { AIError, logger } from '../../../errors';
import { LoadingEngineType, ModelLoader, ModelConfig } from './types';

// Configure transformers.js environment
env.allowLocalModels = false;
env.useBrowserCache = true;

export class WasmLoader implements ModelLoader {
  readonly type = LoadingEngineType.WASM;
  
  private extractor: any = null;
  private config: ModelConfig | null = null;
  private initialized = false;

  /**
   * Initialize the WASM loader with transformers.js
   */
  async initialize(config: ModelConfig): Promise<void> {
    try {
      this.config = config;

      logger.info('WasmLoader: Initializing transformers.js', {
        modelName: config.modelName,
      });

      // Initialize the feature extraction pipeline
      // transformers.js will automatically download and cache the model
      this.extractor = await pipeline(
        'feature-extraction',
        config.modelName || 'nomic-ai/nomic-embed-text-v1.5',
        {
          quantized: true, // Use quantized model for better performance
        }
      );

      this.initialized = true;
      
      logger.info('WasmLoader: Initialized successfully', {
        modelName: config.modelName,
      });
    } catch (error) {
      this.initialized = false;
      throw new AIError('Failed to initialize WASM loader', {
        modelName: config.modelName,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate embeddings using transformers.js
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.initialized || !this.extractor || !this.config) {
      throw new AIError('WASM loader not initialized');
    }

    try {
      // Generate embeddings
      const output = await this.extractor(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Extract the embedding vector
      let embeddings: number[];
      
      if (output.data) {
        embeddings = Array.from(output.data);
      } else if (Array.isArray(output)) {
        embeddings = output;
      } else {
        throw new AIError('Unexpected output format from transformers.js');
      }

      // Verify dimension
      if (embeddings.length !== this.config.dimension) {
        logger.warn('WasmLoader: Dimension mismatch', {
          expected: this.config.dimension,
          actual: embeddings.length,
        });
      }

      return embeddings;
    } catch (error) {
      throw new AIError('Failed to generate embedding with WASM', {
        textLength: text.length,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check if transformers.js is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check if WebAssembly is available
      if (typeof WebAssembly === 'undefined') {
        return false;
      }

      // transformers.js should always be available if installed
      return true;
    } catch (error) {
      logger.warn('WasmLoader: Availability check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.extractor && typeof this.extractor.dispose === 'function') {
      await this.extractor.dispose();
    }
    this.extractor = null;
    this.initialized = false;
    this.config = null;
  }
}
