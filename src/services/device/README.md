# Device Service - Device-Aware AI Model Selection

## Overview

The Device Service provides automatic device capability detection and intelligent AI model selection based on available hardware resources. This ensures optimal performance and prevents loading incompatible models.

## Features

- **Automatic Device Detection**: Detects RAM, CPU cores, GPU, WebGL support, platform type
- **Performance Tier Classification**: Classifies devices as low, medium, or high performance
- **Model Compatibility Checking**: Prevents loading models that won't work on the device
- **Intelligent Recommendations**: Scores and recommends the best model for the device
- **Resource-Based Filtering**: Shows only compatible models based on requirements

## Quick Start

```typescript
import { initializeAI } from './services/ai';

// Automatically select the best model for this device
await initializeAI({ autoSelectModel: true });
```

## Device Detection

### Automatic Capability Detection

```typescript
import { getDeviceCapabilities, getCapabilitiesSummary } from './services/ai';

const capabilities = getDeviceCapabilities();
console.log(getCapabilitiesSummary(capabilities));
// Output: Platform: desktop, Tier: high, Memory: 16GB, CPU Cores: 8, GPU: WebGL2, WebAssembly: Yes
```

### Detected Capabilities

- **Memory**: Total RAM in GB (detected via Navigator API or estimated)
- **CPU**: Number of CPU cores
- **GPU**: WebGL and WebGL2 support
- **Platform**: Desktop, mobile, tablet, or unknown
- **Browser**: WebAssembly and SharedArrayBuffer support
- **Performance Tier**: Low, medium, or high

### Performance Tiers

| Tier | Desktop Requirements | Mobile Requirements |
|------|---------------------|---------------------|
| High | 8GB+ RAM, 8+ cores, WebGL2 | Not applicable |
| Medium | 4GB+ RAM, 4+ cores, WebGL | 6GB+ RAM, 6+ cores, WebGL2 |
| Low | Less than medium | All mobile devices |

## Model Requirements

Each model has defined resource requirements:

### Model Registry

| Model ID | Name | Min RAM | Rec. RAM | Min CPU | Size | Tier |
|----------|------|---------|----------|---------|------|------|
| phi-3-mini | Phi-3 Mini | 4GB | 8GB | 4 cores | 2.3GB | Medium |
| phi-2 | Phi-2 | 2GB | 4GB | 2 cores | 1.7GB | Low |
| nomic-embed | Nomic Embed | 2GB | 4GB | 2 cores | 548MB | Low |
| all-minilm | All-MiniLM-L6 | 1GB | 2GB | 1 core | 90MB | Low |

## API Reference

### Device Detection

#### `getDeviceCapabilities()`

Returns the current device's capabilities (cached after first call).

```typescript
interface DeviceCapabilities {
  memory: { totalGB: number; available: boolean; };
  cpu: { cores: number; available: boolean; };
  gpu: { available: boolean; webgl: boolean; webgl2: boolean; };
  platform: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  isMobile: boolean;
  webAssembly: boolean;
  sharedArrayBuffer: boolean;
  tier: 'low' | 'medium' | 'high';
}
```

#### `getCapabilitiesSummary(capabilities)`

Returns a human-readable summary string.

```typescript
function getCapabilitiesSummary(capabilities: DeviceCapabilities): string
```

### Model Recommendation

#### `getDeviceCompatibleModels(type?)`

Returns all models compatible with the current device, sorted by score (best first).

```typescript
function getDeviceCompatibleModels(
  type?: 'embedding' | 'llm'
): ModelWithRequirements[]
```

#### `getDeviceRecommendedModel(type?)`

Returns the single best model for the current device.

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

#### `getModelRequirements(modelId)`

Gets the resource requirements for a specific model.

```typescript
interface ModelRequirements {
  minMemoryGB: number;
  recommendedMemoryGB: number;
  minCPUCores: number;
  requiresGPU: boolean;
  requiresWebGL2: boolean;
  estimatedSizeMB: number;
  tier: 'low' | 'medium' | 'high';
}
```

## Usage Examples

### Example 1: Auto-Select Model

```typescript
import { initializeAI } from './services/ai';

// Automatically picks the best model for this device
await initializeAI({ autoSelectModel: true });
```

### Example 2: Get Compatible Models

```typescript
import { getDeviceCompatibleModels } from './services/ai';

// Get all compatible models
const allModels = getDeviceCompatibleModels();

// Get only embedding models
const embeddingModels = getDeviceCompatibleModels('embedding');

// Display in UI
embeddingModels.forEach(model => {
  console.log(`${model.name} - ${model.requirements.estimatedSizeMB}MB`);
});
```

### Example 3: Check Compatibility

```typescript
import { isDeviceCompatible, initializeAI } from './services/ai';

const preferredModel = 'phi-3-mini';

if (isDeviceCompatible(preferredModel)) {
  await initializeAI({ modelId: preferredModel });
} else {
  // Fallback to auto-selection
  await initializeAI({ autoSelectModel: true });
}
```

### Example 4: Show Device Info to User

