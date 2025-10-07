/**
 * Example usage of the AI Loading Engine
 * Demonstrates ONNX Runtime (primary) and WASM (fallback) integration
 */

import {
  initializeAI,
  generateEmbedding,
  getCurrentEngine,
  disposeAI,
  EngineStrategy,
  LoadingEngineType,
} from '../services/ai';

/**
 * Example 1: Auto-initialization with default settings
 * Uses WASM (transformers.js) as it doesn't require a model file
 */
export async function basicUsageExample() {
  console.log('\n=== Example 1: Basic Usage ===\n');

  try {
    // The AI service will auto-initialize on first use with WASM fallback
    const result = await generateEmbedding('Hello, world!');
    
    console.log('Embedding generated:');
    console.log('- Dimensionality:', result.dimensionality);
    console.log('- Vector length:', result.vector.length);
    console.log('- First 5 values:', result.vector.slice(0, 5));
    console.log('- Current engine:', getCurrentEngine());

  } catch (error) {
    console.error('Failed to generate embedding:', error);
  }
}

/**
 * Example 2: Explicit initialization with WASM-only strategy
 */
export async function wasmOnlyExample() {
  console.log('\n=== Example 2: WASM-Only Strategy ===\n');

  try {
    // Explicitly initialize with WASM-only strategy
    await initializeAI({
      modelName: 'nomic-ai/nomic-embed-text-v1.5',
      dimension: 768,
      strategy: EngineStrategy.WASM_ONLY,
    });

    const engine = getCurrentEngine();
    console.log('Initialized with engine:', engine);

    if (engine === LoadingEngineType.WASM) {
      console.log('✅ Using WASM (transformers.js) engine');
    }

    // Generate embeddings
    const texts = [
      'Artificial intelligence',
      'Machine learning',
      'Deep learning',
    ];

    console.log('\nGenerating embeddings for multiple texts:');
    for (const text of texts) {
      const result = await generateEmbedding(text);
      console.log(`- "${text}": ${result.dimensionality}D vector`);
    }

  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await disposeAI();
  }
}

/**
 * Example 3: ONNX Runtime with local model (requires model file)
 */
export async function onnxWithLocalModelExample() {
  console.log('\n=== Example 3: ONNX with Local Model ===\n');

  try {
    // Initialize with ONNX and local model path
    // Note: This requires an actual ONNX model file to be available
    await initializeAI({
      modelName: 'nomic-embed-text',
      modelPath: '/models/nomic-embed-text.onnx',
      dimension: 768,
      strategy: EngineStrategy.AUTO, // Will try ONNX first, fallback to WASM
    });

    const engine = getCurrentEngine();
    console.log('Initialized with engine:', engine);

    if (engine === LoadingEngineType.ONNX) {
      console.log('✅ Using ONNX Runtime (optimized)');
    } else if (engine === LoadingEngineType.WASM) {
      console.log('⚠️  ONNX not available, using WASM fallback');
    }

    // Generate embedding
    const result = await generateEmbedding('Test with ONNX Runtime');
    console.log('Embedding generated:', result.dimensionality, 'dimensions');

  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await disposeAI();
  }
}

/**
 * Example 4: Semantic similarity comparison
 */
export async function semanticSimilarityExample() {
  console.log('\n=== Example 4: Semantic Similarity ===\n');

  try {
    // Initialize AI service
    await initializeAI({
      strategy: EngineStrategy.WASM_ONLY,
    });

    // Import cosineSimilarity after initialization
    const { cosineSimilarity } = await import('../services/ai');

    // Generate embeddings for similar and dissimilar texts
    const text1 = 'The cat sat on the mat';
    const text2 = 'A feline rested on a rug';
    const text3 = 'Python is a programming language';

    const emb1 = await generateEmbedding(text1);
    const emb2 = await generateEmbedding(text2);
    const emb3 = await generateEmbedding(text3);

    // Calculate similarities
    const sim12 = cosineSimilarity(emb1.vector, emb2.vector);
    const sim13 = cosineSimilarity(emb1.vector, emb3.vector);
    const sim23 = cosineSimilarity(emb2.vector, emb3.vector);

    console.log('Similarity scores:');
    console.log(`- "${text1}" vs "${text2}": ${(sim12 * 100).toFixed(2)}%`);
    console.log(`- "${text1}" vs "${text3}": ${(sim13 * 100).toFixed(2)}%`);
    console.log(`- "${text2}" vs "${text3}": ${(sim23 * 100).toFixed(2)}%`);

    console.log('\nExpected: text1 and text2 should be more similar than text1 and text3');

  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await disposeAI();
  }
}

/**
 * Example 5: Error handling and graceful degradation
 */
export async function errorHandlingExample() {
  console.log('\n=== Example 5: Error Handling ===\n');

  try {
    // Try to initialize with ONNX-only (will likely fail without model)
    await initializeAI({
      modelPath: '/nonexistent/model.onnx',
      strategy: EngineStrategy.ONNX_ONLY,
    });

    console.log('ONNX initialized successfully');

  } catch (error) {
    console.log('❌ ONNX initialization failed (expected)');
    console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Fallback to WASM
    console.log('\n⚠️  Falling back to WASM...');
    
    try {
      await initializeAI({
        strategy: EngineStrategy.WASM_ONLY,
      });
      
      console.log('✅ WASM initialized successfully');
      
      const result = await generateEmbedding('Fallback test');
      console.log('Embedding generated with fallback:', result.dimensionality, 'dimensions');
      
    } catch (fallbackError) {
      console.error('❌ Even WASM fallback failed:', fallbackError);
    }
  } finally {
    await disposeAI();
  }
}

/**
 * Example 6: Performance benchmark
 */
export async function performanceBenchmarkExample() {
  console.log('\n=== Example 6: Performance Benchmark ===\n');

  try {
    await initializeAI({
      strategy: EngineStrategy.WASM_ONLY,
    });

    const testTexts = [
      'Short text',
      'This is a medium length text that contains a few more words than the previous one.',
      'This is a longer text that demonstrates the performance of the embedding generation with various text lengths. It includes multiple sentences and should give us a good idea of how the model performs with more substantial input.',
    ];

    console.log('Benchmarking embedding generation:\n');

    for (const text of testTexts) {
      const startTime = performance.now();
      const result = await generateEmbedding(text);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      console.log(`Text length: ${text.length} chars`);
      console.log(`Time: ${duration.toFixed(2)}ms`);
      console.log(`Dimensionality: ${result.dimensionality}`);
      console.log('---');
    }

    const engine = getCurrentEngine();
    console.log(`\nEngine used: ${engine}`);

  } catch (error) {
    console.error('Benchmark failed:', error);
  } finally {
    await disposeAI();
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   AI Loading Engine Examples                        ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  await basicUsageExample();
  await wasmOnlyExample();
  await onnxWithLocalModelExample();
  await semanticSimilarityExample();
  await errorHandlingExample();
  await performanceBenchmarkExample();

  console.log('\n✅ All examples completed!\n');
}

// Export individual examples for selective running
export default {
  basicUsageExample,
  wasmOnlyExample,
  onnxWithLocalModelExample,
  semanticSimilarityExample,
  errorHandlingExample,
  performanceBenchmarkExample,
  runAllExamples,
};
