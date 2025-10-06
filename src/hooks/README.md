# Custom React Hooks

Dieses Verzeichnis enthält wiederverwendbare Custom Hooks für SDPrivateAI.

## Verfügbare Hooks

### useTheme
Verwaltet das App-Theme (Light/Dark Mode) mit localStorage-Persistierung.

**Features:**
- Lazy Initialization von localStorage
- Automatische Theme-Persistierung
- Optimiert mit useMemo und useCallback
- Type-safe Theme-Objekte

**Verwendung:**
```typescript
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { theme, themeMode, toggleTheme } = useTheme();
  
  return (
    <div style={{ backgroundColor: theme.colors.background }}>
      <button onClick={toggleTheme}>
        Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  );
}
```

**Return Value:**
```typescript
{
  theme: Theme;           // Komplettes Theme-Objekt
  themeMode: ThemeMode;   // 'light' | 'dark'
  toggleTheme: () => void; // Toggle-Funktion
}
```

---

### useDatabase
Verwaltet Datenbankoperationen mit eingebautem State-Management und Error-Handling.

**Features:**
- Alle CRUD-Operationen für Dokumente
- Loading States
- Error States
- Optimiert mit useCallback
- Type-safe Operationen

**Verwendung:**
```typescript
import { useDatabase } from './hooks/useDatabase';

function DocumentList() {
  const { 
    loading, 
    error, 
    listDocuments, 
    createDocument,
    deleteDocument 
  } = useDatabase();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  
  useEffect(() => {
    const loadDocs = async () => {
      const docs = await listDocuments();
      setDocuments(docs);
    };
    loadDocs();
  }, [listDocuments]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

**Return Value:**
```typescript
{
  loading: boolean;
  error: Error | null;
  createDocument: (id: string, title: string, content: string, metadata?: any) => Promise<Document | null>;
  getDocument: (id: string) => Promise<Document | null>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  listDocuments: (limit?: number, offset?: number) => Promise<Document[]>;
  searchDocuments: (query: string) => Promise<Document[]>;
  semanticSearch: (queryText: string, limit?: number, minSimilarity?: number) => Promise<Array<Document & { similarity: number }>>;
}
```

**Operationen:**

#### createDocument
Erstellt ein neues Dokument.
```typescript
const doc = await createDocument(
  'doc-123',
  'My Document',
  'Content here',
  { tags: ['important'] }
);
```

#### getDocument
Holt ein einzelnes Dokument.
```typescript
const doc = await getDocument('doc-123');
```

#### updateDocument
Aktualisiert ein Dokument.
```typescript
const updated = await updateDocument('doc-123', {
  title: 'Updated Title',
  content: 'New content'
});
```

#### deleteDocument
Löscht ein Dokument.
```typescript
const deleted = await deleteDocument('doc-123');
if (deleted) {
  console.log('Document deleted successfully');
}
```

#### listDocuments
Liste alle Dokumente mit Pagination.
```typescript
const docs = await listDocuments(50, 0); // 50 Dokumente, ab Position 0
```

#### searchDocuments
Volltextsuche in Dokumenten.
```typescript
const results = await searchDocuments('search query');
```

#### semanticSearch
Semantische Suche mit AI-Embeddings.
```typescript
const results = await semanticSearch(
  'Wie funktioniert KI?',
  10,    // Limit: 10 Ergebnisse
  0.5    // Mindest-Similarity: 50%
);
```

## Best Practices

### 1. Hook-Naming
Alle Hooks beginnen mit `use` (React-Konvention)
```typescript
✅ useTheme
✅ useDatabase
❌ themeHook
❌ getDatabaseHook
```

### 2. Return Type Consistency
Hooks sollten immer ein Objekt zurückgeben (für bessere Erweiterbarkeit)
```typescript
✅ return { data, loading, error };
❌ return [data, loading, error];
```

### 3. Memoization
Callbacks und berechnete Werte sollten memoized werden:
```typescript
const expensiveValue = useMemo(() => computeValue(input), [input]);
const callback = useCallback(() => doSomething(), [dependency]);
```

### 4. Error Handling
Hooks sollten Fehler nicht werfen, sondern im State speichern:
```typescript
✅ const { data, error } = useData();
✅ if (error) handleError(error);

❌ try { const data = useData(); } catch (e) { ... }
```

### 5. Dependencies
Alle verwendeten Props/State müssen in Dependencies sein:
```typescript
useEffect(() => {
  fetchData(id);
}, [id]); // ✅ id ist in Dependencies

useEffect(() => {
  fetchData(id);
}, []); // ❌ id fehlt in Dependencies
```

## Hook-Entwicklung

### Template für neue Hooks
```typescript
import { useState, useCallback } from 'react';
import { logger } from '../errors';

export function useMyFeature() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const operation = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await doOperation(...args);
      setState(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Operation failed');
      setError(error);
      logger.log(error, { hook: 'useMyFeature', operation: 'operation' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    state,
    loading,
    error,
    operation,
  };
}
```

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useMyFeature } from './useMyFeature';

test('should handle operation', async () => {
  const { result } = renderHook(() => useMyFeature());
  
  await act(async () => {
    await result.current.operation();
  });
  
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(null);
});
```

## Performance-Tipps

### 1. Vermeiden Sie übermäßiges Re-rendering
```typescript
// ✅ Gut - nur bei theme-Änderung
const theme = useMemo(() => getTheme(mode), [mode]);

// ❌ Schlecht - bei jedem Render
const theme = getTheme(mode);
```

### 2. Callbacks stabilisieren
```typescript
// ✅ Gut - stabile Referenz
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// ❌ Schlecht - neue Referenz bei jedem Render
const handleClick = () => doSomething(value);
```

### 3. Lazy Initialization
```typescript
// ✅ Gut - nur einmal beim ersten Render
const [state] = useState(() => expensiveOperation());

// ❌ Schlecht - bei jedem Render ausgeführt
const [state] = useState(expensiveOperation());
```

## Troubleshooting

### Problem: Hook wird zu oft aufgerufen
**Lösung:** Prüfen Sie Dependencies und verwenden Sie useMemo/useCallback

### Problem: Stale Closures
**Lösung:** Alle externen Variablen in Dependencies aufnehmen

### Problem: Memory Leaks
**Lösung:** Cleanup in useEffect implementieren
```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe(); // Cleanup
}, []);
```

## Weitere Ressourcen

- [React Hooks Dokumentation](https://react.dev/reference/react)
- [Hooks API Reference](https://react.dev/reference/react/hooks)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
