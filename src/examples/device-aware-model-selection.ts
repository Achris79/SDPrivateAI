/**
 * Device-Aware AI Model Selection Examples
 * Demonstrates how to use device capability detection and automatic model selection
 */

import {
  initializeAI,
  getDeviceCapabilities,
  getDeviceCompatibleModels,
  getDeviceRecommendedModel,
  isDeviceCompatible,
  generateEmbedding,
  disposeAI,
} from '../services/ai';
import { getCapabilitiesSummary } from '../services/device';

/**
 * Example 1: Detect device capabilities
 */
async function detectCapabilities() {
  console.log('\n=== Example 1: Detect Device Capabilities ===');
  
  const capabilities = getDeviceCapabilities();
  const summary = getCapabilitiesSummary(capabilities);
  
  console.log('Device Summary:', summary);
  console.log('Full Capabilities:', JSON.stringify(capabilities, null, 2));
}

/**
 * Example 2: Get compatible models for device
 */
async function getCompatibleModels() {
  console.log('\n=== Example 2: Get Compatible Models ===');
  
  const compatibleModels = getDeviceCompatibleModels();
  
  console.log(`Found ${compatibleModels.length} compatible models:`);
  compatibleModels.forEach(model => {
    console.log(`- ${model.name} (${model.id})`);
    console.log(`  Type: ${model.type}, Dimension: ${model.dimension}`);
    console.log(`  Requirements: ${model.requirements.minMemoryGB}GB RAM, ${model.requirements.minCPUCores} cores`);
    console.log(`  Size: ${model.requirements.estimatedSizeMB}MB`);
  });
}

/**
 * Example 3: Get recommended model for device
 */
async function getRecommendedModel() {
  console.log('\n=== Example 3: Get Recommended Model ===');
  
  const recommended = getDeviceRecommendedModel();
  
  if (recommended) {
    console.log('Recommended Model:', recommended.name);
    console.log('Model ID:', recommended.id);
    console.log('Type:', recommended.type);
    console.log('Requirements:');
    console.log(`  Min Memory: ${recommended.requirements.minMemoryGB}GB`);
    console.log(`  Recommended Memory: ${recommended.requirements.recommendedMemoryGB}GB`);
    console.log(`  Min CPU Cores: ${recommended.requirements.minCPUCores}`);
    console.log(`  Estimated Size: ${recommended.requirements.estimatedSizeMB}MB`);
    console.log(`  Tier: ${recommended.requirements.tier}`);
  } else {
    console.log('No compatible model found for this device');
  }
}

/**
 * Example 4: Auto-select model based on device
 */
async function autoSelectModel() {
  console.log('\n=== Example 4: Auto-Select Model ===');
  
  console.log('Initializing with auto-select...');
  await initializeAI({ autoSelectModel: true });
  
  const capabilities = getDeviceCapabilities();
  console.log('Device Tier:', capabilities.tier);
  console.log('Auto-selected model loaded successfully!');
  
  await disposeAI();
}

/**
 * Example 5: Check model compatibility
 */
async function checkModelCompatibility() {
  console.log('\n=== Example 5: Check Model Compatibility ===');
  
  const models = ['phi-3-mini', 'phi-2', 'nomic-embed', 'all-minilm'];
  
  models.forEach(modelId => {
    const compatible = isDeviceCompatible(modelId);
    console.log(`${modelId}: ${compatible ? '✓ Compatible' : '✗ Not Compatible'}`);
  });
}

/**
 * Example 6: Use device-aware initialization with fallback
 */
async function deviceAwareInitWithFallback() {
  console.log('\n=== Example 6: Device-Aware Init with Fallback ===');
  
  const capabilities = getDeviceCapabilities();
  console.log('Device Tier:', capabilities.tier);
  
  // Try to use a high-end model if device supports it
  let modelId = 'phi-3-mini';
  
  if (!isDeviceCompatible(modelId)) {
    console.log(`${modelId} not compatible, falling back...`);
    const recommended = getDeviceRecommendedModel('llm');
    modelId = recommended ? recommended.id : 'phi-2';
  }
  
  console.log(`Initializing with model: ${modelId}`);
  await initializeAI({ modelId });
  
  // Test it
  const result = await generateEmbedding('Hello, device-aware AI!');
  console.log(`Generated embedding with ${result.dimensionality} dimensions`);
  
  await disposeAI();
}

/**
 * Example 7: Get embedding models only
 */
async function getEmbeddingModels() {
  console.log('\n=== Example 7: Get Compatible Embedding Models ===');
  
  const embeddingModels = getDeviceCompatibleModels('embedding');
  
  console.log(`Found ${embeddingModels.length} compatible embedding models:`);
  embeddingModels.forEach(model => {
    console.log(`- ${model.name} (${model.dimension}D, ${model.requirements.estimatedSizeMB}MB)`);
  });
}

/**
 * Run all examples
 */
export async function runDeviceAwareExamples() {
  try {
    await detectCapabilities();
    await getCompatibleModels();
    await getRecommendedModel();
    await checkModelCompatibility();
    await getEmbeddingModels();
    // Uncomment to test auto-selection
    // await autoSelectModel();
    // await deviceAwareInitWithFallback();
    
    console.log('\n=== All Examples Completed Successfully ===');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export individual examples
export {
  detectCapabilities,
  getCompatibleModels,
  getRecommendedModel,
  autoSelectModel,
  checkModelCompatibility,
  deviceAwareInitWithFallback,
  getEmbeddingModels,
};
