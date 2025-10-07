# Vector Search Implementation - Technical Documentation

## Übersicht

Diese Dokumentation beschreibt die technische Implementierung der Vektorsuche in der SQLite-Datenbank mit Fokus auf wartbaren Code und saubere Fehlerbehandlung.

## Architektur

### Komponenten

```
┌─────────────────────────────────────────────────────────────┐
│                    Vector Search System                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  Embedding   │─────▶│   Vector     │─────▶│ Document  │ │
│  │  Generation  │      │   Search     │      │ Retrieval │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│        │                      │                     │        │
│        │                      │                     │        │
│        ▼                      ▼                     ▼        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SQLite Database (embeddings)            │  │
│  │  - id, document_id, vector (JSON), metadata          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Datenfluss

1. **Query → Embedding**: Text wird in 768-dimensionalen Vektor umgewandelt
2. **Vector Search**: Cosine Similarity gegen alle gespeicherten Vektoren
3. **Filtering**: Ergebnisse nach Similarity-Threshold filtern
4. **Sorting**: Absteigend nach Similarity sortieren
5. **Document Retrieval**: Zugehörige Dokumente aus Datenbank laden

## Implementierte Funktionen

### 1. `searchSimilarEmbeddings()`

Sucht nach ähnlichen Embeddings basierend auf einem Query-Vektor.

**Signatur:**
```typescript
searchSimilarEmbeddings(
  queryVector: number[],
  limit?: number,
  minSimilarity?: number
): Promise<Array<VectorEmbedding & { similarity: number }>>
```

**Parameter:**
- `queryVector`: Vektor mit 1-10.000 Dimensionen
- `limit`: Max. Anzahl Ergebnisse (1-1000, default: 10)
- `minSimilarity`: Min. Similarity-Schwelle (0-1, default: 0.0)

**Rückgabe:**
- Array von Embeddings mit Similarity-Scores
- Sortiert nach Similarity (höchste zuerst)
- Gefiltert nach `minSimilarity`

**Fehlerbehandlung:**
```typescript
try {
  const results = await searchSimilarEmbeddings(queryVector, 10, 0.7);
} catch (error) {
  if (error instanceof ValidationError) {
    // Ungültige Eingabeparameter
  } else if (error instanceof DatabaseError) {
    // Datenbankfehler
  }
}
```

**Validierungen:**
- ✅ Query-Vektor nicht leer (1-10.000 Dimensionen)
- ✅ Alle Vektorwerte sind finite Zahlen (keine NaN, Infinity)
- ✅ Limit zwischen 1-1000
- ✅ MinSimilarity zwischen 0-1

### 2. `semanticSearch()`

Semantische Dokumentensuche basierend auf Text.

**Signatur:**
```typescript
semanticSearch(
  queryText: string,
  limit?: number,
  minSimilarity?: number
): Promise<Array<Document & { similarity: number }>>
```

**Parameter:**
- `queryText`: Suchtext (1-10.000 Zeichen)
- `limit`: Max. Anzahl Dokumente (1-1000, default: 10)
- `minSimilarity`: Min. Similarity (0-1, default: 0.5)

**Rückgabe:**
- Array von Dokumenten mit Similarity-Scores
- Bei mehreren Embeddings pro Dokument: Durchschnittliche Similarity
- Sortiert nach Similarity (höchste zuerst)

**Besonderheiten:**
- Generiert automatisch Embedding für Query-Text
- Dedupliziert Dokumente (falls mehrere Embeddings existieren)
- Berechnet Durchschnitts-Similarity bei mehreren Embeddings

**Validierungen:**
- ✅ Query-Text nicht leer
- ✅ Query-Text max. 10.000 Zeichen
- ✅ Limit zwischen 1-1000
- ✅ MinSimilarity zwischen 0-1
- ✅ Generierter Vektor nicht leer

### 3. `calculateCosineSimilarity()` (intern)

Berechnet Cosine Similarity zwischen zwei Vektoren.

**Algorithmus:**
```typescript
similarity = (A · B) / (||A|| * ||B||)
```

Wobei:
- `A · B` = Dot Product (Skalarprodukt)
- `||A||` = Magnitude/Norm von Vektor A
- `||B||` = Magnitude/Norm von Vektor B

**Eigenschaften:**
- Ergebnis: -1 bis 1
  - **1.0**: Identische Richtung (maximale Ähnlichkeit)
  - **0.0**: Orthogonal (keine Ähnlichkeit)
  - **-1.0**: Entgegengesetzte Richtung
- Invariant gegenüber Vektor-Länge (nur Richtung zählt)
- Für normalisierte Embeddings: typisch 0-1

**Fehlerbehandlung:**
- Dimension-Mismatch → 0.0
- Ungültige Werte (NaN, Infinity) → 0.0
- Zero-Vektoren → 0.0
- Floating-Point-Präzision → Clamping auf [-1, 1]

## Fehlerbehandlung

### Error Types

```typescript
// Validierungsfehler
throw new ValidationError(
  'Query vector contains invalid value at index 5',
  'query vector',
  { index: 5, value: NaN }
);

