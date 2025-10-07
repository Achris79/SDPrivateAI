/**
 * Simple Demo/Test Script for AI Model Selection
 * Run this to verify the model selection functionality
 * 
 * Note: This is a demonstration script. In a real application, you would
 * integrate this with your UI components.
 */

import {
  initializeAI,
  switchModel,
  getCurrentModel,
  getAllModels,
  getModelsByType,
  getDefaultModel,
  disposeAI,
} from '../services/ai';

/**
 * Demo: Basic model selection
 */
async function demoBasicSelection() {
  console.log('=== Demo: Basic Model Selection ===\n');
  
  // Get default model info without initializing
  const defaultModel = getDefaultModel();
  console.log('📌 Default Model:', defaultModel.name);
  console.log('   ID:', defaultModel.id);
  console.log('   Type:', defaultModel.type);
  console.log('   Dimension:', defaultModel.dimension);
  console.log('   Description:', defaultModel.description);
  console.log('');
}

/**
 * Demo: List all available models
 */
async function demoListModels() {
  console.log('=== Demo: Available Models ===\n');
  
  const allModels = getAllModels();
  console.log(`📋 Total Models: ${allModels.length}\n`);
  
  allModels.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name} (${model.id})`);
    console.log(`   Type: ${model.type}`);
    console.log(`   Dimension: ${model.dimension}`);
    console.log(`   HuggingFace: ${model.modelName}`);
    console.log('');
  });
}

/**
 * Demo: Filter models by type
 */
async function demoFilterByType() {
  console.log('=== Demo: Filter Models by Type ===\n');
  
  const llmModels = getModelsByType('llm');
  console.log('🤖 Language Models (LLM):');
  llmModels.forEach(model => {
    console.log(`   • ${model.name} - ${model.dimension}D`);
  });
  console.log('');
  
  const embeddingModels = getModelsByType('embedding');
  console.log('🔤 Embedding Models:');
  embeddingModels.forEach(model => {
    console.log(`   • ${model.name} - ${model.dimension}D`);
  });
  console.log('');
}

/**
 * Demo: Model initialization info
 */
async function demoModelInitialization() {
  console.log('=== Demo: Model Initialization ===\n');
  
  console.log('ℹ️  When you call initializeAI():');
  console.log('   1. Default model (Phi-3 Mini) will be used');
  console.log('   2. Model will be downloaded from HuggingFace (first time)');
  console.log('   3. Model will be cached in browser for future use');
  console.log('   4. WASM engine will be initialized');
  console.log('');
  
  console.log('ℹ️  To use a different model:');
  console.log('   await initializeAI({ modelId: "nomic-embed" })');
  console.log('   await initializeAI({ modelId: "phi-2" })');
  console.log('   await initializeAI({ modelId: "all-minilm" })');
  console.log('');
  
  console.log('ℹ️  To switch models at runtime:');
  console.log('   await switchModel("nomic-embed")');
  console.log('   const current = getCurrentModel()');
  console.log('');
}

/**
 * Demo: Custom model configuration
 */
async function demoCustomConfiguration() {
  console.log('=== Demo: Custom Configuration ===\n');
  
  console.log('📝 You can also use custom models not in the registry:');
  console.log('');
  console.log('await initializeAI({');
  console.log('  modelName: "your-org/your-model",');
  console.log('  dimension: 512,');
  console.log('  strategy: EngineStrategy.WASM_ONLY,');
  console.log('});');
  console.log('');
  console.log('This creates a "custom" model entry with your configuration.');
  console.log('');
}

/**
 * Demo: Model comparison
 */
async function demoModelComparison() {
  console.log('=== Demo: Model Comparison ===\n');
  
  console.log('Model Characteristics:\n');
  
  console.log('🚀 Phi-3 Mini (Default)');
  console.log('   • Type: Language Model');
  console.log('   • Dimension: 3072');
  console.log('   • Best for: General text understanding, versatile tasks');
  console.log('   • Size: ~7GB (quantized)');
  console.log('');
  
  console.log('🚀 Phi-2');
  console.log('   • Type: Language Model');
  console.log('   • Dimension: 2560');
  console.log('   • Best for: Compact, fast inference');
  console.log('   • Size: ~5GB (quantized)');
  console.log('');
  
  console.log('📊 Nomic Embed Text');
  console.log('   • Type: Embedding Model');
  console.log('   • Dimension: 768');
  console.log('   • Best for: High-quality text embeddings, semantic search');
  console.log('   • Size: ~250MB (quantized)');
  console.log('');
  
  console.log('⚡ All-MiniLM-L6');
  console.log('   • Type: Embedding Model');
  console.log('   • Dimension: 384');
  console.log('   • Best for: Fast embeddings, lower resource usage');
  console.log('   • Size: ~90MB (quantized)');
  console.log('');
}

/**
 * Run all demos
 */
async function runAllDemos() {
  console.log('\n🤖 AI Model Selection - Demo & Test Suite\n');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    await demoBasicSelection();
    await demoListModels();
    await demoFilterByType();
    await demoModelInitialization();
    await demoCustomConfiguration();
    await demoModelComparison();
    
    console.log('='.repeat(60));
    console.log('\n✅ All demos completed successfully!\n');
    console.log('📚 For more information, see:');
    console.log('   • docs/AI_MODEL_SELECTION.md');
    console.log('   • src/examples/model-switching-examples.ts');
    console.log('');
    console.log('🚀 To use in your app:');
    console.log('   import { initializeAI, switchModel } from "./services/ai"');
    console.log('');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Export for use in other scripts
export {
  demoBasicSelection,
  demoListModels,
  demoFilterByType,
  demoModelInitialization,
  demoCustomConfiguration,
  demoModelComparison,
  runAllDemos,
};

// If running directly (not imported), run all demos
if (typeof window === 'undefined' || !import.meta.url) {
  runAllDemos().catch(console.error);
}
