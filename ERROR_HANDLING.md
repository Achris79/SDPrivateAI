# Error Handling & Security - SDPrivateAI

## Übersicht

SDPrivateAI implementiert ein umfassendes, sicherheitsorientiertes Fehlerbehandlungssystem mit defensiver Programmierung.

## Architektur

### Custom Error Classes

Alle Fehler im System erweitern die `AppError`-Basisklasse für typsichere Fehlerbehandlung:

```typescript
// Basis-Fehlerklasse
AppError              // Allgemeiner Anwendungsfehler
├── DatabaseError     // Datenbankfehler
├── ValidationError   // Eingabevalidierungsfehler
├── AIError          // KI/ML-Verarbeitungsfehler
├── SecurityError    // Sicherheitsrelevante Fehler
└── NotFoundError    // Ressource nicht gefunden
```

**Verwendung:**

```typescript
import { DatabaseError, ValidationError } from './errors';

// Fehler werfen
throw new DatabaseError('Failed to connect', { host: 'localhost' });

// Fehler abfangen
try {
  await createDocument(id, title, content);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
    console.error('Invalid input:', error.field);
  } else if (error instanceof DatabaseError) {
    // Handle database error
    console.error('Database issue:', error.details);
  }
}
```

## Eingabevalidierung

### Defensive Programmierung

Alle öffentlichen Funktionen validieren ihre Eingaben:

```typescript
import { validateId, validateStringLength, sanitizeString } from './utils/validation';

export async function createDocument(id: string, title: string, content: string) {
  // Validierung
  validateId(id, 'document id');
  validateStringLength(title, 'title', 1, 500);
  validateStringLength(content, 'content', 0, 1000000);
  
  // Sanitisierung
  const sanitizedTitle = sanitizeString(title);
  const sanitizedContent = sanitizeString(content);
  
  // ... Verarbeitung
}
```

### Verfügbare Validatoren

#### String-Validierung
```typescript
validateNotEmpty(value: string, fieldName: string)
validateStringLength(value: string, fieldName: string, min?: number, max?: number)
validateId(id: string, fieldName?: string)
```

#### Numeric-Validierung
```typescript
validateNumber(value: any, fieldName: string, min?: number, max?: number)
validateArray(value: any, fieldName: string, minLength?: number, maxLength?: number)
```

#### Security-Validierung
```typescript
validateNoSqlInjection(value: string, fieldName: string)
sanitizeString(value: string): string
```

#### Safe Parsing
```typescript
safeJsonParse<T>(value: string | null, defaultValue: T): T
```

## Sicherheitsmaßnahmen

### 1. SQL-Injection-Schutz

**Parametrisierte Queries:**
```typescript
// ✅ SICHER - Parametrisierte Query
await db.execute(
  `INSERT INTO documents (id, title, content) VALUES (?, ?, ?)`,
  [id, title, content]
);

// ❌ UNSICHER - String-Konkatenation (NICHT verwenden!)
await db.execute(`INSERT INTO documents VALUES ('${id}', '${title}')`);
```

**Input Sanitization:**
```typescript
// Entfernt gefährliche Zeichen
const sanitized = sanitizeString(userInput);

// Prüft auf verdächtige SQL-Patterns
validateNoSqlInjection(searchQuery, 'search');
```

### 2. XSS-Schutz

```typescript
// Sanitisiert Strings automatisch
const sanitizedTitle = sanitizeString(title);
// - Entfernt Null-Bytes
// - Entfernt Steuerzeichen (außer \n, \t)
// - Verhindert Script-Injection
```

### 3. Größenlimits

```typescript
// Verhindert DoS durch große Inputs
validateStringLength(content, 'content', 0, 1000000); // Max 1MB
validateArray(vector, 'vector', 1, 10000);           // Max 10k Elemente
```

### 4. Type Safety

```typescript
// Strikte Typprüfung
validateNumber(limit, 'limit', 1, 1000);
validateExists(document, 'document');
```

## Error Logging

### Logger-Service

```typescript
import { logger } from './errors';

// Info-Logging
logger.info('Database initialized', { version: '1.0' });

// Warning-Logging
logger.warn('Using placeholder implementation', { feature: 'embeddings' });

// Error-Logging
logger.log(error, { component: 'Database', operation: 'create' });
```

### Log-Format

