/**
 * AI Model Registry
 * Defines available models and their configurations
 */

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  modelName: string;  // HuggingFace model identifier
  dimension: number;
  type: 'embedding' | 'llm';
  modelPath?: string; // Optional ONNX model path
  quantized?: boolean;
}

/**
 * Registry of available AI models
 */
export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  'phi-3-mini': {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    description: 'Microsoft Phi-3 Mini - Small, efficient language model',
    modelName: 'microsoft/Phi-3-mini-4k-instruct',
    dimension: 3072,
    type: 'llm',
    quantized: true,
  },
  'phi-2': {
    id: 'phi-2',
    name: 'Phi-2',
    description: 'Microsoft Phi-2 - Compact language model',
    modelName: 'microsoft/phi-2',
    dimension: 2560,
    type: 'llm',
    quantized: true,
  },
  'nomic-embed': {
    id: 'nomic-embed',
    name: 'Nomic Embed Text',
    description: 'Nomic AI embedding model - High quality text embeddings',
    modelName: 'nomic-ai/nomic-embed-text-v1.5',
    dimension: 768,
    type: 'embedding',
    quantized: true,
  },
  'all-minilm': {
    id: 'all-minilm',
    name: 'All-MiniLM-L6',
    description: 'Sentence Transformers - Fast and efficient embeddings',
    modelName: 'sentence-transformers/all-MiniLM-L6-v2',
    dimension: 384,
    type: 'embedding',
    quantized: true,
  },
};

/**
 * Default model ID
 */
export const DEFAULT_MODEL_ID = 'phi-3-mini';

/**
 * Get model info by ID
 */
export function getModelById(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Get all available models
 */
export function getAllModels(): ModelInfo[] {
  return Object.keys(MODEL_REGISTRY).map(key => MODEL_REGISTRY[key]);
}

/**
 * Get models by type
 */
export function getModelsByType(type: 'embedding' | 'llm'): ModelInfo[] {
  return Object.keys(MODEL_REGISTRY)
    .map(key => MODEL_REGISTRY[key])
    .filter(model => model.type === type);
}

/**
 * Get default model
 */
export function getDefaultModel(): ModelInfo {
  const model = MODEL_REGISTRY[DEFAULT_MODEL_ID];
  if (!model) {
    throw new Error(`Default model ${DEFAULT_MODEL_ID} not found in registry`);
  }
  return model;
}
