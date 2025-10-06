/**
 * Example usage of the database service
 * Demonstrates CRUD operations for documents, embeddings, and vector search
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
  searchSimilarEmbeddings,
  semanticSearch,
  closeDatabase,
} from './index';

/**
 * Example: Document CRUD operations
 */
async function documentExample() {
  // Initialize database
  await initDatabase();

  // 1. Create a document
  const doc = await createDocument(
    'doc-001',
    'Erste Notiz',
    'Dies ist meine erste Notiz in der lokalen Datenbank.',
    {
      tags: ['wichtig', 'privat'],
      category: 'Notizen',
      author: 'User',
    }
  );
  console.log('Created document:', doc);

  // 2. Get the document
  const retrieved = await getDocument('doc-001');
  console.log('Retrieved document:', retrieved);

  // 3. Update the document
  const updated = await updateDocument('doc-001', {
    title: 'Aktualisierte Notiz',
    content: 'Der Inhalt wurde aktualisiert.',
  });
  console.log('Updated document:', updated);

  // 4. Create more documents
  await createDocument(
    'doc-002',
    'Zweite Notiz',
    'Noch eine Notiz für Tests.',
    { tags: ['test'] }
  );

  await createDocument(
    'doc-003',
    'Meeting Notizen',
    'Notizen vom Meeting am 15.01.2024',
    { tags: ['meeting', 'arbeit'] }
  );

  // 5. List all documents
  const allDocs = await listDocuments();
  console.log('All documents:', allDocs.length);

  // 6. Search documents
  const searchResults = await searchDocuments('Meeting');
  console.log('Search results:', searchResults);

  // 7. Delete a document
  const deleted = await deleteDocument('doc-002');
  console.log('Document deleted:', deleted);

  // Clean up
  await closeDatabase();
}

/**
 * Example: Embedding operations
 */
async function embeddingExample() {
  await initDatabase();

  // Create a document first
  await createDocument(
    'doc-100',
    'KI Dokument',
    'Ein Dokument für Vektor-Embeddings',
    { tags: ['ki', 'embeddings'] }
  );

  // 1. Create an embedding
  const embedding = await createEmbedding(
    'emb-001',
    'doc-100',
    [0.1, 0.2, 0.3, 0.4, 0.5], // Example vector
    { model: 'text-embedding-ada-002', dimension: 5 }
  );
  console.log('Created embedding:', embedding);

  // 2. Get the embedding
  const retrieved = await getEmbedding('emb-001');
  console.log('Retrieved embedding:', retrieved);

  // 3. Get all embeddings for a document
  const docEmbeddings = await getEmbeddingsByDocumentId('doc-100');
  console.log('Document embeddings:', docEmbeddings);

  // 4. Delete the embedding
  const deleted = await deleteEmbedding('emb-001');
  console.log('Embedding deleted:', deleted);

  await closeDatabase();
}

/**
 * Example: Pagination
 */
async function paginationExample() {
  await initDatabase();

  // Create multiple documents
  for (let i = 1; i <= 10; i++) {
    await createDocument(
      `doc-${i}`,
      `Dokument ${i}`,
      `Inhalt von Dokument ${i}`,
      { index: i }
    );
  }

  // Get first page (5 documents)
  const page1 = await listDocuments(5, 0);
  console.log('Page 1:', page1.length);

  // Get second page (next 5 documents)
  const page2 = await listDocuments(5, 5);
  console.log('Page 2:', page2.length);

  await closeDatabase();
}

/**
 * Example: Vector search and semantic similarity
 */
async function vectorSearchExample() {
  await initDatabase();

  // 1. Create some documents with embeddings
  const docs = [
    {
      id: 'doc-ai-1',
      title: 'Introduction to AI',
      content: 'Artificial Intelligence is the simulation of human intelligence by machines.',
    },
    {
      id: 'doc-ml-1',
      title: 'Machine Learning Basics',
      content: 'Machine learning is a subset of AI that enables computers to learn from data.',
    },
    {
      id: 'doc-dl-1',
      title: 'Deep Learning',
      content: 'Deep learning uses neural networks with multiple layers to analyze data.',
    },
  ];

  // Create documents and generate embeddings
  const { generateEmbedding } = await import('../ai');
  
  for (const docData of docs) {
    await createDocument(docData.id, docData.title, docData.content);
    
    // Generate embedding for the content
    const { vector } = await generateEmbedding(docData.content);
    await createEmbedding(
      `emb-${docData.id}`,
      docData.id,
      vector,
      { model: 'nomic-embed-text', dimension: 768 }
    );
  }

  // 2. Search for similar embeddings using a query vector
  const { vector: queryVector } = await generateEmbedding('What is artificial intelligence?');
  const similarEmbeddings = await searchSimilarEmbeddings(queryVector, 3, 0.5);
  
  console.log('Similar embeddings:');
  similarEmbeddings.forEach((emb) => {
    console.log(`  - ${emb.id}: similarity = ${emb.similarity.toFixed(3)}`);
  });

  // 3. Semantic search for documents
  const results = await semanticSearch('neural networks and learning', 5, 0.5);
  
  console.log('\nSemantic search results:');
  results.forEach((doc) => {
    console.log(`  - ${doc.title} (${doc.similarity.toFixed(3)})`);
  });

  await closeDatabase();
}

// Uncomment to run examples:
// documentExample().catch(console.error);
// embeddingExample().catch(console.error);
// paginationExample().catch(console.error);
// vectorSearchExample().catch(console.error);

export { documentExample, embeddingExample, paginationExample, vectorSearchExample };
