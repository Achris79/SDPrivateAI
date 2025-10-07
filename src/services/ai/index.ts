/**
 * AI Service for embedding generation and model management
 * 
 * Uses nomic-embed-text model for local embedding generation (768 dimensions)
 * 
 * Loading Engine Architecture:
 * - Primary: ONNX Runtime Web (optimized performance)
 * - Fallback: WASM via transformers.js (compatibility)
 * 
 * Security features:
 * - Input validation on all operations
 * - Defensive error handling
 * - Safe vector operations
 */

import { AIError, logger } from '../../errors';
import { validateNotEmpty, validateArray } from '../../utils/validation';
import { LoadingEngineManager, EngineStrategy, LoadingEngineType } from './loaders';

// Re-export types for convenience
export { LoadingEngineType, EngineStrategy } from './loaders';

export interface EmbeddingResult {
  vector: number[];
  dimensionality: number;
}

/**
 * AI Service Configuration
 */
export interface AIServiceConfig {
  modelName?: string;
  modelPath?: string;
  dimension?: number;
  strategy?: EngineStrategy;
}

/**
 * Default configuration for nomic-embed-text
 */
const DEFAULT_CONFIG: AIServiceConfig = {
  modelName: 'nomic-ai/nomic-embed-text-v1.5',
  dimension: 768,
  strategy: EngineStrategy.AUTO,
};

let engineManager: LoadingEngineManager | null = null;
let isInitialized = false;

/**
 * Initialize the AI service with loading engine
 * @param config - Optional configuration
 */
export async function initializeAI(config: AIServiceConfig = {}): Promise<void> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    logger.info('AI Service: Initializing', {
      modelName: finalConfig.modelName,
      strategy: finalConfig.strategy,
    });

    engineManager = LoadingEngineManager.getInstance();
    await engineManager.initialize({
      modelName: finalConfig.modelName!,
      modelPath: finalConfig.modelPath,
      dimension: finalConfig.dimension!,
      strategy: finalConfig.strategy,
    });

    isInitialized = true;
    
    logger.info('AI Service: Initialized successfully', {
      engine: engineManager.getCurrentEngine(),
    });
  } catch (error) {
    isInitialized = false;
    throw new AIError('Failed to initialize AI service', {
      originalError: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get current loading engine type
 */
export function getCurrentEngine(): LoadingEngineType | null {
  return engineManager?.getCurrentEngine() || null;
}

/**
 * Dispose AI service resources
 */
export async function disposeAI(): Promise<void> {
  if (engineManager) {
    await engineManager.dispose();
    engineManager = null;
    isInitialized = false;
  }
}


/**
 * Generate embeddings for text
 * @param text - Text to generate embeddings for
 * @returns Promise with embedding vector
 * @throws {AIError} If embedding generation fails
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    validateNotEmpty(text, 'text');
    
    // Auto-initialize if not already initialized
    if (!isInitialized || !engineManager) {
      logger.info('AI Service: Auto-initializing with default config');
      await initializeAI();
    }

    if (!engineManager) {
      throw new AIError('Loading engine not available');
    }
    
    // Generate embedding using the current engine
    const vector = await engineManager.generateEmbedding(text);
    
    return {
      vector,
      dimensionality: vector.length,
    };
  } catch (error) {
    if (error instanceof AIError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new AIError(
      'Failed to generate embedding',
      { 
        textLength: text.length,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between 0 and 1
 * @throws {AIError} If vectors are invalid or incompatible
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  try {
    validateArray(a, 'vector a', 1);
    validateArray(b, 'vector b', 1);
    
    if (a.length !== b.length) {
      throw new AIError(
        'Vectors must have same length',
        { lengthA: a.length, lengthB: b.length }
      );
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) {
        throw new AIError(
          'Vectors contain invalid values',
          { index: i, valueA: a[i], valueB: b[i] }
        );
      }
      
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    
    if (denominator === 0) {
      throw new AIError('Cannot calculate similarity for zero vectors');
    }
    
    return dotProduct / denominator;
  } catch (error) {
    if (error instanceof AIError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new AIError(
      'Failed to calculate cosine similarity',
      { 
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}
