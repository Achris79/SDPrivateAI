/**
 * Loading Engine Manager
 * Manages ONNX Runtime (primary) and WASM (fallback) loading engines
 */

import { AIError, logger } from '../../../errors';
import { LoadingEngineType, ModelLoader, ModelConfig, EngineDetectionResult } from './types';
import { OnnxLoader } from './onnx-loader';
import { WasmLoader } from './wasm-loader';

/**
 * Engine selection strategy
 */
export enum EngineStrategy {
  /** Prefer ONNX, fallback to WASM */
  AUTO = 'auto',
  /** Force ONNX only */
  ONNX_ONLY = 'onnx-only',
  /** Force WASM only */
  WASM_ONLY = 'wasm-only',
}

export interface LoadingEngineConfig extends ModelConfig {
  strategy?: EngineStrategy;
}

export class LoadingEngineManager {
  private currentLoader: ModelLoader | null = null;
  private static instance: LoadingEngineManager | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): LoadingEngineManager {
    if (!LoadingEngineManager.instance) {
      LoadingEngineManager.instance = new LoadingEngineManager();
    }
    return LoadingEngineManager.instance;
  }

  /**
   * Initialize the loading engine
   * Automatically selects the best available engine based on strategy
   */
  async initialize(config: LoadingEngineConfig): Promise<void> {
    const strategy = config.strategy || EngineStrategy.AUTO;

    logger.info('LoadingEngineManager: Initializing', { strategy });

    try {
      switch (strategy) {
        case EngineStrategy.ONNX_ONLY:
          await this.initializeOnnx(config);
          break;

        case EngineStrategy.WASM_ONLY:
          await this.initializeWasm(config);
          break;

        case EngineStrategy.AUTO:
        default:
          await this.initializeAuto(config);
          break;
      }

      logger.info('LoadingEngineManager: Initialized successfully', {
        engine: this.currentLoader?.type,
      });
    } catch (error) {
      throw new AIError('Failed to initialize loading engine', {
        strategy,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Initialize with AUTO strategy (ONNX primary, WASM fallback)
   */
  private async initializeAuto(config: LoadingEngineConfig): Promise<void> {
    // Try ONNX first
    if (config.modelPath) {
      try {
        logger.info('LoadingEngineManager: Attempting ONNX loader');
        await this.initializeOnnx(config);
        return;
      } catch (error) {
        logger.warn('LoadingEngineManager: ONNX loader failed, falling back to WASM', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      logger.info('LoadingEngineManager: No model path provided, skipping ONNX');
    }

    // Fallback to WASM
    logger.info('LoadingEngineManager: Using WASM fallback');
    await this.initializeWasm(config);
  }

  /**
   * Initialize ONNX loader
   */
  private async initializeOnnx(config: ModelConfig): Promise<void> {
    const loader = new OnnxLoader();
    
    const available = await loader.isAvailable();
    if (!available) {
      throw new AIError('ONNX Runtime is not available');
    }

    await loader.initialize(config);
    this.currentLoader = loader;
  }

  /**
   * Initialize WASM loader
   */
  private async initializeWasm(config: ModelConfig): Promise<void> {
    const loader = new WasmLoader();
    
    const available = await loader.isAvailable();
    if (!available) {
      throw new AIError('WASM loader is not available');
    }

    await loader.initialize(config);
    this.currentLoader = loader;
  }

  /**
   * Generate embeddings using the current loader
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.currentLoader) {
      throw new AIError('Loading engine not initialized');
    }

    return await this.currentLoader.generateEmbedding(text);
  }

  /**
   * Get the current engine type
   */
  getCurrentEngine(): LoadingEngineType | null {
    return this.currentLoader?.type || null;
  }

  /**
   * Detect available engines
   */
  async detectEngines(): Promise<EngineDetectionResult[]> {
    const results: EngineDetectionResult[] = [];

    // Check ONNX
    const onnxLoader = new OnnxLoader();
    const onnxAvailable = await onnxLoader.isAvailable();
    results.push({
      engine: LoadingEngineType.ONNX,
      available: onnxAvailable,
      reason: onnxAvailable ? 'ONNX Runtime Web is available' : 'ONNX Runtime Web is not available',
    });

    // Check WASM
    const wasmLoader = new WasmLoader();
    const wasmAvailable = await wasmLoader.isAvailable();
    results.push({
      engine: LoadingEngineType.WASM,
      available: wasmAvailable,
      reason: wasmAvailable ? 'transformers.js is available' : 'transformers.js is not available',
    });

    return results;
  }

  /**
   * Dispose the current loader
   */
  async dispose(): Promise<void> {
    if (this.currentLoader) {
      await this.currentLoader.dispose();
      this.currentLoader = null;
    }
  }

  /**
   * Reset the singleton instance
   */
  static reset(): void {
    if (LoadingEngineManager.instance) {
      LoadingEngineManager.instance.dispose();
      LoadingEngineManager.instance = null;
    }
  }
}
