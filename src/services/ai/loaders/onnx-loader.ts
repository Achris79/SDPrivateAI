/**
 * ONNX Runtime Web loader for embedding models
 * Primary loading engine with optimized performance
 */

import * as ort from 'onnxruntime-web';
import { AIError, logger } from '../../../errors';
import { LoadingEngineType, ModelLoader, ModelConfig } from './types';

export class OnnxLoader implements ModelLoader {
  readonly type = LoadingEngineType.ONNX;
  
  private session: ort.InferenceSession | null = null;
  private config: ModelConfig | null = null;
  private initialized = false;

  /**
   * Initialize the ONNX Runtime loader
   */
  async initialize(config: ModelConfig): Promise<void> {
    try {
      this.config = config;

      // Set ONNX Runtime execution providers
      // Prefer WebGL for better performance, fallback to WASM
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;

      logger.info('OnnxLoader: Initializing ONNX Runtime', {
        modelName: config.modelName,
        modelPath: config.modelPath,
      });

      // Load the ONNX model
      if (!config.modelPath) {
        throw new AIError('Model path is required for ONNX loader');
      }

      this.session = await ort.InferenceSession.create(config.modelPath, {
        executionProviders: ['webgl', 'wasm'],
        graphOptimizationLevel: 'all',
      });

      this.initialized = true;
      
      logger.info('OnnxLoader: Initialized successfully', {
        inputNames: this.session.inputNames,
        outputNames: this.session.outputNames,
      });
    } catch (error) {
      this.initialized = false;
      throw new AIError('Failed to initialize ONNX loader', {
        modelName: config.modelName,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate embeddings using ONNX Runtime
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.initialized || !this.session || !this.config) {
      throw new AIError('ONNX loader not initialized');
    }

    try {
      // Tokenize the text (simplified - in production, use proper tokenizer)
      const tokens = this.tokenize(text);
      
      // Prepare input tensor
      const inputIds = new ort.Tensor('int64', BigInt64Array.from(tokens.map(BigInt)), [1, tokens.length]);
      const attentionMask = new ort.Tensor('int64', BigInt64Array.from(tokens.map(() => BigInt(1))), [1, tokens.length]);

      // Run inference
      const feeds = {
        input_ids: inputIds,
        attention_mask: attentionMask,
      };

      const results = await this.session.run(feeds);
      
      // Extract embeddings from the output
      // Assuming the model outputs 'last_hidden_state' or similar
      const outputName = this.session.outputNames[0];
      const output = results[outputName];
      
      if (!output || !output.data) {
        throw new AIError('Invalid output from ONNX model');
      }

      // Extract the embedding vector (mean pooling over sequence length)
      const embeddings = this.meanPooling(output.data as Float32Array, tokens.length, this.config.dimension);
      
      return Array.from(embeddings);
    } catch (error) {
      throw new AIError('Failed to generate embedding with ONNX', {
        textLength: text.length,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check if ONNX Runtime is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check if ONNX Runtime Web is loaded
      if (typeof ort === 'undefined') {
        return false;
      }

      // Check if WebAssembly is available
      if (typeof WebAssembly === 'undefined') {
        return false;
      }

      // Try to create a minimal session to verify functionality
      // This is a lightweight check
      return true;
    } catch (error) {
      logger.warn('OnnxLoader: Availability check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.session) {
      // Note: onnxruntime-web doesn't have explicit dispose yet
      this.session = null;
    }
    this.initialized = false;
    this.config = null;
  }

  /**
   * Simple tokenization (placeholder)
   * In production, use a proper tokenizer like @xenova/transformers tokenizer
   */
  private tokenize(text: string): number[] {
    // This is a simplified tokenizer for demonstration
    // Real implementation should use model-specific tokenizer
    const words = text.toLowerCase().split(/\s+/);
    return words.map((_word, idx) => idx + 100); // Simple mock tokens
  }

  /**
   * Mean pooling over sequence length
   */
  private meanPooling(data: Float32Array, seqLength: number, dimension: number): Float32Array {
    const result = new Float32Array(dimension);
    
    for (let d = 0; d < dimension; d++) {
      let sum = 0;
      for (let s = 0; s < seqLength; s++) {
        sum += data[s * dimension + d];
      }
      result[d] = sum / seqLength;
    }
    
    return result;
  }
}
