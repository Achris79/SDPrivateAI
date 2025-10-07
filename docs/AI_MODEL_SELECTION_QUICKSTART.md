# Quick Start: AI Model Selection

## 1. Basic Usage (5 minutes)

### Use Default Model (Phi-3 Mini)

```typescript
import { initializeAI, generateEmbedding } from './services/ai';

// Initialize with default model (Phi-3 Mini)
await initializeAI();

// Generate embeddings
const result = await generateEmbedding('Your text here');
console.log('Vector dimension:', result.dimensionality); // 3072
```

### Switch to a Different Model

```typescript
import { switchModel, getCurrentModel } from './services/ai';

// Switch to Nomic Embed (better for semantic search)
await switchModel('nomic-embed');

// Verify the switch
const model = getCurrentModel();
console.log('Now using:', model?.name); // "Nomic Embed Text"
```

## 2. Available Models

| Model ID | Name | Type | Dimension | Best For |
|----------|------|------|-----------|----------|
| `phi-3-mini` | Phi-3 Mini (Default) | LLM | 3072 | General text understanding |
| `phi-2` | Phi-2 | LLM | 2560 | Fast inference, compact |
| `nomic-embed` | Nomic Embed Text | Embedding | 768 | High-quality embeddings |
| `all-minilm` | All-MiniLM-L6 | Embedding | 384 | Fast, low resource |

## 3. Common Use Cases

### Semantic Search Application

```typescript
import { initializeAI, switchModel } from './services/ai';

// Use embedding model for semantic search
await initializeAI({ modelId: 'nomic-embed' });

// Or switch if already initialized
await switchModel('nomic-embed');
```

### Text Understanding / Generation

```typescript
import { initializeAI } from './services/ai';

// Use LLM model for text understanding
await initializeAI({ modelId: 'phi-3-mini' }); // Default
```

### Low Resource Environment

```typescript
import { switchModel } from './services/ai';

// Switch to smaller model
await switchModel('all-minilm'); // Only 384 dimensions
```

## 4. List and Select Models

```typescript
import { getAllModels, getModelsByType } from './services/ai';

// Get all available models
const allModels = getAllModels();
console.log('Available models:', allModels.length); // 4

// Get only embedding models
const embeddingModels = getModelsByType('embedding');
embeddingModels.forEach(model => {
  console.log(`${model.name}: ${model.dimension}D`);
});
```

## 5. Integration with UI

### Simple Component

```typescript
import React from 'react';
import { switchModel, getAllModels } from './services/ai';

function ModelSelector() {
  const models = getAllModels();
  
  return (
    <select onChange={(e) => switchModel(e.target.value)}>
      {models.map(model => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
```

### Full Example Component

See `src/components/features/ModelSelector.example.tsx` for a complete, production-ready component.

## 6. Custom Model

```typescript
import { initializeAI } from './services/ai';

// Use any HuggingFace model
await initializeAI({
  modelName: 'your-org/your-model',
  dimension: 512,
});
```

## 7. Check Current Model

```typescript
import { getCurrentModel } from './services/ai';

const current = getCurrentModel();
if (current) {
  console.log('Model:', current.name);
  console.log('Type:', current.type);
  console.log('Dimension:', current.dimension);
}
```

## 8. Error Handling

```typescript
import { switchModel } from './services/ai';

try {
  await switchModel('phi-2');
  console.log('Model switched successfully');
} catch (error) {
  console.error('Failed to switch model:', error);
  // Handle error (show message to user, retry, etc.)
}
```

## 9. Performance Tips

1. **First Download**: First time using a model will download it (~1-5 minutes depending on model size)
2. **Caching**: Models are cached in browser, subsequent loads are instant
3. **Smaller Models**: Use `all-minilm` for faster downloads and lower memory
4. **Model Switching**: Only switch when necessary, as it disposes the current model

## 10. Testing

Run the demo script to verify everything works:

```typescript
import { runAllDemos } from './examples/model-selection-demo';

// Run all demos to see functionality
await runAllDemos();
```

## Next Steps

- Read the full guide: `docs/AI_MODEL_SELECTION.md`
- See examples: `src/examples/model-switching-examples.ts`
- Try the UI component: `src/components/features/ModelSelector.example.tsx`
- Check implementation: `docs/FLEXIBLE_MODEL_SELECTION_SUMMARY.md`

## Quick Reference

```typescript
// Import
import { 
  initializeAI, 
  switchModel, 
  getCurrentModel,
  getAllModels,
  getModelsByType 
} from './services/ai';

// Initialize
await initializeAI(); // Default
await initializeAI({ modelId: 'nomic-embed' }); // Specific

// Switch
await switchModel('phi-2');

// Query
const current = getCurrentModel();
const all = getAllModels();
const llms = getModelsByType('llm');
const embeddings = getModelsByType('embedding');
```

---

**That's it!** You now have a flexible AI model selection system with Phi-3 Mini as the default. Models download automatically on first use and are cached for instant subsequent loads. 🚀
