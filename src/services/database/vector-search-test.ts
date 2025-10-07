/**
 * Vector Search Test Suite
 * Comprehensive tests for vector similarity search and semantic search
 */

import {
  initDatabase,
  createDocument,
  createEmbedding,
  searchSimilarEmbeddings,
  semanticSearch,
  deleteDocument,
  closeDatabase,
} from './index';

interface VectorTestResult {
  test: string;
  passed: boolean;
  details?: string;
  error?: string;
}

/**
 * Test vector similarity search with various scenarios
 */
export async function runVectorSearchTests(): Promise<VectorTestResult[]> {
  const results: VectorTestResult[] = [];

  try {
    await initDatabase();

    // Test 1: Empty database search
    try {
      const emptyResults = await searchSimilarEmbeddings([0.5, 0.5, 0.5], 10, 0.5);
      results.push({
        test: 'Empty database search',
        passed: emptyResults.length === 0,
        details: `Expected 0 results, got ${emptyResults.length}`,
      });
    } catch (error) {
      results.push({
        test: 'Empty database search',
        passed: false,
        error: String(error),
      });
    }

    // Test 2: Search with identical vectors (similarity = 1.0)
    try {
      await createDocument('test-identical', 'Test Doc', 'Content');
      const testVector = [0.5, 0.5, 0.5, 0.5];
      await createEmbedding('emb-identical', 'test-identical', testVector);

      const identicalResults = await searchSimilarEmbeddings(testVector, 10, 0.0);
      const isIdentical = identicalResults.length === 1 && 
        Math.abs(identicalResults[0].similarity - 1.0) < 0.0001;

      results.push({
        test: 'Identical vector search (similarity = 1.0)',
        passed: isIdentical,
        details: `Similarity: ${identicalResults[0]?.similarity.toFixed(4)}`,
      });

      await deleteDocument('test-identical');
    } catch (error) {
      results.push({
        test: 'Identical vector search',
        passed: false,
        error: String(error),
      });
    }

    // Test 3: Search with orthogonal vectors (similarity ≈ 0)
    try {
      await createDocument('test-ortho-1', 'Doc 1', 'Content 1');
      await createDocument('test-ortho-2', 'Doc 2', 'Content 2');
      
      const vector1 = [1.0, 0.0, 0.0, 0.0];
      const vector2 = [0.0, 1.0, 0.0, 0.0];
      
      await createEmbedding('emb-ortho-1', 'test-ortho-1', vector1);
      await createEmbedding('emb-ortho-2', 'test-ortho-2', vector2);

      const orthoResults = await searchSimilarEmbeddings(vector1, 10, 0.0);
      const orthogonalSimilarity = orthoResults.find(r => r.id === 'emb-ortho-2')?.similarity || 0;
      const isOrthogonal = Math.abs(orthogonalSimilarity) < 0.0001;

      results.push({
        test: 'Orthogonal vector search (similarity ≈ 0)',
        passed: isOrthogonal,
        details: `Similarity: ${orthogonalSimilarity.toFixed(4)}`,
      });

      await deleteDocument('test-ortho-1');
      await deleteDocument('test-ortho-2');
    } catch (error) {
      results.push({
        test: 'Orthogonal vector search',
        passed: false,
        error: String(error),
      });
    }

    // Test 4: Search with opposite vectors (similarity = -1.0)
    try {
      await createDocument('test-opposite', 'Doc Opposite', 'Content');
      
      const vectorPos = [1.0, 1.0, 1.0];
      const vectorNeg = [-1.0, -1.0, -1.0];
      
      await createEmbedding('emb-opposite', 'test-opposite', vectorNeg);

      const oppositeResults = await searchSimilarEmbeddings(vectorPos, 10, -2.0);
      const oppositeSimilarity = oppositeResults[0]?.similarity || 0;
      const isOpposite = Math.abs(oppositeSimilarity - (-1.0)) < 0.0001;

      results.push({
        test: 'Opposite vector search (similarity = -1.0)',
        passed: isOpposite,
        details: `Similarity: ${oppositeSimilarity.toFixed(4)}`,
      });

      await deleteDocument('test-opposite');
    } catch (error) {
      results.push({
        test: 'Opposite vector search',
        passed: false,
        error: String(error),
      });
    }

    // Test 5: Similarity threshold filtering
    try {
      await createDocument('test-filter-1', 'High Similarity', 'Content');
      await createDocument('test-filter-2', 'Low Similarity', 'Content');
      
      const queryVec = [1.0, 0.0, 0.0];
      const highSimVec = [0.9, 0.1, 0.0]; // High similarity
      const lowSimVec = [0.0, 0.0, 1.0];  // Low similarity
      
      await createEmbedding('emb-high', 'test-filter-1', highSimVec);
      await createEmbedding('emb-low', 'test-filter-2', lowSimVec);

      const filteredResults = await searchSimilarEmbeddings(queryVec, 10, 0.7);
      const onlyHighSim = filteredResults.every(r => r.similarity >= 0.7);
      const hasHighSim = filteredResults.some(r => r.id === 'emb-high');
      const noLowSim = !filteredResults.some(r => r.id === 'emb-low');

      results.push({
        test: 'Similarity threshold filtering (minSimilarity = 0.7)',
        passed: onlyHighSim && hasHighSim && noLowSim,
        details: `Results: ${filteredResults.length}, All >= 0.7: ${onlyHighSim}`,
      });

      await deleteDocument('test-filter-1');
      await deleteDocument('test-filter-2');
    } catch (error) {
      results.push({
        test: 'Similarity threshold filtering',
        passed: false,
        error: String(error),
      });
    }

    // Test 6: Result limit
    try {
      // Create 5 documents with embeddings
      for (let i = 0; i < 5; i++) {
        await createDocument(`test-limit-${i}`, `Doc ${i}`, 'Content');
        await createEmbedding(`emb-limit-${i}`, `test-limit-${i}`, [0.5, 0.5, 0.5]);
      }

      const limitedResults = await searchSimilarEmbeddings([0.5, 0.5, 0.5], 3, 0.0);
      const respectsLimit = limitedResults.length === 3;

      results.push({
        test: 'Result limit (limit = 3)',
        passed: respectsLimit,
        details: `Expected 3 results, got ${limitedResults.length}`,
      });

      for (let i = 0; i < 5; i++) {
        await deleteDocument(`test-limit-${i}`);
      }
    } catch (error) {
      results.push({
        test: 'Result limit',
        passed: false,
        error: String(error),
      });
    }

    // Test 7: Results sorted by similarity (descending)
    try {
      await createDocument('test-sort-1', 'Doc High', 'Content');
      await createDocument('test-sort-2', 'Doc Med', 'Content');
      await createDocument('test-sort-3', 'Doc Low', 'Content');
      
      const queryVec = [1.0, 0.0, 0.0];
      await createEmbedding('emb-high', 'test-sort-1', [0.95, 0.05, 0.0]);
      await createEmbedding('emb-med', 'test-sort-2', [0.7, 0.3, 0.0]);
      await createEmbedding('emb-low', 'test-sort-3', [0.5, 0.5, 0.0]);

      const sortedResults = await searchSimilarEmbeddings(queryVec, 10, 0.0);
      let isSorted = true;
      for (let i = 1; i < sortedResults.length; i++) {
        if (sortedResults[i].similarity > sortedResults[i - 1].similarity) {
          isSorted = false;
          break;
        }
      }

      results.push({
        test: 'Results sorted by similarity (descending)',
        passed: isSorted,
        details: `Similarities: ${sortedResults.map(r => r.similarity.toFixed(2)).join(', ')}`,
      });

      await deleteDocument('test-sort-1');
      await deleteDocument('test-sort-2');
      await deleteDocument('test-sort-3');
    } catch (error) {
      results.push({
        test: 'Results sorted by similarity',
        passed: false,
        error: String(error),
      });
    }

    // Test 8: Validation - empty vector
    try {
      let validationFailed = false;
      try {
        await searchSimilarEmbeddings([], 10, 0.5);
      } catch (error) {
        validationFailed = error instanceof Error && error.name === 'ValidationError';
      }

      results.push({
        test: 'Validation: empty query vector',
        passed: validationFailed,
        details: validationFailed ? 'Correctly rejected empty vector' : 'Failed to reject',
      });
    } catch (error) {
      results.push({
        test: 'Validation: empty query vector',
        passed: false,
        error: String(error),
      });
    }

    // Test 9: Validation - invalid similarity threshold
    try {
      let validationFailed = false;
      try {
        await searchSimilarEmbeddings([0.5, 0.5], 10, 1.5);
      } catch (error) {
        validationFailed = error instanceof Error && error.name === 'ValidationError';
      }

      results.push({
        test: 'Validation: invalid similarity threshold (> 1)',
        passed: validationFailed,
        details: validationFailed ? 'Correctly rejected invalid threshold' : 'Failed to reject',
      });
    } catch (error) {
      results.push({
        test: 'Validation: invalid similarity threshold',
        passed: false,
        error: String(error),
      });
    }

    // Test 10: Validation - negative limit
    try {
      let validationFailed = false;
      try {
        await searchSimilarEmbeddings([0.5, 0.5], -1, 0.5);
      } catch (error) {
        validationFailed = error instanceof Error && error.name === 'ValidationError';
      }

      results.push({
        test: 'Validation: negative limit',
        passed: validationFailed,
        details: validationFailed ? 'Correctly rejected negative limit' : 'Failed to reject',
      });
    } catch (error) {
      results.push({
        test: 'Validation: negative limit',
        passed: false,
        error: String(error),
      });
    }

    // Test 11: Vector with invalid values (NaN, Infinity)
    try {
      let validationFailed = false;
      try {
        await searchSimilarEmbeddings([0.5, NaN, 0.5], 10, 0.5);
      } catch (error) {
        validationFailed = error instanceof Error && error.name === 'ValidationError';
      }

      results.push({
        test: 'Validation: vector with NaN values',
        passed: validationFailed,
        details: validationFailed ? 'Correctly rejected NaN values' : 'Failed to reject',
      });
    } catch (error) {
      results.push({
        test: 'Validation: vector with NaN values',
        passed: false,
        error: String(error),
      });
    }

    // Test 12: Semantic search integration
    try {
      await createDocument('test-semantic', 'AI Document', 'About artificial intelligence');
      
      const { generateEmbedding } = await import('../ai');
      const { vector } = await generateEmbedding('artificial intelligence');
      await createEmbedding('emb-semantic', 'test-semantic', vector);

      const semanticResults = await semanticSearch('AI and machine learning', 5, 0.0);
      const hasResults = semanticResults.length > 0;
      const hasSimilarity = semanticResults.every(r => r.similarity !== undefined);

      results.push({
        test: 'Semantic search integration',
        passed: hasResults && hasSimilarity,
        details: `Found ${semanticResults.length} results with similarity scores`,
      });

      await deleteDocument('test-semantic');
    } catch (error) {
      results.push({
        test: 'Semantic search integration',
        passed: false,
        error: String(error),
      });
    }

    await closeDatabase();
  } catch (error) {
    results.push({
      test: 'Vector search test suite',
      passed: false,
      error: String(error),
    });
  }

  return results;
}

/**
 * Print vector search test results to console
 */
export async function printVectorSearchTestResults(): Promise<void> {
  console.log('🧪 Running Vector Search Tests...\n');

  const results = await runVectorSearchTests();
  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.passed) passedCount++;
    else failedCount++;
  });

  console.log(`\n📊 Vector Search Results: ${passedCount} passed, ${failedCount} failed`);
  console.log(`   Success Rate: ${((passedCount / results.length) * 100).toFixed(1)}%`);
}

// Uncomment to run tests automatically:
// printVectorSearchTestResults().catch(console.error);
