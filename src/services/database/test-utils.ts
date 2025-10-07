/**
 * Manual database test utility
 * Run this to verify database operations work correctly
 * 
 * Usage in browser console or separate script:
 * import { runDatabaseTests } from './services/database/test-utils';
 * runDatabaseTests();
 */

import {
  initDatabase,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
  searchDocuments,
  createEmbedding,
  getEmbedding,
  getEmbeddingsByDocumentId,
  deleteEmbedding,
  deleteEmbeddingsByDocumentId,
  searchSimilarEmbeddings,
  semanticSearch,
  closeDatabase,
} from './index';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
}

/**
 * Run all database tests
 */
export async function runDatabaseTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    // Initialize database
    await initDatabase();
    results.push({ test: 'Initialize database', passed: true });

    // Test 1: Create document
    try {
      const doc = await createDocument(
        'test-doc-1',
        'Test Document',
        'This is a test document',
        { tags: ['test'], category: 'test' }
      );
      results.push({
        test: 'Create document',
        passed: doc.id === 'test-doc-1' && doc.title === 'Test Document',
      });
    } catch (error) {
      results.push({ test: 'Create document', passed: false, error: String(error) });
    }

    // Test 2: Get document
    try {
      const doc = await getDocument('test-doc-1');
      results.push({
        test: 'Get document',
        passed: doc !== null && doc.id === 'test-doc-1',
      });
    } catch (error) {
      results.push({ test: 'Get document', passed: false, error: String(error) });
    }

    // Test 3: Update document
    try {
      const updated = await updateDocument('test-doc-1', {
        title: 'Updated Title',
      });
      results.push({
        test: 'Update document',
        passed: updated !== null && updated.title === 'Updated Title',
      });
    } catch (error) {
      results.push({ test: 'Update document', passed: false, error: String(error) });
    }

    // Test 4: Search documents
    try {
      const searchResults = await searchDocuments('Updated');
      results.push({
        test: 'Search documents',
        passed: searchResults.length > 0,
      });
    } catch (error) {
      results.push({ test: 'Search documents', passed: false, error: String(error) });
    }

    // Test 5: Create embedding
    try {
      const emb = await createEmbedding(
        'test-emb-1',
        'test-doc-1',
        [0.1, 0.2, 0.3, 0.4, 0.5],
        { model: 'test' }
      );
      results.push({
        test: 'Create embedding',
        passed: emb.id === 'test-emb-1' && emb.vector.length === 5,
      });
    } catch (error) {
      results.push({ test: 'Create embedding', passed: false, error: String(error) });
    }

    // Test 6: Get embedding
    try {
      const emb = await getEmbedding('test-emb-1');
      results.push({
        test: 'Get embedding',
        passed: emb !== null && emb.id === 'test-emb-1',
      });
    } catch (error) {
      results.push({ test: 'Get embedding', passed: false, error: String(error) });
    }

    // Test 7: Get embeddings by document ID
    try {
      const embeddings = await getEmbeddingsByDocumentId('test-doc-1');
      results.push({
        test: 'Get embeddings by document',
        passed: embeddings.length > 0,
      });
    } catch (error) {
      results.push({
        test: 'Get embeddings by document',
        passed: false,
        error: String(error),
      });
    }

    // Test 8: List documents
    try {
      const docs = await listDocuments(10, 0);
      results.push({
        test: 'List documents',
        passed: docs.length > 0,
      });
    } catch (error) {
      results.push({ test: 'List documents', passed: false, error: String(error) });
    }

    // Test 9: Delete embedding
    try {
      const deleted = await deleteEmbedding('test-emb-1');
      results.push({
        test: 'Delete embedding',
        passed: deleted === true,
      });
    } catch (error) {
      results.push({ test: 'Delete embedding', passed: false, error: String(error) });
    }

    // Test 10: Create multiple embeddings and delete by document ID
    try {
      await createEmbedding('test-emb-2', 'test-doc-1', [0.5, 0.6], { model: 'test' });
      await createEmbedding('test-emb-3', 'test-doc-1', [0.7, 0.8], { model: 'test' });
      const deletedCount = await deleteEmbeddingsByDocumentId('test-doc-1');
      results.push({
        test: 'Delete embeddings by document ID',
        passed: deletedCount === 2,
      });
    } catch (error) {
      results.push({
        test: 'Delete embeddings by document ID',
        passed: false,
        error: String(error),
      });
    }

    // Test 11: Delete document
    try {
      const deleted = await deleteDocument('test-doc-1');
      results.push({
        test: 'Delete document',
        passed: deleted === true,
      });
    } catch (error) {
      results.push({ test: 'Delete document', passed: false, error: String(error) });
    }

    // Test 12: Verify document deleted
    try {
      const doc = await getDocument('test-doc-1');
      results.push({
        test: 'Verify document deleted',
        passed: doc === null,
      });
    } catch (error) {
      results.push({
        test: 'Verify document deleted',
        passed: false,
        error: String(error),
      });
    }

    // Test 13: Vector similarity search
    try {
      // Create test documents and embeddings for vector search
      await createDocument('vec-doc-1', 'AI Document', 'About artificial intelligence');
      await createDocument('vec-doc-2', 'ML Document', 'About machine learning');
      
      // Create embeddings with different similarity levels
      const baseVector = [0.5, 0.5, 0.5, 0.5, 0.5];
      const similarVector = [0.52, 0.48, 0.51, 0.49, 0.5]; // Similar to base
      const differentVector = [-0.5, -0.5, -0.5, -0.5, -0.5]; // Opposite
      
      await createEmbedding('vec-emb-1', 'vec-doc-1', baseVector);
      await createEmbedding('vec-emb-2', 'vec-doc-2', similarVector);
      await createEmbedding('vec-emb-3', 'vec-doc-2', differentVector);
      
      // Search with base vector
      const searchResults = await searchSimilarEmbeddings(baseVector, 10, 0.5);
      
      // Should find similar vectors and filter out dissimilar ones
      const hasSimilarResults = searchResults.length > 0;
      const resultsAreSorted = searchResults.length <= 1 || 
        searchResults[0].similarity >= searchResults[searchResults.length - 1].similarity;
      
      results.push({
        test: 'Vector similarity search',
        passed: hasSimilarResults && resultsAreSorted,
      });
      
      // Cleanup
      await deleteDocument('vec-doc-1');
      await deleteDocument('vec-doc-2');
    } catch (error) {
      results.push({
        test: 'Vector similarity search',
        passed: false,
        error: String(error),
      });
    }

    // Test 14: Semantic search
    try {
      // Create test documents with embeddings
      await createDocument(
        'sem-doc-1',
        'Machine Learning Guide',
        'A comprehensive guide to machine learning algorithms and techniques'
      );
      await createDocument(
        'sem-doc-2',
        'Cooking Recipes',
        'Delicious recipes for everyday cooking'
      );
      
      // Import AI service to generate embeddings
      const { generateEmbedding } = await import('../ai');
      
      const mlEmbedding = await generateEmbedding('machine learning guide');
      const cookingEmbedding = await generateEmbedding('cooking recipes');
      
      await createEmbedding('sem-emb-1', 'sem-doc-1', mlEmbedding.vector);
      await createEmbedding('sem-emb-2', 'sem-doc-2', cookingEmbedding.vector);
      
      // Semantic search for machine learning content
      const semanticResults = await semanticSearch('machine learning', 5, 0.0);
      
      results.push({
        test: 'Semantic search',
        passed: semanticResults.length > 0 && semanticResults[0].similarity !== undefined,
      });
      
      // Cleanup
      await deleteDocument('sem-doc-1');
      await deleteDocument('sem-doc-2');
    } catch (error) {
      results.push({
        test: 'Semantic search',
        passed: false,
        error: String(error),
      });
    }

    // Test 15: Vector search with validation errors
    try {
      let validationError = false;
      
      // Test with empty vector
      try {
        await searchSimilarEmbeddings([], 10, 0.5);
      } catch (error) {
        validationError = error instanceof Error && error.name === 'ValidationError';
      }
      
      results.push({
        test: 'Vector search validation (empty vector)',
        passed: validationError,
      });
    } catch (error) {
      results.push({
        test: 'Vector search validation (empty vector)',
        passed: false,
        error: String(error),
      });
    }

    // Test 16: Vector search with invalid similarity threshold
    try {
      let validationError = false;
      
      // Test with invalid minSimilarity > 1
      try {
        await searchSimilarEmbeddings([0.1, 0.2], 10, 1.5);
      } catch (error) {
        validationError = error instanceof Error && error.name === 'ValidationError';
      }
      
      results.push({
        test: 'Vector search validation (invalid threshold)',
        passed: validationError,
      });
    } catch (error) {
      results.push({
        test: 'Vector search validation (invalid threshold)',
        passed: false,
        error: String(error),
      });
    }

    // Close database
    await closeDatabase();
    results.push({ test: 'Close database', passed: true });
  } catch (error) {
    results.push({ test: 'Database test suite', passed: false, error: String(error) });
  }

  return results;
}

/**
 * Print test results to console
 */
export async function printTestResults(): Promise<void> {
  console.log('🧪 Running database tests...\n');

  const results = await runDatabaseTests();
  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.passed) passedCount++;
    else failedCount++;
  });

  console.log(`\n📊 Results: ${passedCount} passed, ${failedCount} failed`);
}

// Uncomment to run tests automatically:
// printTestResults().catch(console.error);
