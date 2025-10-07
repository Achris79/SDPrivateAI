# Device-Aware AI Model Selection

## Overview

This feature provides automatic device capability detection and intelligent model selection based on available hardware resources. It ensures that only compatible and performant AI models are recommended for the end device.

## Features

- ✅ **Device Capability Detection**
  - Automatic detection of RAM, CPU cores, GPU availability
  - Platform detection (desktop, mobile, tablet)
  - Browser capability detection (WebAssembly, WebGL, SharedArrayBuffer)
  - Performance tier classification (low, medium, high)

- ✅ **Model Compatibility Checking**
  - Filter models based on minimum requirements
  - Check memory, CPU, and GPU requirements
  - Prevent loading incompatible models

- ✅ **Intelligent Model Recommendations**
  - Automatic model selection based on device tier
  - Scoring system to find optimal model
  - Fallback recommendations for limited devices

- ✅ **Performance-Optimized Storage**
  - Model size information for cache management
  - Resource-based model filtering
  - Efficient model loading strategies

## Device Capability Detection

### Automatic Detection

The system automatically detects:

```typescript
import { getDeviceCapabilities, getCapabilitiesSummary } from './services/ai';

const capabilities = getDeviceCapabilities();
console.log(getCapabilitiesSummary(capabilities));
// Output: Platform: desktop, Tier: high, Memory: 16GB, CPU Cores: 8, GPU: WebGL2, WebAssembly: Yes
```

### Capability Structure

```typescript
interface DeviceCapabilities {
  memory: {
    totalGB: number;      // Total RAM in GB
    available: boolean;   // True if detected, false if estimated
  };
  cpu: {
    cores: number;        // Number of CPU cores
    available: boolean;
  };
  gpu: {
    available: boolean;   // GPU availability
    webgl: boolean;       // WebGL support
    webgl2: boolean;      // WebGL 2.0 support
  };
  platform: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  isMobile: boolean;
  webAssembly: boolean;
  sharedArrayBuffer: boolean;
  tier: 'low' | 'medium' | 'high';
}
```

### Performance Tiers

- **High Tier**: 8GB+ RAM, 8+ CPU cores, WebGL2 support
- **Medium Tier**: 4GB+ RAM, 4+ CPU cores, WebGL support
- **Low Tier**: Less than medium tier requirements

## Model Requirements

Each model in the registry has defined resource requirements:

| Model ID | Min RAM | Recommended RAM | Min CPU Cores | Estimated Size | Tier |
|----------|---------|-----------------|---------------|----------------|------|
| phi-3-mini | 4GB | 8GB | 4 | 2.3GB | Medium |
| phi-2 | 2GB | 4GB | 2 | 1.7GB | Low |
| nomic-embed | 2GB | 4GB | 2 | 548MB | Low |
| all-minilm | 1GB | 2GB | 1 | 90MB | Low |

## Usage

### 1. Auto-Select Model Based on Device

```typescript
import { initializeAI } from './services/ai';

// Automatically selects the best model for the device
await initializeAI({ autoSelectModel: true });
```

### 2. Get Compatible Models

```typescript
import { getDeviceCompatibleModels } from './services/ai';

// Get all compatible models
const allCompatible = getDeviceCompatibleModels();

// Get only compatible embedding models
const embeddingModels = getDeviceCompatibleModels('embedding');

// Get only compatible LLM models
const llmModels = getDeviceCompatibleModels('llm');

// Models are sorted by compatibility score (best first)
allCompatible.forEach(model => {
  console.log(`${model.name} - ${model.requirements.estimatedSizeMB}MB`);
});
```

### 3. Get Recommended Model

```typescript
import { getDeviceRecommendedModel } from './services/ai';

// Get recommended model (any type)
const recommended = getDeviceRecommendedModel();

// Get recommended embedding model
const embeddingModel = getDeviceRecommendedModel('embedding');

if (recommended) {
  console.log(`Recommended: ${recommended.name}`);
  console.log(`Requirements: ${recommended.requirements.minMemoryGB}GB RAM`);
  console.log(`Size: ${recommended.requirements.estimatedSizeMB}MB`);
}
```

### 4. Check Model Compatibility

```typescript
import { isDeviceCompatible } from './services/ai';

if (isDeviceCompatible('phi-3-mini')) {
  console.log('Phi-3 Mini is compatible with this device');
} else {
  console.log('Phi-3 Mini is NOT compatible with this device');
}
```

### 5. Manual Selection with Compatibility Check

```typescript
import { initializeAI, isDeviceCompatible, getDeviceRecommendedModel } from './services/ai';

let modelId = 'phi-3-mini'; // Preferred model

// Check compatibility
if (!isDeviceCompatible(modelId)) {
  console.warn('Preferred model not compatible, using recommended');
  const recommended = getDeviceRecommendedModel('llm');
  modelId = recommended ? recommended.id : 'phi-2'; // Fallback
}

await initializeAI({ modelId });
```

### 6. Get Device Capabilities

