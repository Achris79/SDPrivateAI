# AI Model Loaders

This directory contains the implementation of the AI model loading engines for SDPrivateAI.

## Architecture Overview

The loading engine architecture provides a flexible, multi-layered approach to AI model loading with automatic fallback support:

- **Primary Engine:** ONNX Runtime Web (optimized performance, GPU acceleration)
- **Fallback Engine:** WASM via transformers.js (maximum compatibility)

## Files

### `types.ts`
Core types and interfaces used by all loaders:
- `LoadingEngineType` - Enum of supported engines (ONNX, WASM)
- `ModelConfig` - Configuration for model loading
- `ModelLoader` - Interface that all loaders must implement
- `EngineDetectionResult` - Result of engine availability checks

### `onnx-loader.ts`
ONNX Runtime Web implementation:
- Uses `onnxruntime-web` package
- Supports WebGL and WASM execution providers
- Optimized for performance with graph optimizations
- Requires pre-converted ONNX model file

**Features:**
- GPU acceleration via WebGL
- Multi-threading support
- Graph-level optimizations
- Low-level control over inference

**Limitations:**
- Requires ONNX model file to be provided
- Larger bundle size (~23 MB WASM runtime)
- Manual tokenization needed

### `wasm-loader.ts`
WASM implementation using transformers.js:
- Uses `@xenova/transformers` package
- Automatic model downloading and caching
- Built-in tokenization and preprocessing
- Works out-of-the-box with HuggingFace models

**Features:**
- No manual model management
- Automatic caching
- Quantization support
- Wide model compatibility

**Limitations:**
- Slower than ONNX with GPU
- First run requires model download
- Less control over inference pipeline

### `engine-manager.ts`
Central manager for loading engines:
- Singleton pattern for global access
- Automatic engine detection and selection
- Primary/Fallback strategy implementation
- Resource lifecycle management

**Strategies:**
- `AUTO` - Try ONNX first, fallback to WASM (default)
- `ONNX_ONLY` - Only use ONNX, fail if not available
- `WASM_ONLY` - Only use WASM/transformers.js

## Usage Example

```typescript
import { LoadingEngineManager, EngineStrategy } from './loaders';

// Get singleton instance
const manager = LoadingEngineManager.getInstance();

// Initialize with auto-strategy
await manager.initialize({
  modelName: 'nomic-ai/nomic-embed-text-v1.5',
  modelPath: '/models/nomic-embed.onnx', // Optional for ONNX
  dimension: 768,
  strategy: EngineStrategy.AUTO,
});

// Generate embedding
const vector = await manager.generateEmbedding('Hello, world!');

// Check which engine is being used
const engine = manager.getCurrentEngine(); // 'onnx' or 'wasm'

// Cleanup
await manager.dispose();
```

## Adding New Loaders

To add a new loading engine:

1. Create a new file (e.g., `native-loader.ts`)
2. Implement the `ModelLoader` interface
3. Add new `LoadingEngineType` to `types.ts`
4. Update `engine-manager.ts` to support the new loader
5. Export from `index.ts`

Example:

```typescript
import { ModelLoader, LoadingEngineType, ModelConfig } from './types';

export class NativeLoader implements ModelLoader {
  readonly type = LoadingEngineType.NATIVE;
  
  async initialize(config: ModelConfig): Promise<void> {
    // Implementation
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    // Implementation
  }
  
  async isAvailable(): Promise<boolean> {
    // Check if native loader is available
  }
  
  async dispose(): Promise<void> {
    // Cleanup
  }
}
```

## Performance Considerations

### ONNX Runtime
- **Best for:** Production deployments with local models
- **Initialization:** 2-3 seconds
- **Inference:** 50-100ms (WebGL), 100-200ms (WASM)
- **Memory:** ~100-200 MB

### WASM/transformers.js
- **Best for:** Development and quick prototyping
- **Initialization:** 5-10 seconds (first time with download)
- **Inference:** 150-300ms
- **Memory:** ~150-250 MB

## Security Considerations

1. **Model Source Validation:** Always verify model sources
2. **CORS Policy:** Ensure proper CORS headers for model downloads
3. **Content Security Policy:** Configure CSP to allow WASM execution
4. **Resource Limits:** Monitor memory usage and implement limits
5. **Input Validation:** Validate all text inputs before processing

## Troubleshooting

### ONNX fails to load
- Check if model path is correct and accessible
- Verify model is in ONNX format (.onnx extension)
- Ensure WebAssembly is enabled in browser
- Check browser console for specific error messages

### WASM is slow
- First run downloads model (cached afterwards)
- Use quantized models with `{ quantized: true }`
- Consider pre-loading models during app initialization
- Check network connection for initial download

### Out of memory errors
- Dispose engines when not in use
- Avoid loading multiple models simultaneously
- Use quantized models to reduce memory footprint
- Implement batch size limits for bulk operations

## Future Improvements

- [ ] Native Tauri command integration
- [ ] Model quantization options
- [ ] Batch processing support
- [ ] Model warmup on initialization
- [ ] Advanced caching strategies
- [ ] Performance monitoring and metrics
- [ ] Model versioning and updates

## Documentation

See [AI_LOADING_ENGINE.md](../../../docs/AI_LOADING_ENGINE.md) for comprehensive usage documentation.
