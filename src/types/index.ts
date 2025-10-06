/**
 * Document type for storing user documents
 */
export interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  tags?: string[];
  category?: string;
  author?: string;
  [key: string]: any;
}

/**
 * Vector embedding for semantic search
 */
export interface VectorEmbedding {
  id: string;
  documentId: string;
  vector: number[];
  metadata?: Record<string, any>;
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  document: Document;
  similarity: number;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Supported languages
 */
export type Language = 'en' | 'de';

/**
 * Application settings
 */
export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  syncfusionLicenseKey?: string;
}
