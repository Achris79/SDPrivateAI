/**
 * Database service for SQLite operations
 * Uses Tauri SQL Plugin for database access
 */

import Database from 'tauri-plugin-sql-api';
import type { Document, VectorEmbedding, DocumentMetadata } from '../../types';

let db: Database | null = null;

/**
 * Initialize the database connection
 */
export async function initDatabase(): Promise<void> {
  try {
    db = await Database.load('sqlite:sd-private-ai.db');
    await createTables();
    await createIndexes();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Create initial database tables
 */
async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

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
}

/**
 * Create indexes for better performance
 */
async function createIndexes(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON embeddings(document_id)
  `);
}

/**
 * Get database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

// ==================== Document CRUD Operations ====================

/**
 * Create a new document
 */
export async function createDocument(
  id: string,
  title: string,
  content: string,
  metadata?: DocumentMetadata
): Promise<Document> {
  if (!db) throw new Error('Database not initialized');

  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO documents (id, title, content, metadata, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, content, metadataJson, now, now]
  );

  return {
    id,
    title,
    content,
    metadata,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

/**
 * Get a document by ID
 */
export async function getDocument(id: string): Promise<Document | null> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.select<Array<{
    id: string;
    title: string;
    content: string;
    metadata: string | null;
    created_at: string;
    updated_at: string;
  }>>(`SELECT * FROM documents WHERE id = ?`, [id]);

  if (result.length === 0) return null;

  const doc = result[0];
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
  };
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  updates: Partial<{ title: string; content: string; metadata: DocumentMetadata }>
): Promise<Document | null> {
  if (!db) throw new Error('Database not initialized');

  const existing = await getDocument(id);
  if (!existing) return null;

  const title = updates.title ?? existing.title;
  const content = updates.content ?? existing.content;
  const metadata = updates.metadata ?? existing.metadata;
  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE documents SET title = ?, content = ?, metadata = ?, updated_at = ? WHERE id = ?`,
    [title, content, metadataJson, now, id]
  );

  return {
    id,
    title,
    content,
    metadata,
    createdAt: existing.createdAt,
    updatedAt: new Date(now),
  };
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<boolean> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.execute(`DELETE FROM documents WHERE id = ?`, [id]);
  return result.rowsAffected > 0;
}

/**
 * List all documents with optional pagination
 */
export async function listDocuments(
  limit: number = 100,
  offset: number = 0
): Promise<Document[]> {
  if (!db) throw new Error('Database not initialized');

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
    metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
  }));
}

/**
 * Search documents by title or content
 */
export async function searchDocuments(query: string): Promise<Document[]> {
  if (!db) throw new Error('Database not initialized');

  const searchPattern = `%${query}%`;
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
    metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
  }));
}

// ==================== Embedding CRUD Operations ====================

/**
 * Create an embedding for a document
 */
export async function createEmbedding(
  id: string,
  documentId: string,
  vector: number[],
  metadata?: Record<string, any>
): Promise<VectorEmbedding> {
  if (!db) throw new Error('Database not initialized');

  const vectorBlob = JSON.stringify(vector);
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  await db.execute(
    `INSERT INTO embeddings (id, document_id, vector, metadata) VALUES (?, ?, ?, ?)`,
    [id, documentId, vectorBlob, metadataJson]
  );

  return {
    id,
    documentId,
    vector,
    metadata,
  };
}

/**
 * Get embedding by ID
 */
export async function getEmbedding(id: string): Promise<VectorEmbedding | null> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.select<Array<{
    id: string;
    document_id: string;
    vector: string;
    metadata: string | null;
  }>>(`SELECT * FROM embeddings WHERE id = ?`, [id]);

  if (result.length === 0) return null;

  const emb = result[0];
  return {
    id: emb.id,
    documentId: emb.document_id,
    vector: JSON.parse(emb.vector),
    metadata: emb.metadata ? JSON.parse(emb.metadata) : undefined,
  };
}

/**
 * Get embeddings by document ID
 */
export async function getEmbeddingsByDocumentId(
  documentId: string
): Promise<VectorEmbedding[]> {
  if (!db) throw new Error('Database not initialized');

  const results = await db.select<Array<{
    id: string;
    document_id: string;
    vector: string;
    metadata: string | null;
  }>>(`SELECT * FROM embeddings WHERE document_id = ?`, [documentId]);

  return results.map((emb) => ({
    id: emb.id,
    documentId: emb.document_id,
    vector: JSON.parse(emb.vector),
    metadata: emb.metadata ? JSON.parse(emb.metadata) : undefined,
  }));
}

/**
 * Delete embedding by ID
 */
export async function deleteEmbedding(id: string): Promise<boolean> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.execute(`DELETE FROM embeddings WHERE id = ?`, [id]);
  return result.rowsAffected > 0;
}

/**
 * Delete all embeddings for a document
 */
export async function deleteEmbeddingsByDocumentId(
  documentId: string
): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.execute(
    `DELETE FROM embeddings WHERE document_id = ?`,
    [documentId]
  );
  return result.rowsAffected;
}

/**
 * Get all embeddings
 */
export async function listEmbeddings(): Promise<VectorEmbedding[]> {
  if (!db) throw new Error('Database not initialized');

  const results = await db.select<Array<{
    id: string;
    document_id: string;
    vector: string;
    metadata: string | null;
  }>>(`SELECT * FROM embeddings`);

  return results.map((emb) => ({
    id: emb.id,
    documentId: emb.document_id,
    vector: JSON.parse(emb.vector),
    metadata: emb.metadata ? JSON.parse(emb.metadata) : undefined,
  }));
}
