/**
 * Error Handling Usage Examples
 * Demonstrates how to use the error handling system in real scenarios
 */

import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
} from '../services/database';
import { generateEmbedding } from '../services/ai';
import { DatabaseError, ValidationError, AIError, logger } from '../errors';
import { generateId } from '../utils';

/**
 * Example 1: Creating a document with proper error handling
 */
export async function createDocumentExample() {
  try {
    const id = generateId();
    const title = 'My Document';
    const content = 'This is the content of my document.';
    
    const document = await createDocument(id, title, content, {
      tags: ['example', 'tutorial'],
      category: 'documentation'
    });
    
    logger.info('Document created successfully', { id: document.id });
    return document;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      // Handle validation errors - show to user
      console.error(`Invalid input for ${error.field}:`, error.message);
      // Show user-friendly error message
      alert(`Please check your input: ${error.message}`);
    } else if (error instanceof DatabaseError) {
      // Handle database errors - log and show generic message
      logger.log(error, { component: 'DocumentCreation' });
      alert('Failed to save document. Please try again.');
    } else {
      // Unexpected error
      logger.log(
        error instanceof Error ? error : new Error('Unknown error'),
        { component: 'DocumentCreation' }
      );
      alert('An unexpected error occurred.');
    }
    throw error;
  }
}

/**
 * Example 2: Searching documents with error recovery
 */
export async function searchDocumentsExample(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query cannot be empty', 'query');
    }
    
    const results = await searchDocuments(query);
    logger.info('Search completed', { query, resultCount: results.length });
    return results;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      // Validation error - inform user
      console.warn('Invalid search query:', error.message);
      return []; // Return empty results
    } else if (error instanceof DatabaseError) {
      // Database error - log and retry or show error
      logger.log(error, { component: 'DocumentSearch', query });
      throw new Error('Search is temporarily unavailable. Please try again.');
    }
    throw error;
  }
}

/**
 * Example 3: Updating a document with fallback
 */
export async function updateDocumentExample(
  id: string,
  newTitle?: string,
  newContent?: string
) {
  try {
    // First check if document exists
    const existing = await getDocument(id);
    
    if (!existing) {
      throw new ValidationError(`Document with ID ${id} not found`, 'id');
    }
    
    // Update document
    const updated = await updateDocument(id, {
      title: newTitle,
      content: newContent
    });
    
    logger.info('Document updated', { id, hasNewTitle: !!newTitle });
    return updated;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.message);
      // Could retry with corrected input
      throw error;
    } else if (error instanceof DatabaseError) {
      logger.log(error, { component: 'DocumentUpdate', id });
      throw new Error('Failed to update document');
    }
    throw error;
  }
}

/**
 * Example 4: AI operations with graceful degradation
 */
export async function generateEmbeddingExample(text: string) {
  try {
    const result = await generateEmbedding(text);
    logger.info('Embedding generated', { 
      textLength: text.length,
      dimensionality: result.dimensionality
    });
    return result;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      // Invalid input
      console.error('Invalid text for embedding:', error.message);
      throw error;
    } else if (error instanceof AIError) {
      // AI processing error - could fallback to simpler method
      logger.log(error, { component: 'EmbeddingGeneration' });
      logger.warn('Falling back to placeholder embedding');
      
      // Fallback to simple embedding
      return {
        vector: new Array(384).fill(0),
        dimensionality: 384
      };
    }
    throw error;
  }
}

/**
 * Example 5: Batch operations with error collection
 */
export async function batchCreateDocuments(
  documents: Array<{ title: string; content: string }>
) {
  const results: Array<{ success: boolean; id?: string; error?: string }> = [];
  
  for (const doc of documents) {
    try {
      const id = generateId();
      await createDocument(id, doc.title, doc.content);
      
      results.push({ success: true, id });
      
    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error instanceof ValidationError) {
        errorMessage = `Validation error: ${error.message}`;
      } else if (error instanceof DatabaseError) {
        errorMessage = `Database error: ${error.message}`;
        logger.log(error, { component: 'BatchCreate', title: doc.title });
      }
      
      results.push({ success: false, error: errorMessage });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  logger.info('Batch operation completed', { 
    total: documents.length,
    success: successCount,
    failed: documents.length - successCount
  });
  
  return results;
}

/**
 * Example 6: Safe deletion with confirmation
 */
export async function safeDeleteDocument(id: string): Promise<boolean> {
  try {
    // First verify document exists
    const document = await getDocument(id);
    
    if (!document) {
      logger.warn('Attempted to delete non-existent document', { id });
      return false;
    }
    
    // Perform deletion
    const deleted = await deleteDocument(id);
    
    if (deleted) {
      logger.info('Document deleted successfully', { id, title: document.title });
    } else {
      logger.warn('Document deletion failed', { id });
    }
    
    return deleted;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Invalid document ID:', error.message);
      return false;
    } else if (error instanceof DatabaseError) {
      logger.log(error, { component: 'DocumentDeletion', id });
      throw new Error('Failed to delete document');
    }
    throw error;
  }
}

/**
 * Example 7: Error recovery with retry logic
 */
export async function createDocumentWithRetry(
  title: string,
  content: string,
  maxRetries: number = 3
) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const id = generateId();
      const document = await createDocument(id, title, content);
      
      logger.info('Document created on attempt', { attempt, id: document.id });
      return document;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (error instanceof ValidationError) {
        // Don't retry validation errors
        throw error;
      }
      
      if (error instanceof DatabaseError) {
        logger.warn(`Database error on attempt ${attempt}`, { 
          attempt,
          maxRetries,
          error: error.message
        });
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  // All retries exhausted
  logger.log(lastError!, { component: 'CreateDocumentRetry', maxRetries });
  throw new Error(`Failed to create document after ${maxRetries} attempts`);
}

// Note: These examples demonstrate best practices for error handling.
// Always validate inputs, provide context, log appropriately, and handle errors gracefully.
