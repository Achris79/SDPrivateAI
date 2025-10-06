# Vector Search & Semantic Similarity

Diese Dokumentation beschreibt die Implementierung der semantischen Suche mit Vector Embeddings in SDPrivateAI.

## Übersicht

Die App verwendet **nomic-embed-text** als Embedding-Modell und implementiert **Cosine Similarity** für die Vektorsuche direkt in SQLite ohne externe Vector-DB-Erweiterungen.

### Technologie-Stack

- **Embedding-Modell**: nomic-embed-text (768 Dimensionen)
- **Datenbank**: SQLite mit JSON-basierter Vektorspeicherung
- **Similarity-Berechnung**: Cosine Similarity (In-Memory)
- **Integration**: TypeScript mit Tauri SQL Plugin

## Architektur-Entscheidungen

### Warum nomic-embed-text?

- ✅ **768 Dimensionen** - Gute Balance zwischen Qualität und Performance
- ✅ **Offline-fähig** - Kann lokal ausgeführt werden
- ✅ **Offen** - Open-Source-Modell
- ✅ **Qualität** - Sehr gute Embedding-Qualität für semantische Suche

### Warum SQLite + In-Memory Search?

- ✅ **Einfachheit** - Keine zusätzlichen Dependencies
- ✅ **Portabilität** - Läuft überall wo SQLite läuft (Windows, macOS, Linux, Android)
- ✅ **Offline** - Komplett lokal ohne Server
- ✅ **Integration** - Nahtlos mit bestehendem Tauri SQL Plugin

**Hinweis**: Für sehr große Datenmengen (>10.000 Dokumente) kann später eine dedizierte Vector-DB-Lösung wie sqlite-vss oder Qdrant (embedded) integriert werden.

## Implementierung

### 1. Embedding-Generierung

```typescript
import { generateEmbedding } from './services/ai';

// Generiere Embedding für Text (768 Dimensionen)
const result = await generateEmbedding('Mein Text für die Vektorisierung');
console.log(result.vector.length); // 768
console.log(result.dimensionality); // 768
```

**Aktueller Stand**: Placeholder-Implementierung mit Random-Vektoren.  
**TODO**: Integration mit echtem nomic-embed-text Modell über:
- transformers.js
- ONNX Runtime Web
- Tauri Command mit llama.cpp/nomic-embed

### 2. Vector Storage

Embeddings werden in der SQLite `embeddings` Tabelle gespeichert:

```sql
CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  vector BLOB NOT NULL,           -- JSON Array mit 768 Float-Werten
  metadata TEXT,                  -- Optionale Metadaten (JSON)
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
)
```

Vektoren werden als JSON-Array gespeichert:
```typescript
const embedding = await createEmbedding(
  'emb-123',
  'doc-123',
  [0.123, -0.456, 0.789, ...], // 768 Dimensionen
  { model: 'nomic-embed-text', dimension: 768 }
);
```

### 3. Vector Similarity Search

#### a) Suche nach ähnlichen Embeddings

```typescript
import { searchSimilarEmbeddings } from './services/database';

const queryVector = [0.1, 0.2, 0.3, ...]; // 768 Dimensionen

const results = await searchSimilarEmbeddings(
  queryVector,
  10,    // Limit: Max. 10 Ergebnisse
  0.7    // Min. Similarity: 0.7 (0-1 Skala)
);

// Ergebnisse sind nach Similarity sortiert (höchste zuerst)
results.forEach(emb => {
  console.log(`${emb.id}: ${emb.similarity.toFixed(3)}`);
});
```

#### b) Semantische Dokumentensuche

```typescript
import { semanticSearch } from './services/database';

const docs = await semanticSearch(
  'Wie funktioniert künstliche Intelligenz?',
  5,     // Max. 5 Ergebnisse
  0.6    // Min. Similarity: 0.6
);

docs.forEach(doc => {
  console.log(`${doc.title} (${doc.similarity.toFixed(2)})`);
  console.log(doc.content);
});
```

**Ablauf**:
1. Generiere Embedding für Suchtext
2. Finde ähnliche Embeddings via Cosine Similarity
3. Lade zugehörige Dokumente
4. Berechne durchschnittliche Similarity (bei mehreren Embeddings pro Dokument)
5. Sortiere und gib Top-Ergebnisse zurück

