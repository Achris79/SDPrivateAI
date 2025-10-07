/**
 * AI Service for embedding generation and model management
 * 
 * Supports multiple AI models with flexible switching:
 * - Default: Microsoft Phi-3 Mini (small, efficient language model)
 * - Alternative models: Phi-2, Nomic Embed Text, All-MiniLM
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
import { getDefaultModel, getModelById, getAllModels, getModelsByType, ModelInfo, MODEL_REGISTRY, DEFAULT_MODEL_ID } from './models';

// Re-export types for convenience
export { LoadingEngineType, EngineStrategy } from './loaders';
export { ModelInfo, MODEL_REGISTRY, DEFAULT_MODEL_ID } from './models';
export { getDefaultModel, getModelById, getAllModels, getModelsByType } from './models';

export interface EmbeddingResult {
  vector: number[];
  dimensionality: number;
}

/**
 * AI Service Configuration
 */
export interface AIServiceConfig {
  modelId?: string;      // Model ID from registry (preferred)
  modelName?: string;    // Direct HuggingFace model name (fallback)
  modelPath?: string;
  dimension?: number;
  strategy?: EngineStrategy;
}

/**
 * Default configuration using Phi-3 Mini
 */
const DEFAULT_CONFIG: AIServiceConfig = {
  modelId: DEFAULT_MODEL_ID,
  strategy: EngineStrategy.AUTO,
};

let engineManager: LoadingEngineManager | null = null;
let isInitialized = false;
let currentModelInfo: ModelInfo | null = null;

/**
 * Initialize the AI service with loading engine
 * @param config - Optional configuration
 */
export async function initializeAI(config: AIServiceConfig = {}): Promise<void> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Resolve model info from registry or use provided config
    let modelInfo: ModelInfo;
    if (finalConfig.modelId) {
      const registryModel = getModelById(finalConfig.modelId);
      if (!registryModel) {
        throw new AIError(`Model with ID '${finalConfig.modelId}' not found in registry`);
      }
      modelInfo = registryModel;
    } else if (finalConfig.modelName) {
      // Fallback: create model info from provided config
      modelInfo = {
        id: 'custom',
        name: 'Custom Model',
        description: 'Custom model configuration',
        modelName: finalConfig.modelName,
        dimension: finalConfig.dimension || 768,
        type: 'embedding',
        modelPath: finalConfig.modelPath,
      };
    } else {
      // Use default model
      modelInfo = getDefaultModel();
    }
    
    logger.info('AI Service: Initializing', {
      modelId: modelInfo.id,
      modelName: modelInfo.modelName,
      strategy: finalConfig.strategy,
    });

    engineManager = LoadingEngineManager.getInstance();
    await engineManager.initialize({
      modelName: modelInfo.modelName,
      modelPath: modelInfo.modelPath || finalConfig.modelPath,
      dimension: modelInfo.dimension,
      strategy: finalConfig.strategy,
    });

    isInitialized = true;
    currentModelInfo = modelInfo;
    
    logger.info('AI Service: Initialized successfully', {
      modelId: modelInfo.id,
      engine: engineManager.getCurrentEngine(),
    });
  } catch (error) {
    isInitialized = false;
    currentModelInfo = null;
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
 * Get current model information
 */
export function getCurrentModel(): ModelInfo | null {
  return currentModelInfo;
}

/**
 * Switch to a different model
 * @param modelId - Model ID from registry or custom config
 * @param config - Optional additional configuration
 */
export async function switchModel(modelId: string, config: Partial<AIServiceConfig> = {}): Promise<void> {
  logger.info('AI Service: Switching model', { modelId });
  
  // Dispose current model
  await disposeAI();
  
  // Initialize with new model
  await initializeAI({
    modelId,
    ...config,
  });
  
  logger.info('AI Service: Model switched successfully', { 
    modelId,
    newModel: currentModelInfo?.name,
  });
}

/**
 * Dispose AI service resources
 */
export async function disposeAI(): Promise<void> {
  if (engineManager) {
    await engineManager.dispose();
    engineManager = null;
    isInitialized = false;
    currentModelInfo = null;
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
