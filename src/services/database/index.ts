/**
 * Database service for SQLite operations
 * Uses Tauri SQL Plugin for database access
 */

import Database from 'tauri-plugin-sql-api';

let db: Database | null = null;

/**
 * Initialize the database connection
 */
export async function initDatabase(): Promise<void> {
  try {
    // TODO: Configure proper database path and migrations
    db = await Database.load('sqlite:sd-private-ai.db');
    await createTables();
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

  // TODO: Define proper schema based on requirements
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

  // TODO: Add vector table for embeddings
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