```typescript
import { getDeviceCapabilities, getCapabilitiesSummary } from './services/ai';

const capabilities = getDeviceCapabilities();

console.log('Your Device:');
console.log(getCapabilitiesSummary(capabilities));
console.log(`Performance Tier: ${capabilities.tier}`);
```

### Example 5: Filter Models by Tier

```typescript
import { getDeviceCapabilities, getDeviceCompatibleModels } from './services/ai';

const capabilities = getDeviceCapabilities();
const compatibleModels = getDeviceCompatibleModels();

// Show only models matching device tier or lower
const suitableModels = compatibleModels.filter(model => {
  if (capabilities.tier === 'high') return true;
  if (capabilities.tier === 'medium') return model.requirements.tier !== 'high';
  return model.requirements.tier === 'low';
});
```

## Integration Patterns

### Pattern 1: Progressive Enhancement

Start with a small model, allow upgrade if device supports it:

```typescript
// Start with minimal model
await initializeAI({ modelId: 'all-minilm' });

// Later, check if device can handle better model
if (isDeviceCompatible('phi-3-mini')) {
  // Offer to upgrade
  console.log('Your device can handle a more powerful model!');
}
```

### Pattern 2: Defensive Loading

```typescript
async function safeInitialize(preferredModelId?: string) {
  if (preferredModelId && isDeviceCompatible(preferredModelId)) {
    await initializeAI({ modelId: preferredModelId });
  } else {
    const recommended = getDeviceRecommendedModel();
    if (recommended) {
      await initializeAI({ modelId: recommended.id });
    } else {
      throw new Error('No compatible AI model found for this device');
    }
  }
}
```

### Pattern 3: User Choice with Warning

```typescript
async function initWithUserChoice(userSelectedModelId: string) {
  if (!isDeviceCompatible(userSelectedModelId)) {
    console.warn(
      'Warning: Selected model may not perform well on this device',
      `Recommended: ${getDeviceRecommendedModel()?.name}`
    );
    // Show warning to user but allow them to proceed
  }
  
  await initializeAI({ modelId: userSelectedModelId });
}
```

## Testing

### Manual Testing in Browser Console

Run the demo script:

```javascript
// In browser console
import './examples/device-demo';
```

This will display:
- Device capabilities
- Compatible models
- Recommended model
- Usage examples

### Testing Different Device Profiles

You can simulate different devices by overriding the detection:

```typescript
// Not recommended for production, but useful for testing
const testCapabilities = {
  memory: { totalGB: 2, available: true },
  cpu: { cores: 2, available: true },
  gpu: { available: false, webgl: false, webgl2: false },
  platform: 'mobile' as const,
  isMobile: true,
  webAssembly: true,
  sharedArrayBuffer: false,
  tier: 'low' as const,
};

// Test what models are compatible with this profile
const compatible = getCompatibleModels(testCapabilities);
```

## Best Practices

### 1. Always Use Auto-Selection for New Users

```typescript
await initializeAI({ autoSelectModel: true });
```

### 2. Show Compatible Models in UI

```typescript
const models = getDeviceCompatibleModels();
// Only show these in dropdown/selection
```

### 3. Display Device Tier

```typescript
const tier = getDeviceCapabilities().tier;
// Show badge: "Performance: High" 
```

### 4. Warn About Incompatible Selections

```typescript
if (!isDeviceCompatible(selectedModel)) {
  showWarning('This model may not work well on your device');
}
```

### 5. Provide Fallback Models

```typescript
const recommended = getDeviceRecommendedModel('embedding');
if (!recommended) {
  // Handle case where no model is compatible
  showError('Your device does not meet minimum requirements');
}
```

## Troubleshooting

### No Compatible Models Found

**Symptoms**: `getDeviceCompatibleModels()` returns empty array

**Solutions**:
1. Check device capabilities with `getDeviceCapabilities()`
2. Verify device meets minimum requirements (1GB RAM, 1 CPU core)
3. Check browser console for detection warnings
4. Try the smallest model (`all-minilm`) which works on almost all devices

### Auto-Selection Not Working

**Symptoms**: `autoSelectModel: true` doesn't select a model

**Solutions**:
1. Ensure no explicit `modelId` is set in config
2. Check that at least one model is compatible with device
3. Review logs for capability detection issues
4. Verify WebAssembly is supported in the browser

### Model Loads but Runs Slowly

**Symptoms**: Model loads successfully but performance is poor

**Solutions**:
1. Check if device has recommended (not just minimum) resources
2. Verify `capabilities.tier` matches model tier
3. Consider switching to a smaller model
4. Check if GPU/WebGL is available and being used

### Incorrect Device Detection

**Symptoms**: Device capabilities seem wrong

**Solutions**:
1. Check if browser supports Navigator Device Memory API
2. Verify WebGL support in browser settings
3. Note that some values are estimated if not directly available
4. Test in different browsers to confirm detection

## See Also

- [DEVICE_AWARE_MODEL_SELECTION.md](../../docs/DEVICE_AWARE_MODEL_SELECTION.md) - Complete documentation
- [device-aware-model-selection.ts](../examples/device-aware-model-selection.ts) - Usage examples
- [AI_MODEL_SELECTION.md](../../docs/AI_MODEL_SELECTION.md) - General model selection guide
