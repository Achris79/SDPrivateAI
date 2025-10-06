import { useState, useCallback } from 'react';
import { Document } from '../types';
import { logger } from '../errors';
import * as db from '../services/database';

/**
 * Custom hook for database operations
 * Provides state management and error handling for database interactions
 */
export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a new document
   */
  const createDocument = useCallback(
    async (
      id: string,
      title: string,
      content: string,
      metadata?: any
    ): Promise<Document | null> => {
      setLoading(true);
      setError(null);
      try {
        const doc = await db.createDocument(id, title, content, metadata);
        return doc;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create document');
        setError(error);
        logger.log(error, { hook: 'useDatabase', operation: 'createDocument' });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get a document by ID
   */
  const getDocument = useCallback(async (id: string): Promise<Document | null> => {
    setLoading(true);
    setError(null);
    try {
      const doc = await db.getDocument(id);
      return doc;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get document');
      setError(error);
      logger.log(error, { hook: 'useDatabase', operation: 'getDocument' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a document
   */
  const updateDocument = useCallback(
    async (
      id: string,
      updates: Partial<{ title: string; content: string; metadata: any }>
    ): Promise<Document | null> => {
      setLoading(true);
      setError(null);
      try {
        const doc = await db.updateDocument(id, updates);
        return doc;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update document');
        setError(error);
        logger.log(error, { hook: 'useDatabase', operation: 'updateDocument' });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const deleted = await db.deleteDocument(id);
      return deleted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete document');
      setError(error);
      logger.log(error, { hook: 'useDatabase', operation: 'deleteDocument' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * List documents with pagination
   */
  const listDocuments = useCallback(
    async (limit = 100, offset = 0): Promise<Document[]> => {
      setLoading(true);
      setError(null);
      try {
        const docs = await db.listDocuments(limit, offset);
        return docs;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to list documents');
        setError(error);
        logger.log(error, { hook: 'useDatabase', operation: 'listDocuments' });
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Search documents
   */
  const searchDocuments = useCallback(async (query: string): Promise<Document[]> => {
    setLoading(true);
    setError(null);
    try {
      const docs = await db.searchDocuments(query);
      return docs;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search documents');
      setError(error);
      logger.log(error, { hook: 'useDatabase', operation: 'searchDocuments' });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Semantic search
   */
  const semanticSearch = useCallback(
    async (
      queryText: string,
      limit = 10,
      minSimilarity = 0.5
    ): Promise<Array<Document & { similarity: number }>> => {
      setLoading(true);
      setError(null);
      try {
        const results = await db.semanticSearch(queryText, limit, minSimilarity);
        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to perform semantic search');
        setError(error);
        logger.log(error, { hook: 'useDatabase', operation: 'semanticSearch' });
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    listDocuments,
    searchDocuments,
    semanticSearch,
  };
}