// Datenbankfehler
throw new DatabaseError(
  'Failed to search similar embeddings',
  {
    queryVectorLength: 768,
    limit: 10,
    minSimilarity: 0.7,
    originalError: error.message,
  }
);
```

### Validation-Pipeline

```
Input Parameters
      │
      ▼
┌─────────────────┐
│  Validate Type  │ → ValidationError (wrong type)
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Validate Range  │ → ValidationError (out of range)
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Validate Values │ → ValidationError (NaN, Infinity)
└─────────────────┘
      │
      ▼
  Process Request
```

### Defensive Programming

**Null/Undefined Checks:**
```typescript
if (!db) {
  throw new DatabaseError('Database not initialized');
}
```

**Empty Result Handling:**
```typescript
if (allEmbeddings.length === 0) {
  logger.info('No embeddings found');
  return []; // Early return
}
```

**Invalid Vector Handling:**
```typescript
if (!queryVector || queryVector.length === 0) {
  throw new DatabaseError('Empty vector returned');
}
```

**Orphaned Embedding Detection:**
```typescript
if (!doc) {
  logger.warn('Embedding references non-existent document', {
    embeddingId: emb.id,
    documentId: emb.documentId,
  });
  // Skip this embedding
}
```

## Performance & Logging

### Performance-Metriken

**Logged Metrics:**
```typescript
logger.info('Vector similarity search completed', {
  totalEmbeddings: 1500,           // Anzahl durchsuchte Vektoren
  resultsCount: 10,                // Gefundene Ergebnisse
  queryVectorDimensions: 768,      // Vektor-Dimensionen
  limit: 10,                       // Request-Limit
  minSimilarity: 0.7,              // Threshold
});
```

### Optimierungen

**Aktuelle Implementierung:**
- **Komplexität**: O(n) - alle Vektoren werden verglichen
- **Speicher**: Alle Embeddings in-memory
- **Geeignet für**: < 10.000 Dokumente

**Zukünftige Optimierungen** (bei Bedarf):
- HNSW Index (Approximate Nearest Neighbor)
- sqlite-vss Extension
- Batch-Processing
- Caching häufiger Queries

## Testing

### Test Coverage

**Unit Tests (`vector-search-test.ts`):**
1. ✅ Empty database search
2. ✅ Identical vectors (similarity = 1.0)
3. ✅ Orthogonal vectors (similarity ≈ 0)
4. ✅ Opposite vectors (similarity = -1.0)
5. ✅ Similarity threshold filtering
6. ✅ Result limit enforcement
7. ✅ Result sorting (descending)
8. ✅ Empty vector validation
9. ✅ Invalid similarity threshold validation
10. ✅ Negative limit validation
11. ✅ NaN/Infinity value validation
12. ✅ Semantic search integration

**Integration Tests (`test-utils.ts`):**
1. ✅ Vector similarity search
2. ✅ Semantic search
3. ✅ Validation error handling

### Test Ausführung

```typescript
import { printVectorSearchTestResults } from './services/database/vector-search-test';

// Führe alle Vector Search Tests aus
await printVectorSearchTestResults();
```

**Expected Output:**
```
🧪 Running Vector Search Tests...

✅ Empty database search
   Expected 0 results, got 0
✅ Identical vector search (similarity = 1.0)
   Similarity: 1.0000
✅ Orthogonal vector search (similarity ≈ 0)
   Similarity: 0.0000
...
📊 Vector Search Results: 12 passed, 0 failed
   Success Rate: 100.0%
```

## Best Practices

### 1. Input Validation
```typescript
// ✅ RICHTIG: Immer alle Parameter validieren
validateArray(queryVector, 'query vector', 1, 10000);
validateNumber(limit, 'limit', 1, 1000);
validateNumber(minSimilarity, 'min similarity', 0, 1);

// ❌ FALSCH: Keine Validierung
const results = await searchSimilarEmbeddings(userInput);
```

### 2. Error Context
```typescript
// ✅ RICHTIG: Context-Informationen bereitstellen
throw new DatabaseError('Failed to search embeddings', {
  queryVectorLength: queryVector.length,
  limit,
  minSimilarity,
  originalError: error.message,
});

// ❌ FALSCH: Generische Fehlermeldung
throw new Error('Search failed');
```

### 3. Logging
```typescript
// ✅ RICHTIG: Strukturiertes Logging mit Metriken
logger.info('Search completed', {
  totalEmbeddings: 1500,
  resultsCount: 10,
  queryVectorDimensions: 768,
});

// ❌ FALSCH: String-basiertes Logging
console.log('Search done');
```

### 4. Early Returns
```typescript
// ✅ RICHTIG: Frühe Rückkehr bei leeren Ergebnissen
if (allEmbeddings.length === 0) {
  logger.info('No embeddings found');
  return [];
}

