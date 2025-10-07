# AI Model Selection - Flexible Model Management

## Overview

The AI service now supports flexible model selection with multiple pre-configured models and the ability to switch between them at runtime. The default model is **Microsoft Phi-3 Mini**, a small and efficient language model.

## Available Models

### Language Models (LLM)

1. **Phi-3 Mini** (Default) - `phi-3-mini`
   - Microsoft's Phi-3 Mini - Small, efficient language model
   - Dimension: 3072
   - HuggingFace: `microsoft/Phi-3-mini-4k-instruct`
   - Quantized for better performance

2. **Phi-2** - `phi-2`
   - Microsoft's Phi-2 - Compact language model
   - Dimension: 2560
   - HuggingFace: `microsoft/phi-2`
   - Quantized for better performance

### Embedding Models

3. **Nomic Embed Text** - `nomic-embed`
   - High quality text embeddings
   - Dimension: 768
   - HuggingFace: `nomic-ai/nomic-embed-text-v1.5`
   - Quantized for better performance

4. **All-MiniLM-L6** - `all-minilm`
   - Sentence Transformers - Fast and efficient
   - Dimension: 384
   - HuggingFace: `sentence-transformers/all-MiniLM-L6-v2`
   - Quantized for better performance

## Usage

### Basic Usage (Default Model)

```typescript
import { initializeAI, generateEmbedding } from './services/ai';

// Initialize with default model (Phi-3 Mini)
await initializeAI();

// Generate embeddings
const result = await generateEmbedding('Your text here');
console.log(result.vector.length); // 3072 (Phi-3 Mini dimension)
```

### Initialize with Specific Model

```typescript
import { initializeAI } from './services/ai';

// Initialize with Nomic Embed model
await initializeAI({ modelId: 'nomic-embed' });

// Initialize with Phi-2 model
await initializeAI({ modelId: 'phi-2' });

// Initialize with All-MiniLM model
await initializeAI({ modelId: 'all-minilm' });
```

### Switch Models at Runtime

```typescript
import { initializeAI, switchModel, getCurrentModel } from './services/ai';

// Start with default model
await initializeAI();
console.log(getCurrentModel()?.name); // "Phi-3 Mini"

// Switch to Nomic Embed
await switchModel('nomic-embed');
console.log(getCurrentModel()?.name); // "Nomic Embed Text"

// Switch to another model
await switchModel('phi-2');
console.log(getCurrentModel()?.name); // "Phi-2"
```

### List Available Models

```typescript
import { getAllModels, getModelsByType } from './services/ai';

// Get all available models
const allModels = getAllModels();
allModels.forEach(model => {
  console.log(`${model.name} - ${model.description}`);
});

// Get only LLM models
const llmModels = getModelsByType('llm');

// Get only embedding models
const embeddingModels = getModelsByType('embedding');
```

### Get Current Model Info

```typescript
import { getCurrentModel } from './services/ai';

const model = getCurrentModel();
if (model) {
  console.log('Model Name:', model.name);
  console.log('Model ID:', model.id);
  console.log('Dimension:', model.dimension);
  console.log('Type:', model.type);
  console.log('Description:', model.description);
}
```

### Use Custom Model

```typescript
import { initializeAI, EngineStrategy } from './services/ai';

// Use a custom model not in the registry
await initializeAI({
  modelName: 'your-org/your-model',
  dimension: 512,
  strategy: EngineStrategy.WASM_ONLY,
});
```

## Model Download

Models are automatically downloaded from HuggingFace on first use:

1. **First Time**: The model is downloaded and cached by the browser
2. **Subsequent Uses**: The cached model is loaded instantly
3. **Storage**: Models are stored in the browser's cache storage
4. **Updates**: Clear browser cache to download latest model versions

### Download Progress

When switching to a new model for the first time:

```typescript
import { switchModel } from './services/ai';

console.log('Downloading model...');
await switchModel('phi-2'); // Downloads if not cached
console.log('Model ready!');
```

## API Reference

### Functions

#### `initializeAI(config?: AIServiceConfig): Promise<void>`
Initialize the AI service with a specific model.

**Parameters:**
- `config.modelId` - Model ID from registry (e.g., 'phi-3-mini', 'nomic-embed')
- `config.modelName` - Direct HuggingFace model name (fallback)
- `config.modelPath` - Optional ONNX model path
- `config.dimension` - Vector dimension (auto-detected from registry)
- `config.strategy` - Loading strategy (AUTO, ONNX_ONLY, WASM_ONLY)

