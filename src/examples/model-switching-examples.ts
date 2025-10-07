/**
 * AI Model Switching Examples
 * Demonstrates how to use the flexible model selection feature
 */

import {
  initializeAI,
  switchModel,
  getCurrentModel,
  getAllModels,
  getModelsByType,
  generateEmbedding,
  disposeAI,
  EngineStrategy,
} from '../services/ai';

/**
 * Example 1: Use default model (Phi-3 Mini)
 */
async function useDefaultModel() {
  console.log('=== Example 1: Use Default Model ===');
  
  // Initialize with default configuration (Phi-3 Mini)
  await initializeAI();
  
  const currentModel = getCurrentModel();
  console.log('Current model:', currentModel?.name);
  console.log('Model ID:', currentModel?.id);
  console.log('Dimension:', currentModel?.dimension);
  
  // Generate embedding
  const result = await generateEmbedding('Hello, world!');
  console.log('Embedding dimension:', result.dimensionality);
  
  await disposeAI();
}

/**
 * Example 2: Initialize with a specific model
 */
async function useSpecificModel() {
  console.log('\n=== Example 2: Initialize with Specific Model ===');
  
  // Initialize with Nomic Embed model
  await initializeAI({ modelId: 'nomic-embed' });
  
  const currentModel = getCurrentModel();
  console.log('Current model:', currentModel?.name);
  console.log('Model dimension:', currentModel?.dimension);
  
  await disposeAI();
}

/**
 * Example 3: Switch between models at runtime
 */
async function switchBetweenModels() {
  console.log('\n=== Example 3: Switch Between Models ===');
  
  // Start with default model (Phi-3 Mini)
  await initializeAI();
  console.log('Initial model:', getCurrentModel()?.name);
  
  // Switch to Nomic Embed
  await switchModel('nomic-embed');
  console.log('After switch:', getCurrentModel()?.name);
  
  // Switch to All-MiniLM
  await switchModel('all-minilm');
  console.log('After second switch:', getCurrentModel()?.name);
  
  await disposeAI();
}

/**
 * Example 4: List all available models
 */
async function listAvailableModels() {
  console.log('\n=== Example 4: List Available Models ===');
  
  const allModels = getAllModels();
  console.log('Total models available:', allModels.length);
  
  allModels.forEach(model => {
    console.log(`\n${model.name} (${model.id})`);
    console.log(`  Type: ${model.type}`);
    console.log(`  Dimension: ${model.dimension}`);
    console.log(`  Description: ${model.description}`);
  });
}

/**
 * Example 5: Get models by type
 */
async function getModelsByTypeExample() {
  console.log('\n=== Example 5: Filter Models by Type ===');
  
  const llmModels = getModelsByType('llm');
  console.log('Language Models:');
  llmModels.forEach(model => console.log(`  - ${model.name}`));
  
  const embeddingModels = getModelsByType('embedding');
  console.log('\nEmbedding Models:');
  embeddingModels.forEach(model => console.log(`  - ${model.name}`));
}

/**
 * Example 6: Use custom model configuration
 */
async function useCustomModel() {
  console.log('\n=== Example 6: Custom Model Configuration ===');
  
  // Use a custom model not in the registry
  await initializeAI({
    modelName: 'custom/my-model',
    dimension: 512,
    strategy: EngineStrategy.WASM_ONLY,
  });
  
  const currentModel = getCurrentModel();
  console.log('Custom model:', currentModel?.name);
  console.log('Model ID:', currentModel?.id);
  
  await disposeAI();
}

/**
 * Example 7: Model switching with download progress (conceptual)
 */
async function modelSwitchingWithProgress() {
  console.log('\n=== Example 7: Model Switching (Downloads on First Use) ===');
  
  console.log('Switching to Phi-2 model...');
  console.log('Note: First time will download the model from HuggingFace');
  
  await switchModel('phi-2');
  
  console.log('Model switched and cached successfully!');
  console.log('Current model:', getCurrentModel()?.name);
  
  await disposeAI();
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  try {
    await useDefaultModel();
    await useSpecificModel();
    await switchBetweenModels();
    await listAvailableModels();
    await getModelsByTypeExample();
    // await useCustomModel(); // Uncomment to test custom models
    // await modelSwitchingWithProgress(); // Uncomment to test model download
    
    console.log('\n=== All Examples Completed Successfully ===');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export individual examples
export {
  useDefaultModel,
  useSpecificModel,
  switchBetweenModels,
  listAvailableModels,
  getModelsByTypeExample,
  useCustomModel,
  modelSwitchingWithProgress,
};