// ❌ FALSCH: Unnötige Weiterverarbeitung
const results = allEmbeddings.map(...).filter(...).sort(...);
```

## Beispiele

### Beispiel 1: Einfache Vektorsuche

```typescript
import { searchSimilarEmbeddings } from './services/database';

// Query-Vektor (z.B. von einem Embedding-Modell)
const queryVector = [0.5, -0.2, 0.8, ...]; // 768 Dimensionen

// Suche nach den 10 ähnlichsten Vektoren (min. 70% Similarity)
const results = await searchSimilarEmbeddings(queryVector, 10, 0.7);

results.forEach(emb => {
  console.log(`${emb.id}: ${(emb.similarity * 100).toFixed(1)}%`);
});
```

### Beispiel 2: Semantische Suche

```typescript
import { semanticSearch } from './services/database';

// Textbasierte semantische Suche
const docs = await semanticSearch(
  'Wie funktioniert maschinelles Lernen?',
  5,    // Top 5 Ergebnisse
  0.6   // Min. 60% Similarity
);

docs.forEach(doc => {
  console.log(`📄 ${doc.title}`);
  console.log(`   Similarity: ${(doc.similarity * 100).toFixed(1)}%`);
  console.log(`   ${doc.content.substring(0, 100)}...`);
});
```

### Beispiel 3: Fehlerbehandlung

```typescript
import { searchSimilarEmbeddings } from './services/database';
import { ValidationError, DatabaseError } from '../errors';

try {
  const results = await searchSimilarEmbeddings(queryVector, 10, 0.7);
  
  if (results.length === 0) {
    console.log('Keine ähnlichen Dokumente gefunden');
  } else {
    console.log(`${results.length} Ergebnisse gefunden`);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Ungültige Eingabe:', error.message);
    console.error('Field:', error.field);
    console.error('Details:', error.context);
  } else if (error instanceof DatabaseError) {
    console.error('Datenbankfehler:', error.message);
    console.error('Context:', error.context);
  } else {
    console.error('Unbekannter Fehler:', error);
  }
}
```

## Wartbarkeit

### Code-Struktur

**Separation of Concerns:**
- `searchSimilarEmbeddings()`: Vector-Level Search
- `semanticSearch()`: Document-Level Search
- `calculateCosineSimilarity()`: Pure Math Function

**Single Responsibility:**
- Jede Funktion hat einen klaren Zweck
- Keine vermischten Verantwortlichkeiten
- Testbar in Isolation

**Dokumentation:**
- JSDoc-Kommentare auf allen öffentlichen Funktionen
- Parameter-Beschreibungen
- Return-Type-Dokumentation
- Throws-Dokumentation
- Beispiele in Kommentaren

### Erweiterbarkeit

**Neue Similarity-Metriken:**
```typescript
// Einfach neue Similarity-Funktion hinzufügen
function calculateEuclideanDistance(a: number[], b: number[]): number {
  // Implementation
}

// In searchSimilarEmbeddings() verwenden
const distance = calculateEuclideanDistance(queryVector, emb.vector);
```

**Alternative Vector-Datenbanken:**
```typescript
// Interface für Vector Store
interface VectorStore {
  search(query: number[], limit: number): Promise<VectorEmbedding[]>;
}

// SQLite-Implementierung
class SQLiteVectorStore implements VectorStore {
  async search(query: number[], limit: number) {
    // Current implementation
  }
}

// Zukünftig: Qdrant, Pinecone, etc.
class QdrantVectorStore implements VectorStore {
  async search(query: number[], limit: number) {
    // Qdrant implementation
  }
}
```

## Migration & Upgrades

### Von In-Memory zu Vector DB Extension

Wenn die Datenmenge wächst (>10.000 Dokumente):

**Option 1: sqlite-vss**
```rust
// In Cargo.toml
[dependencies]
tauri-plugin-sql = { version = "2", features = ["sqlite", "vss"] }
```

**Option 2: Qdrant Embedded**
```toml
[dependencies]
qdrant-client = "1.0"
```

**Migration bleibt kompatibel**, da:
- API-Signaturen gleich bleiben
- Nur interne Implementierung ändert sich
- Bestehender Code funktioniert weiter

## Zusammenfassung

✅ **Implementiert:**
- Vector Similarity Search mit Cosine Similarity
- Semantic Document Search
- Umfassende Input-Validierung
- Defensive Fehlerbehandlung
- Strukturiertes Logging
- Comprehensive Test Suite
- Detaillierte Dokumentation

✅ **Code-Qualität:**
- Type-safe mit TypeScript
- JSDoc-Dokumentation
- Separation of Concerns
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Defensive Programming

✅ **Wartbarkeit:**
- Klare Code-Struktur
- Testbare Komponenten
- Erweiterbar für neue Features
- Migrierbar zu anderen Vector DBs
- Umfassende Dokumentation