### 4. Cosine Similarity Berechnung

Die Similarity-Berechnung erfolgt in TypeScript:

```typescript
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) return 0;
    
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator; // Wert zwischen -1 und 1
}
```

**Eigenschaften**:
- ✅ Invariant gegenüber Vektor-Länge
- ✅ Wert zwischen -1 (völlig gegensätzlich) und 1 (identisch)
- ✅ Embeddings haben typischerweise Similarity zwischen 0 und 1
- ✅ Threshold von 0.5-0.7 ist üblich für relevante Ergebnisse

## Performance-Überlegungen

### Aktuelle Implementierung (In-Memory)

**Vorteile**:
- ✅ Einfach zu implementieren
- ✅ Keine zusätzlichen Dependencies
- ✅ Funktioniert auf allen Plattformen
- ✅ Gut für kleine bis mittlere Datenmengen (< 10.000 Dokumente)

**Nachteile**:
- ⚠️ O(n) Komplexität - alle Vektoren werden verglichen
- ⚠️ Bei sehr großen Datenmengen kann es langsam werden

### Optimierungen für große Datenmengen

Wenn die Anzahl der Embeddings wächst (> 10.000), können folgende Optimierungen implementiert werden:

#### Option 1: sqlite-vss Extension
```rust
// In Cargo.toml
[dependencies]
tauri-plugin-sql = { version = "2", features = ["sqlite", "vss"] }
```

#### Option 2: Qdrant Embedded
```toml
[dependencies]
qdrant-client = "1.0"
```

#### Option 3: HNSW Index (Custom)
- Hierarchical Navigable Small World Graph
- Approximate Nearest Neighbor Search
- Deutlich schneller bei großen Datenmengen

## Nächste Schritte

### Phase 1: Embedding-Modell Integration ✅
- [x] nomic-embed-text als Standard definiert
- [x] 768 Dimensionen konfiguriert
- [x] Placeholder-Implementierung vorhanden

### Phase 2: Vector Search ✅
- [x] Cosine Similarity implementiert
- [x] `searchSimilarEmbeddings()` Funktion
- [x] `semanticSearch()` Funktion
- [x] Beispiele erstellt

### Phase 3: Echte Modell-Integration 🔄
- [ ] transformers.js Integration
- [ ] ONNX Runtime Web Setup
- [ ] Oder: Tauri Command mit llama.cpp/nomic-embed

### Phase 4: Performance-Optimierung 📅
- [ ] Benchmarking mit verschiedenen Datenmengen
- [ ] Entscheidung über Vector-DB-Extension (wenn nötig)
- [ ] Caching-Strategien

### Phase 5: UI-Integration 📅
- [ ] Search UI-Komponente
- [ ] Ergebnis-Visualisierung
- [ ] Similarity-Score-Anzeige

## Verwendungsbeispiele

Siehe [`src/services/database/examples.ts`](./src/services/database/examples.ts) für vollständige Beispiele:

```typescript
import { vectorSearchExample } from './services/database/examples';

// Führe Vector Search Beispiel aus
await vectorSearchExample();
```

## API-Referenz

### `searchSimilarEmbeddings()`
Sucht nach ähnlichen Embeddings basierend auf einem Query-Vektor.

**Parameter**:
- `queryVector: number[]` - Query-Vektor (768 Dimensionen)
- `limit: number` - Max. Anzahl Ergebnisse (default: 10)
- `minSimilarity: number` - Min. Similarity-Threshold 0-1 (default: 0.0)

**Returns**: `Promise<Array<VectorEmbedding & { similarity: number }>>`

### `semanticSearch()`
Semantische Dokumentensuche basierend auf Suchtext.

**Parameter**:
- `queryText: string` - Suchtext
- `limit: number` - Max. Anzahl Ergebnisse (default: 10)
- `minSimilarity: number` - Min. Similarity-Threshold 0-1 (default: 0.5)

**Returns**: `Promise<Array<Document & { similarity: number }>>`

## Weiterführende Ressourcen

- [nomic-embed-text Model](https://huggingface.co/nomic-ai/nomic-embed-text-v1)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Vector Search Best Practices](https://www.pinecone.io/learn/vector-search/)
- [sqlite-vss Extension](https://github.com/asg017/sqlite-vss)