```typescript
import { getDeviceCapabilities, getCapabilitiesSummary } from './services/ai';

const capabilities = getDeviceCapabilities();

console.log('Device Summary:', getCapabilitiesSummary(capabilities));
console.log('Performance Tier:', capabilities.tier);
console.log('Memory:', capabilities.memory.totalGB, 'GB');
console.log('CPU Cores:', capabilities.cpu.cores);
console.log('GPU Available:', capabilities.gpu.available);
console.log('WebGL2:', capabilities.gpu.webgl2);
```

## API Reference

### Device Detection Functions

#### `getDeviceCapabilities()`
Returns device capabilities (cached after first call).

```typescript
function getDeviceCapabilities(): DeviceCapabilities
```

#### `getCapabilitiesSummary(capabilities)`
Returns a human-readable summary of device capabilities.

```typescript
function getCapabilitiesSummary(capabilities: DeviceCapabilities): string
```

### Model Recommendation Functions

#### `getDeviceCompatibleModels(type?)`
Returns all models compatible with the current device, sorted by compatibility score.

```typescript
function getDeviceCompatibleModels(
  type?: 'embedding' | 'llm'
): ModelWithRequirements[]
```

#### `getDeviceRecommendedModel(type?)`
Returns the recommended model for the current device.

```typescript
function getDeviceRecommendedModel(
  type?: 'embedding' | 'llm'
): ModelWithRequirements | null
```

#### `isDeviceCompatible(modelId)`
Checks if a specific model is compatible with the current device.

```typescript
function isDeviceCompatible(modelId: string): boolean
```

### AI Service Configuration

The `initializeAI` function now supports auto-selection:

```typescript
interface AIServiceConfig {
  modelId?: string;
  modelName?: string;
  modelPath?: string;
  dimension?: number;
  strategy?: EngineStrategy;
  autoSelectModel?: boolean; // NEW: Auto-select based on device
}
```

## Examples

See `/src/examples/device-aware-model-selection.ts` for comprehensive examples including:
- Detecting device capabilities
- Getting compatible models
- Auto-selecting models
- Checking model compatibility
- Device-aware initialization with fallback

## Best Practices

### 1. Use Auto-Selection for New Users

```typescript
// Best for new users - automatically picks the right model
await initializeAI({ autoSelectModel: true });
```

### 2. Provide Manual Override Option

```typescript
// Let advanced users choose, but warn about incompatibility
async function initWithModel(userSelectedModelId: string) {
  if (!isDeviceCompatible(userSelectedModelId)) {
    console.warn('Selected model may not perform optimally on this device');
    // Show warning to user, but allow them to proceed
  }
  await initializeAI({ modelId: userSelectedModelId });
}
```

### 3. Show Compatible Models in UI

```typescript
// Only show models that will work on the user's device
const compatibleModels = getDeviceCompatibleModels();

// Display these in a dropdown or selection UI
compatibleModels.forEach(model => {
  console.log(`${model.name} - ${model.requirements.estimatedSizeMB}MB`);
});
```

### 4. Display Device Information

```typescript
// Help users understand their device's capabilities
const capabilities = getDeviceCapabilities();
console.log(`Your device tier: ${capabilities.tier}`);
console.log(`Available memory: ${capabilities.memory.totalGB}GB`);
```

### 5. Implement Smart Fallbacks

```typescript
async function smartInit(preferredModelId?: string) {
  if (preferredModelId && isDeviceCompatible(preferredModelId)) {
    await initializeAI({ modelId: preferredModelId });
  } else {
    // Fallback to auto-selection
    await initializeAI({ autoSelectModel: true });
  }
}
```

## Performance Considerations

### Model Size vs. Performance

- **Large models** (Phi-3 Mini: 2.3GB)
  - Better quality
  - Requires more RAM
  - Slower download
  - Only for high-tier devices

- **Medium models** (Phi-2: 1.7GB, Nomic Embed: 548MB)
  - Good balance
  - Works on medium-tier devices
  - Reasonable download time

- **Small models** (All-MiniLM: 90MB)
  - Fast download
  - Lower memory usage
  - Works on low-tier devices
  - Sufficient for many use cases

### Caching Strategy

The system automatically caches downloaded models in the browser. Model size information helps with:
- Estimating download time
- Managing cache size
- Deciding when to preload models

## Troubleshooting

### No Compatible Models Found

If `getDeviceCompatibleModels()` returns an empty array:
1. Check device capabilities with `getDeviceCapabilities()`
2. Verify device meets minimum requirements (1GB RAM, 1 CPU core)
3. Check browser console for capability detection warnings

### Auto-Selection Not Working

If `autoSelectModel: true` doesn't work:
1. Ensure no explicit `modelId` is set in config
2. Check that at least one model is compatible
3. Review logs for device capability warnings

### Model Runs Slowly

If a model is slow despite being "compatible":
1. Check if device has recommended (not just minimum) resources
2. Consider using a smaller model
3. Check `capabilities.tier` - low-tier devices should use low-tier models

## Future Enhancements

- [ ] Dynamic model loading based on available memory
- [ ] Network speed detection for download optimization
- [ ] Battery level consideration for mobile devices
- [ ] Progressive model loading (start with small, upgrade later)
- [ ] Model performance benchmarking per device
- [ ] Cloud-synced device profiles