```
[AppError] 2024-01-15T10:30:45.123Z {
  code: 'DATABASE_ERROR',
  message: 'Failed to create document',
  details: { id: 'doc-123', originalError: '...' },
  context: { operation: 'createDocument' }
}
```

## Best Practices

### 1. Immer validieren

```typescript
// ✅ Gut
export async function updateDocument(id: string, title: string) {
  validateId(id, 'document id');
  validateStringLength(title, 'title', 1, 500);
  // ... Update-Logik
}

// ❌ Schlecht
export async function updateDocument(id: string, title: string) {
  // Keine Validierung - anfällig für Fehler
  await db.execute(`UPDATE documents SET title = ? WHERE id = ?`, [title, id]);
}
```

### 2. Fehler weitergeben

```typescript
// ✅ Gut - Fehler typisiert weitergeben
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    throw error; // Validierungsfehler durchreichen
  }
  throw new DatabaseError('Operation failed', {
    originalError: error instanceof Error ? error.message : 'Unknown'
  });
}

// ❌ Schlecht - Fehler verschlucken
try {
  await riskyOperation();
} catch (error) {
  console.log('Oops'); // Information geht verloren
}
```

### 3. Context bereitstellen

```typescript
// ✅ Gut - Mit Context
throw new DatabaseError('Failed to create document', {
  id,
  titleLength: title.length,
  originalError: error.message
});

// ❌ Schlecht - Ohne Context
throw new Error('Database error');
```

### 4. Safe Parsing verwenden

```typescript
// ✅ Gut - Mit Fallback
const metadata = safeJsonParse(doc.metadata, {});

// ❌ Schlecht - Kann crashen
const metadata = JSON.parse(doc.metadata);
```

## Fehlerbehandlung in Components

### React Error Boundaries (TODO)

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.log(error, { 
      component: errorInfo.componentStack,
      type: 'React Error Boundary'
    });
  }
}
```

### Async Error Handling

```typescript
// In Komponenten
useEffect(() => {
  const initApp = async () => {
    try {
      await initDatabase();
      logger.info('App initialized');
    } catch (error) {
      logger.log(
        error instanceof Error ? error : new Error('Unknown error'),
        { component: 'App' }
      );
    }
  };
  
  initApp();
}, []);
```

## Testing Error Handling

```typescript
// Test: Validierung schlägt fehl
test('createDocument rejects invalid ID', async () => {
  await expect(
    createDocument('invalid id!', 'Title', 'Content')
  ).rejects.toThrow(ValidationError);
});

// Test: Fehler-Context
test('error includes context', async () => {
  try {
    await createDocument('', 'Title', 'Content');
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.field).toBe('document id');
  }
});
```

## Migration Guide

### Alte Fehlerbehandlung (vor Update)

```typescript
if (!db) throw new Error('Database not initialized');
```

### Neue Fehlerbehandlung (nach Update)

```typescript
if (!db) {
  throw new DatabaseError('Database not initialized');
}
```

## Checkliste für neue Funktionen

- [ ] Alle Eingabeparameter validieren
- [ ] Strings sanitisieren
- [ ] Typsichere Fehler werfen
- [ ] Context-Informationen bereitstellen
- [ ] Error-Logging implementieren
- [ ] Edge Cases behandeln
- [ ] Tests schreiben

## Ressourcen

- **Error Classes**: `src/errors/index.ts`
- **Validation Utils**: `src/utils/validation.ts`
- **Database Service**: `src/services/database/index.ts` (Referenzimplementierung)
- **AI Service**: `src/services/ai/index.ts` (Referenzimplementierung)

## Security Audit Checklist

### Input Validation
- [x] String length limits
- [x] Numeric range validation
- [x] Array size limits
- [x] ID format validation
- [x] SQL injection prevention
- [x] XSS prevention through sanitization

### Error Handling
- [x] Custom error classes
- [x] Detailed error logging
- [x] Context preservation
- [x] Type-safe error handling
- [x] Safe JSON parsing

### Database Security
- [x] Parameterized queries
- [x] Input sanitization
- [x] Transaction safety
- [x] Foreign key constraints

### Future Improvements
- [ ] Rate limiting
- [ ] CSRF protection (wenn relevant)
- [ ] Encryption for sensitive data
- [ ] Audit logging für kritische Operationen
- [ ] React Error Boundaries
- [ ] Sentry/Error Tracking Integration
