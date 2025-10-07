/**
 * Types and interfaces for AI model loading engines
 */

/**
 * Supported loading engine types
 */
export enum LoadingEngineType {
  ONNX = 'onnx',
  WASM = 'wasm',
}

/**
 * Model loading configuration
 */
export interface ModelConfig {
  modelName: string;
  modelPath?: string;
  dimension: number;
  maxLength?: number;
}

/**
 * Base interface for all model loaders
 */
export interface ModelLoader {
  /**
   * Type of the loading engine
   */
  readonly type: LoadingEngineType;

  /**
   * Initialize the loader
   */
  initialize(config: ModelConfig): Promise<void>;

  /**
   * Generate embeddings for text
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Check if the loader is available and ready
   */
  isAvailable(): Promise<boolean>;

  /**
   * Clean up resources
   */
  dispose(): Promise<void>;
}

/**
 * Result of engine detection
 */
export interface EngineDetectionResult {
  engine: LoadingEngineType;
  available: boolean;
  reason?: string;
}
