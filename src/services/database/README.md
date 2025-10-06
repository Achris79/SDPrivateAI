# Database Service

Lokale, schnelle SQLite-Datenbankanbindung mit minimalen Abhängigkeiten.

## Übersicht

Dieser Service bietet eine einfache und wartbare Datenbankschicht basierend auf:
- **SQLite** - Leichtgewichtige, serverlose Datenbank
- **Tauri SQL Plugin** - Nahtlose Integration in Tauri-Apps
- **TypeScript** - Typsichere API

## Funktionen

### Initialisierung

```typescript
import { initDatabase, closeDatabase } from './services/database';

// Datenbank initialisieren (beim App-Start)
await initDatabase();

// Datenbank schließen (beim Beenden)
await closeDatabase();
```

### Dokument-Operationen (CRUD)

#### Dokument erstellen

```typescript
import { createDocument } from './services/database';

const doc = await createDocument(
  'doc-123',
  'Mein Titel',
  'Mein Inhalt',
  { tags: ['wichtig', 'privat'], category: 'Notizen' }
);
```

#### Dokument abrufen

```typescript
import { getDocument } from './services/database';

const doc = await getDocument('doc-123');
if (doc) {
  console.log(doc.title, doc.content);
}
```

#### Dokument aktualisieren

```typescript
import { updateDocument } from './services/database';

const updated = await updateDocument('doc-123', {
  title: 'Neuer Titel',
  content: 'Neuer Inhalt'
});
```

#### Dokument löschen

```typescript
import { deleteDocument } from './services/database';

const success = await deleteDocument('doc-123');
```

#### Alle Dokumente auflisten

```typescript
import { listDocuments } from './services/database';

// Erste 100 Dokumente
const docs = await listDocuments(100, 0);

// Nächste 100 Dokumente (Pagination)
const moreDocs = await listDocuments(100, 100);
```

#### Dokumente durchsuchen

```typescript
import { searchDocuments } from './services/database';

const results = await searchDocuments('Suchbegriff');
```

### Embedding-Operationen

#### Embedding erstellen

```typescript
import { createEmbedding } from './services/database';

const embedding = await createEmbedding(
  'emb-123',
  'doc-123',
  [0.1, 0.2, 0.3, ...], // Vektor
  { model: 'text-embedding-ada-002' }
);
```

#### Embeddings abrufen

```typescript
import { getEmbedding, getEmbeddingsByDocumentId } from './services/database';

// Einzelnes Embedding
const emb = await getEmbedding('emb-123');

// Alle Embeddings eines Dokuments
const embeddings = await getEmbeddingsByDocumentId('doc-123');
```

#### Embeddings löschen

```typescript
import { deleteEmbedding, deleteEmbeddingsByDocumentId } from './services/database';

// Einzelnes Embedding löschen
await deleteEmbedding('emb-123');

// Alle Embeddings eines Dokuments löschen
await deleteEmbeddingsByDocumentId('doc-123');
```

## Features

### ✅ Lokal & Offline
- Keine Cloud-Abhängigkeiten
- SQLite-Datei lokal gespeichert
- Vollständig offline-fähig

### ✅ Schnell & Effizient
- Indizierte Abfragen für Performance
- Optimierte SQL-Queries
- Minimaler Overhead

### ✅ Einfach zu implementieren
- Typsichere TypeScript-API
- Intuitive Funktionsnamen
- Klare Fehlerbehandlung

### ✅ Wartbar
- Minimal Dependencies (nur Tauri SQL Plugin)
- Saubere Code-Struktur
- Gut dokumentiert

## Performance-Optimierungen

Das System erstellt automatisch Indizes für:
- `documents.created_at` - Schnelles Sortieren nach Erstellungsdatum
- `documents.updated_at` - Schnelles Sortieren nach Änderungsdatum
- `embeddings.document_id` - Schnelles Abrufen von Embeddings pro Dokument

## Datenbankschema

### Tabelle: documents
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Tabelle: embeddings
```sql
CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  vector BLOB NOT NULL,
  metadata TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
)
```

## Fehlerbehandlung

Alle Funktionen werfen einen Fehler, wenn die Datenbank nicht initialisiert wurde:

```typescript
try {
  const doc = await getDocument('doc-123');
} catch (error) {
  console.error('Database error:', error);
}
```

## Migrations & Erweiterungen

Das System ist erweiterbar für zukünftige Schema-Änderungen:
- Neue Tabellen können in `createTables()` hinzugefügt werden
- Neue Indizes können in `createIndexes()` hinzugefügt werden
- Migrations können durch Versionierung implementiert werden