#### `switchModel(modelId: string, config?: Partial<AIServiceConfig>): Promise<void>`
Switch to a different model at runtime.

**Parameters:**
- `modelId` - Model ID from registry
- `config` - Optional additional configuration

#### `getCurrentModel(): ModelInfo | null`
Get information about the currently loaded model.

**Returns:** Model information or null if not initialized

#### `getAllModels(): ModelInfo[]`
Get all available models from the registry.

**Returns:** Array of all model configurations

#### `getModelsByType(type: 'embedding' | 'llm'): ModelInfo[]`
Get models filtered by type.

**Parameters:**
- `type` - Model type ('embedding' or 'llm')

**Returns:** Array of models matching the type

#### `getModelById(modelId: string): ModelInfo | undefined`
Get a specific model by its ID.

**Parameters:**
- `modelId` - Model ID from registry

**Returns:** Model information or undefined if not found

### Types

#### `ModelInfo`
```typescript
interface ModelInfo {
  id: string;               // Unique model identifier
  name: string;             // Display name
  description: string;      // Model description
  modelName: string;        // HuggingFace model identifier
  dimension: number;        // Vector dimension
  type: 'embedding' | 'llm'; // Model type
  modelPath?: string;       // Optional ONNX model path
  quantized?: boolean;      // Whether model is quantized
}
```

#### `AIServiceConfig`
```typescript
interface AIServiceConfig {
  modelId?: string;      // Model ID from registry (preferred)
  modelName?: string;    // Direct HuggingFace model name (fallback)
  modelPath?: string;    // Optional ONNX model path
  dimension?: number;    // Vector dimension
  strategy?: EngineStrategy; // Loading strategy
}
```

## Examples

See `/src/examples/model-switching-examples.ts` for comprehensive examples including:
- Using the default model
- Initializing with specific models
- Switching between models at runtime
- Listing available models
- Filtering models by type
- Using custom models

## Integration with UI

### Model Selector Component (Conceptual)

```typescript
import React, { useState, useEffect } from 'react';
import { getAllModels, getCurrentModel, switchModel } from '../services/ai';

const ModelSelector: React.FC = () => {
  const [models] = useState(getAllModels());
  const [current, setCurrent] = useState(getCurrentModel());
  const [loading, setLoading] = useState(false);

  const handleModelSwitch = async (modelId: string) => {
    setLoading(true);
    try {
      await switchModel(modelId);
      setCurrent(getCurrentModel());
    } catch (error) {
      console.error('Failed to switch model:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Select AI Model</h3>
      {models.map(model => (
        <button
          key={model.id}
          onClick={() => handleModelSwitch(model.id)}
          disabled={loading || current?.id === model.id}
        >
          {model.name} {current?.id === model.id && '(Active)'}
        </button>
      ))}
      {loading && <p>Switching model...</p>}
    </div>
  );
};
```

## Best Practices

1. **Choose the Right Model**
   - Use LLM models (Phi-3, Phi-2) for general text generation and understanding
   - Use embedding models (Nomic, MiniLM) for semantic search and similarity

2. **Model Switching**
   - Dispose the current model before switching to free up resources
   - Handle loading states in your UI during model switches
   - Cache model selections in local storage for persistence

3. **Performance**
   - First load of a model triggers download (may take time)
   - Subsequent loads are instant (cached)
   - Smaller models (All-MiniLM) load faster but may have lower quality
   - Larger models (Phi-3) have better quality but take more resources

4. **Error Handling**
   - Always wrap model operations in try-catch blocks
   - Handle network errors during model downloads
   - Provide user feedback during long operations

## Troubleshooting

### Model Download Fails
- Check internet connection
- Verify HuggingFace is accessible
- Clear browser cache and retry

### Model Switching is Slow
- First-time download can take several minutes
- Check browser console for progress
- Ensure sufficient disk space for cache

### Wrong Model Loaded
- Check `getCurrentModel()` to verify
- Ensure model ID is correct
- Reinitialize if needed

## Future Enhancements

- [ ] Download progress callbacks
- [ ] Model versioning
- [ ] Local ONNX model support
- [ ] Model performance benchmarks
- [ ] Automatic model recommendations
- [ ] Model fine-tuning support
