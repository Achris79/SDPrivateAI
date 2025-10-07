/**
 * Simple test/demo script for device-aware model selection
 * Can be run in the browser console to verify functionality
 */

// This script demonstrates the device-aware model selection feature
// Run it in the browser console to see device capabilities and recommended models

import {
  getDeviceCapabilities,
  getDeviceCompatibleModels,
  getDeviceRecommendedModel,
  isDeviceCompatible,
} from '../services/ai';
import { getCapabilitiesSummary } from '../services/device';

console.log('=== Device-Aware Model Selection Demo ===\n');

// 1. Detect device capabilities
console.log('1. Device Capabilities:');
const capabilities = getDeviceCapabilities();
console.log(getCapabilitiesSummary(capabilities));
console.log('   Performance Tier:', capabilities.tier);
console.log('   Memory:', capabilities.memory.totalGB, 'GB');
console.log('   CPU Cores:', capabilities.cpu.cores);
console.log('   GPU Available:', capabilities.gpu.available);
console.log('   WebGL2:', capabilities.gpu.webgl2);
console.log('   Platform:', capabilities.platform);
console.log('   Is Mobile:', capabilities.isMobile);
console.log('   WebAssembly:', capabilities.webAssembly);
console.log('');

// 2. Check model compatibility
console.log('2. Model Compatibility:');
const models = ['phi-3-mini', 'phi-2', 'nomic-embed', 'all-minilm'];
models.forEach(modelId => {
  const compatible = isDeviceCompatible(modelId);
  console.log(`   ${modelId}: ${compatible ? '✓ Compatible' : '✗ Not Compatible'}`);
});
console.log('');

// 3. Get compatible models
console.log('3. Compatible Models (All):');
const allCompatible = getDeviceCompatibleModels();
allCompatible.forEach(model => {
  console.log(`   - ${model.name} (${model.id})`);
  console.log(`     Type: ${model.type}, Dimension: ${model.dimension}`);
  console.log(`     Requirements: ${model.requirements.minMemoryGB}GB RAM, ${model.requirements.minCPUCores} cores`);
  console.log(`     Size: ${model.requirements.estimatedSizeMB}MB, Tier: ${model.requirements.tier}`);
});
console.log('');

// 4. Get compatible embedding models
console.log('4. Compatible Embedding Models:');
const embeddingModels = getDeviceCompatibleModels('embedding');
embeddingModels.forEach(model => {
  console.log(`   - ${model.name} (${model.dimension}D, ${model.requirements.estimatedSizeMB}MB)`);
});
console.log('');

// 5. Get recommended model
console.log('5. Recommended Model:');
const recommended = getDeviceRecommendedModel();
if (recommended) {
  console.log(`   Model: ${recommended.name} (${recommended.id})`);
  console.log(`   Type: ${recommended.type}`);
  console.log(`   Dimension: ${recommended.dimension}`);
  console.log(`   Requirements:`);
  console.log(`     Min Memory: ${recommended.requirements.minMemoryGB}GB`);
  console.log(`     Recommended Memory: ${recommended.requirements.recommendedMemoryGB}GB`);
  console.log(`     Min CPU Cores: ${recommended.requirements.minCPUCores}`);
  console.log(`     Size: ${recommended.requirements.estimatedSizeMB}MB`);
  console.log(`     Tier: ${recommended.requirements.tier}`);
  console.log(`     GPU Required: ${recommended.requirements.requiresGPU ? 'Yes' : 'No'}`);
  console.log(`     WebGL2 Required: ${recommended.requirements.requiresWebGL2 ? 'Yes' : 'No'}`);
} else {
  console.log('   No compatible model found for this device');
}
console.log('');

// 6. Summary
console.log('6. Summary:');
console.log(`   Device Tier: ${capabilities.tier}`);
console.log(`   Compatible Models: ${allCompatible.length}`);
console.log(`   Recommended: ${recommended ? recommended.name : 'None'}`);
console.log('');

console.log('=== Demo Complete ===');
console.log('');
console.log('Usage:');
console.log('  // Auto-select model based on device');
console.log('  await initializeAI({ autoSelectModel: true });');
console.log('');
console.log('  // Check compatibility before loading');
console.log('  if (isDeviceCompatible("phi-3-mini")) {');
console.log('    await initializeAI({ modelId: "phi-3-mini" });');
console.log('  }');
