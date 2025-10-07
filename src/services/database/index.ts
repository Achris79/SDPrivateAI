/**
 * Database service for SQLite operations
 * Uses Tauri SQL Plugin for database access
 * 
 * Security features:
 * - Input validation on all operations
 * - Parameterized queries to prevent SQL injection
 * - Defensive error handling with detailed logging
 */

import Database from 'tauri-plugin-sql-api';
import type { Document, VectorEmbedding, DocumentMetadata } from '../../types';
import { DatabaseError, ValidationError, logger } from '../../errors';
import {
  validateId,
  validateStringLength,
  validateArray,
  validateNumber,
  validateNotEmpty,
  safeJsonParse,
  sanitizeString,
} from '../../utils/validation';

let db: Database | null = null;
let isInitialized = false;

/**
 * Initialize the database connection
 * @throws {DatabaseError} If database initialization fails
 */
export async function initDatabase(): Promise<void> {
  if (isInitialized && db) {
    logger.info('Database already initialized');
    return;
  }

  try {
    db = await Database.load('sqlite:sd-private-ai.db');
    await createTables();
    await createIndexes();
    isInitialized = true;
    logger.info('Database initialized successfully');
  } catch (error) {
    const dbError = new DatabaseError(
      'Failed to initialize database',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
    logger.log(dbError, { operation: 'initDatabase' });
    throw dbError;
  }
}

/**
 * Create initial database tables
 * @throws {DatabaseError} If table creation fails
 */
async function createTables(): Promise<void> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        vector BLOB NOT NULL,
        metadata TEXT,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    throw new DatabaseError(
      'Failed to create database tables',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Create indexes for better performance
 * @throws {DatabaseError} If index creation fails
 */
async function createIndexes(): Promise<void> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON embeddings(document_id)
    `);
  } catch (error) {
    throw new DatabaseError(
      'Failed to create database indexes',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Get database instance
 * @throws {DatabaseError} If database is not initialized
 */
export function getDatabase(): Database {
  if (!db) {
    throw new DatabaseError('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.close();
      db = null;
      isInitialized = false;
      logger.info('Database closed successfully');
    } catch (error) {
      logger.log(
        new DatabaseError(
          'Failed to close database',
          { originalError: error instanceof Error ? error.message : 'Unknown error' }
        )
      );
    }
  }
}

/**
 * Execute a database transaction
 * Provides atomic operations with automatic rollback on error
 * @param operation - Async function containing database operations
 * @returns Result of the operation
 * @throws {DatabaseError} If transaction fails
 */
export async function executeTransaction<T>(
  operation: (db: Database) => Promise<T>
): Promise<T> {
  const database = getDatabase();
  
  try {
    await database.execute('BEGIN TRANSACTION');
    logger.info('Transaction started');
    
    const result = await operation(database);
    
    await database.execute('COMMIT');
    logger.info('Transaction committed');
    
    return result;
  } catch (error) {
    try {
      await database.execute('ROLLBACK');
      logger.info('Transaction rolled back');
    } catch (rollbackError) {
      logger.log(
        new DatabaseError('Failed to rollback transaction', {
          originalError: rollbackError instanceof Error ? rollbackError.message : 'Unknown error'
        })
      );
    }
    
    if (error instanceof DatabaseError || error instanceof ValidationError) {
      throw error;
    }
    
    throw new DatabaseError(
      'Transaction failed',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return isInitialized && db !== null;
}

// ==================== Document CRUD Operations ====================

/**
 * Create a new document
 * @param id - Unique document identifier
 * @param title - Document title
 * @param content - Document content
 * @param metadata - Optional metadata
 * @returns Created document
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function createDocument(
  id: string,
  title: string,
  content: string,
  metadata?: DocumentMetadata
): Promise<Document> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    // Validate inputs
    validateId(id, 'document id');
    validateStringLength(title, 'title', 1, 500);
    validateStringLength(content, 'content', 0, 1000000); // 1MB limit
    
    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedContent = sanitizeString(content);
    
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO documents (id, title, content, metadata, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, sanitizedTitle, sanitizedContent, metadataJson, now, now]
    );

    logger.info('Document created', { id, titleLength: sanitizedTitle.length });

    return {
      id,
      title: sanitizedTitle,
      content: sanitizedContent,
      metadata,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to create document',
      { 
        id,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Get a document by ID
 * @param id - Document identifier
 * @returns Document if found, null otherwise
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function getDocument(id: string): Promise<Document | null> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(id, 'document id');

    const result = await db.select<Array<{
      id: string;
      title: string;
      content: string;
      metadata: string | null;
      created_at: string;
      updated_at: string;
    }>>(`SELECT * FROM documents WHERE id = ?`, [id]);

    if (result.length === 0) {
      return null;
    }

    const doc = result[0];
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      metadata: safeJsonParse(doc.metadata, undefined),
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to retrieve document',
      { 
        id,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Update a document
 * @param id - Document identifier
 * @param updates - Fields to update
 * @returns Updated document or null if not found
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function updateDocument(
  id: string,
  updates: Partial<{ title: string; content: string; metadata: DocumentMetadata }>
): Promise<Document | null> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(id, 'document id');
    
    if (updates.title !== undefined) {
      validateStringLength(updates.title, 'title', 1, 500);
    }
    
    if (updates.content !== undefined) {
      validateStringLength(updates.content, 'content', 0, 1000000);
    }

    const existing = await getDocument(id);
    if (!existing) {
      return null;
    }

    const title = updates.title ? sanitizeString(updates.title) : existing.title;
    const content = updates.content ? sanitizeString(updates.content) : existing.content;
    const metadata = updates.metadata ?? existing.metadata;
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    const now = new Date().toISOString();

    await db.execute(
      `UPDATE documents SET title = ?, content = ?, metadata = ?, updated_at = ? WHERE id = ?`,
      [title, content, metadataJson, now, id]
    );

    logger.info('Document updated', { id });

    return {
      id,
      title,
      content,
      metadata,
      createdAt: existing.createdAt,
      updatedAt: new Date(now),
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to update document',
      { 
        id,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Delete a document
 * @param id - Document identifier
 * @returns True if document was deleted, false otherwise
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function deleteDocument(id: string): Promise<boolean> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(id, 'document id');

    const result = await db.execute(`DELETE FROM documents WHERE id = ?`, [id]);
    const deleted = result.rowsAffected > 0;
    
    if (deleted) {
      logger.info('Document deleted', { id });
    }
    
    return deleted;
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to delete document',
      { 
        id,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * List all documents with optional pagination
 * @param limit - Maximum number of documents to return (1-1000)
 * @param offset - Number of documents to skip
 * @returns Array of documents
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function listDocuments(
  limit: number = 100,
  offset: number = 0
): Promise<Document[]> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateNumber(limit, 'limit', 1, 1000);
    validateNumber(offset, 'offset', 0, Number.MAX_SAFE_INTEGER);

    const results = await db.select<Array<{
      id: string;
      title: string;
      content: string;
      metadata: string | null;
      created_at: string;
      updated_at: string;
    }>>(`SELECT * FROM documents ORDER BY created_at DESC LIMIT ? OFFSET ?`, [
      limit,
      offset,
    ]);

    return results.map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      metadata: safeJsonParse(doc.metadata, undefined),
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
    }));
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to list documents',
      { 
        limit,
        offset,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Search documents by title or content
 * @param query - Search query (sanitized for security)
 * @returns Array of matching documents
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function searchDocuments(query: string): Promise<Document[]> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateStringLength(query, 'search query', 1, 500);
    
    // Sanitize query to prevent SQL injection
    const sanitizedQuery = sanitizeString(query);
    
    // Escape special LIKE characters
    const escapedQuery = sanitizedQuery
      .replace(/[%_]/g, '\\$&')
      .replace(/\\/g, '\\\\');
    
    const searchPattern = `%${escapedQuery}%`;
    
    const results = await db.select<Array<{
      id: string;
      title: string;
      content: string;
      metadata: string | null;
      created_at: string;
      updated_at: string;
    }>>(
      `SELECT * FROM documents WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC`,
      [searchPattern, searchPattern]
    );

    return results.map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      metadata: safeJsonParse(doc.metadata, undefined),
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
    }));
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to search documents',
      { 
        query,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

// ==================== Embedding CRUD Operations ====================

/**
 * Create an embedding for a document
 * @param id - Unique embedding identifier
 * @param documentId - Associated document ID
 * @param vector - Embedding vector
 * @param metadata - Optional metadata
 * @returns Created embedding
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function createEmbedding(
  id: string,
  documentId: string,
  vector: number[],
  metadata?: Record<string, any>
): Promise<VectorEmbedding> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(id, 'embedding id');
    validateId(documentId, 'document id');
    validateArray(vector, 'vector', 1, 10000);
    
    // Validate all vector elements are valid numbers
    for (let i = 0; i < vector.length; i++) {
      if (!Number.isFinite(vector[i])) {
        throw new ValidationError(
          `Vector contains invalid value at index ${i}`,
          'vector',
          { index: i, value: vector[i] }
        );
      }
    }

    const vectorBlob = JSON.stringify(vector);
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    await db.execute(
      `INSERT INTO embeddings (id, document_id, vector, metadata) VALUES (?, ?, ?, ?)`,
      [id, documentId, vectorBlob, metadataJson]
    );

    logger.info('Embedding created', { id, documentId, vectorDim: vector.length });

    return {
      id,
      documentId,
      vector,
      metadata,
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to create embedding',
      { 
        id,
        documentId,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Get embedding by ID
 * @param id - Embedding identifier
 * @returns Embedding if found, null otherwise
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function getEmbedding(id: string): Promise<VectorEmbedding | null> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(id, 'embedding id');

    const result = await db.select<Array<{
      id: string;
      document_id: string;
      vector: string;
      metadata: string | null;
    }>>(`SELECT * FROM embeddings WHERE id = ?`, [id]);

    if (result.length === 0) {
      return null;
    }

    const emb = result[0];
    return {
      id: emb.id,
      documentId: emb.document_id,
      vector: safeJsonParse(emb.vector, []),
      metadata: safeJsonParse(emb.metadata, undefined),
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to retrieve embedding',
      { 
        id,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Get embeddings by document ID
 * @param documentId - Document identifier
 * @returns Array of embeddings for the document
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function getEmbeddingsByDocumentId(
  documentId: string
): Promise<VectorEmbedding[]> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(documentId, 'document id');

    const results = await db.select<Array<{
      id: string;
      document_id: string;
      vector: string;
      metadata: string | null;
    }>>(`SELECT * FROM embeddings WHERE document_id = ?`, [documentId]);

    return results.map((emb) => ({
      id: emb.id,
      documentId: emb.document_id,
      vector: safeJsonParse(emb.vector, []),
      metadata: safeJsonParse(emb.metadata, undefined),
    }));
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to retrieve embeddings by document ID',
      { 
        documentId,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Delete embedding by ID
 * @param id - Embedding identifier
 * @returns True if embedding was deleted, false otherwise
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function deleteEmbedding(id: string): Promise<boolean> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(id, 'embedding id');

    const result = await db.execute(`DELETE FROM embeddings WHERE id = ?`, [id]);
    const deleted = result.rowsAffected > 0;
    
    if (deleted) {
      logger.info('Embedding deleted', { id });
    }
    
    return deleted;
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to delete embedding',
      { 
        id,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Delete all embeddings for a document
 * @param documentId - Document identifier
 * @returns Number of embeddings deleted
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function deleteEmbeddingsByDocumentId(
  documentId: string
): Promise<number> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateId(documentId, 'document id');

    const result = await db.execute(
      `DELETE FROM embeddings WHERE document_id = ?`,
      [documentId]
    );
    
    const count = result.rowsAffected;
    if (count > 0) {
      logger.info('Embeddings deleted by document ID', { documentId, count });
    }
    
    return count;
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to delete embeddings by document ID',
      { 
        documentId,
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Get all embeddings
 * @returns Array of all embeddings
 * @throws {DatabaseError} If database operation fails
 */
export async function listEmbeddings(): Promise<VectorEmbedding[]> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    const results = await db.select<Array<{
      id: string;
      document_id: string;
      vector: string;
      metadata: string | null;
    }>>(`SELECT * FROM embeddings`);

    return results.map((emb) => ({
      id: emb.id,
      documentId: emb.document_id,
      vector: safeJsonParse(emb.vector, []),
      metadata: safeJsonParse(emb.metadata, undefined),
    }));
  } catch (error) {
    throw new DatabaseError(
      'Failed to list embeddings',
      { 
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

// ==================== Vector Search Operations ====================

/**
 * Search for similar embeddings using cosine similarity
 * @param queryVector - The query vector to search for
 * @param limit - Maximum number of results to return (default: 10)
 * @param minSimilarity - Minimum similarity threshold (0-1, default: 0.0)
 * @returns Array of embeddings with similarity scores, sorted by similarity (highest first)
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function searchSimilarEmbeddings(
  queryVector: number[],
  limit: number = 10,
  minSimilarity: number = 0.0
): Promise<Array<VectorEmbedding & { similarity: number }>> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateArray(queryVector, 'query vector', 1);
    validateNumber(limit, 'limit', 1, 1000);
    validateNumber(minSimilarity, 'min similarity', 0, 1);

    // Get all embeddings
    const allEmbeddings = await listEmbeddings();

    // Calculate similarity for each embedding
    const withSimilarity = allEmbeddings.map((emb) => {
      // Calculate cosine similarity
      const similarity = calculateCosineSimilarity(queryVector, emb.vector);
      return {
        ...emb,
        similarity,
      };
    });

    // Filter by minimum similarity and sort by similarity (descending)
    const filtered = withSimilarity
      .filter((emb) => emb.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    logger.info('Vector similarity search completed', {
      totalEmbeddings: allEmbeddings.length,
      resultsCount: filtered.length,
      limit,
      minSimilarity,
    });

    return filtered;
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to search similar embeddings',
      {
        queryVectorLength: queryVector.length,
        limit,
        minSimilarity,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between -1 and 1 (typically 0-1 for embeddings)
 */
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    return 0; // Incompatible vectors
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) {
      return 0; // Invalid values
    }
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0; // Zero vectors
  }

  return dotProduct / denominator;
}

/**
 * Search for documents by semantic similarity
 * Generates embedding for query text and finds similar documents
 * @param queryText - The text to search for
 * @param limit - Maximum number of results to return (default: 10)
 * @param minSimilarity - Minimum similarity threshold (0-1, default: 0.5)
 * @returns Array of documents with similarity scores
 * @throws {DatabaseError} If database operation fails
 * @throws {ValidationError} If input validation fails
 */
export async function semanticSearch(
  queryText: string,
  limit: number = 10,
  minSimilarity: number = 0.5
): Promise<Array<Document & { similarity: number }>> {
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    validateNotEmpty(queryText, 'query text');
    validateNumber(limit, 'limit', 1, 1000);
    validateNumber(minSimilarity, 'min similarity', 0, 1);

    // Import AI service to generate embedding
    const { generateEmbedding } = await import('../ai');
    const { vector: queryVector } = await generateEmbedding(queryText);

    // Search for similar embeddings
    const similarEmbeddings = await searchSimilarEmbeddings(
      queryVector,
      limit * 2, // Get more results to account for multiple embeddings per document
      minSimilarity
    );

    // Get unique documents and calculate average similarity if multiple embeddings exist
    const documentMap = new Map<string, { document: Document; similarities: number[] }>();

    for (const emb of similarEmbeddings) {
      const doc = await getDocument(emb.documentId);
      if (doc) {
        const existing = documentMap.get(doc.id);
        if (existing) {
          existing.similarities.push(emb.similarity);
        } else {
          documentMap.set(doc.id, {
            document: doc,
            similarities: [emb.similarity],
          });
        }
      }
    }

    // Calculate average similarity and create result
    const results = Array.from(documentMap.values())
      .map(({ document, similarities }) => ({
        ...document,
        similarity: similarities.reduce((a, b) => a + b, 0) / similarities.length,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    logger.info('Semantic search completed', {
      queryLength: queryText.length,
      resultsCount: results.length,
      limit,
      minSimilarity,
    });

    return results;
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    throw new DatabaseError(
      'Failed to perform semantic search',
      {
        queryLength: queryText.length,
        limit,
        minSimilarity,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
}
