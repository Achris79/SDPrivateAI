# Security Guidelines - SDPrivateAI

## Übersicht

Dieses Dokument beschreibt die Sicherheitsmaßnahmen und Best Practices für SDPrivateAI.

## Sicherheitsprinzipien

### 1. Defense in Depth (Verteidigung in der Tiefe)

Mehrschichtige Sicherheit auf allen Ebenen:

- **Input Layer**: Validierung und Sanitisierung aller Eingaben
- **Business Logic Layer**: Typsichere Operationen und Fehlerbehandlung
- **Data Layer**: Parametrisierte Queries und sichere Speicherung
- **Output Layer**: Safe Rendering und XSS-Schutz

### 2. Least Privilege (Minimale Rechte)

- Nur notwendige Berechtigungen verwenden
- Datenbank-Operationen auf CRUD beschränken
- Keine dynamische SQL-Generierung
- Tauri Permissions minimal halten

### 3. Fail Secure (Sicher im Fehlerfall)

- Fehler protokollieren, aber keine sensitiven Daten leaken
- Default-Deny bei Validierung
- Graceful Degradation statt Crash

## Implementierte Sicherheitsmaßnahmen

### Input Validation & Sanitization

#### 1. String-Validierung

```typescript
// Längen-Limits
validateStringLength(title, 'title', 1, 500);        // 1-500 Zeichen
validateStringLength(content, 'content', 0, 1000000); // Max 1MB

// Format-Validierung
validateId(id, 'document id');  // Nur alphanumerisch, -, _

// Sanitisierung
const safe = sanitizeString(userInput);
// - Entfernt Null-Bytes (\0)
// - Entfernt Control Characters (außer \n, \t)
// - Verhindert Code-Injection
```

#### 2. SQL-Injection-Prävention

```typescript
// ✅ SICHER: Parametrisierte Queries
await db.execute(
  `SELECT * FROM documents WHERE id = ?`,
  [userId]
);

// ✅ SICHER: Pattern-Validation
validateNoSqlInjection(searchQuery, 'search');

// ✅ SICHER: Escaped LIKE Patterns
const escapedQuery = query.replace(/[%_]/g, '\\$&');
const searchPattern = `%${escapedQuery}%`;
```

**Geschützte Patterns:**
- SQL Keywords in gefährlichen Kontexten (DROP, DELETE, EXEC)
- SQL Comments (`--`, `/* */`)
- Command Chaining (`;`)
- Script Tags (`<script>`)

#### 3. XSS-Prävention

```typescript
// Automatische Sanitisierung
const sanitizedTitle = sanitizeString(title);

// React's built-in XSS protection nutzen
// (Alle Variablen werden automatisch escaped)
<div>{sanitizedTitle}</div>
```

#### 4. DoS-Prävention

```typescript
// Größenlimits für Arrays
validateArray(vector, 'vector', 1, 10000);  // Max 10k Elemente

// Content Size Limits
validateStringLength(content, 'content', 0, 1000000);  // Max 1MB

// Pagination Limits
validateNumber(limit, 'limit', 1, 1000);  // Max 1000 per page
```

### Database Security

#### 1. Prepared Statements

**Immer** parametrisierte Queries verwenden:

```typescript
// ✅ Korrekt
db.execute(`INSERT INTO docs (id, title) VALUES (?, ?)`, [id, title]);

// ❌ NIEMALS SO
db.execute(`INSERT INTO docs (id, title) VALUES ('${id}', '${title}')`);
```

#### 2. Foreign Key Constraints

```sql
CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  vector BLOB NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

Verhindert:
- Orphaned Records
- Referenzielle Integrität-Verletzungen

#### 3. Transaction Safety

```typescript
// TODO: Transaktionen für atomare Operationen
await db.execute('BEGIN TRANSACTION');
try {
  await createDocument(...);
  await createEmbedding(...);
  await db.execute('COMMIT');
} catch (error) {
  await db.execute('ROLLBACK');
  throw error;
}
```

### Type Safety & Validation

#### 1. TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

#### 2. Runtime Validation

```typescript
// Compile-time UND Runtime checks
export async function createDocument(
  id: string,
  title: string,
  content: string
): Promise<Document> {
  validateId(id, 'document id');
  validateStringLength(title, 'title', 1, 500);
  // ...
}
```

#### 3. Safe Type Assertions

```typescript
// ✅ Mit Validation
validateExists(value, 'fieldName');
const result = value;  // TypeScript weiß: value ist nicht null

// ❌ Unsichere Type Assertion
const result = value as Document;  // Keine Runtime-Prüfung
```

## Datensicherheit

### 1. Lokale Datenspeicherung

- SQLite-Datenbank lokal gespeichert
- Keine Cloud-Übertragung
- Dateisystem-Berechtigungen nutzen

### 2. Sensitive Daten

```typescript
// Lizenzschlüssel und Secrets in .env
VITE_SYNCFUSION_LICENSE_KEY=your-key

// .env NIEMALS committen!
// .gitignore prüfen:
.env
.env.local
```

### 3. Metadaten-Handling

```typescript
// Sichere JSON-Speicherung
const metadataJson = metadata ? JSON.stringify(metadata) : null;

// Sicheres Parsing
const metadata = safeJsonParse(doc.metadata, {});
```

## Error Handling Security

### 1. Keine sensiblen Daten in Fehlern

```typescript
// ✅ Gut
throw new DatabaseError('Failed to authenticate user', {
  userId: hashedId  // Nur gehashte/maskierte Werte
});

// ❌ Schlecht
throw new Error(`Failed for password: ${password}`);  // NIEMALS!
```

### 2. Structured Logging

```typescript
logger.log(error, {
  component: 'Database',
  operation: 'create',
  // Keine Passwörter, Tokens, etc.
  metadata: { userId: user.id }
});
```

### 3. Client vs Server Errors

```typescript
// Public errors (für UI)
if (error instanceof ValidationError) {
  showUserError(error.message);  // OK für User
}

// Internal errors (nur logging)
if (error instanceof DatabaseError) {
  logger.log(error);  // Nicht dem User zeigen
  showUserError('An error occurred. Please try again.');
}
```

## Tauri Security

### 1. Minimal Permissions

`tauri.conf.json`:
```json
{
  "tauri": {
    "allowlist": {
      "all": false,  // Alles explizit aktivieren
      "fs": {
        "all": false,
        "scope": ["$APPDATA/db/*"]  // Nur DB-Verzeichnis
      }
    }
  }
}
```

### 2. CSP (Content Security Policy)

```json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

### 3. Command Validation

```rust
#[tauri::command]
fn create_document(id: String, title: String) -> Result<Document, String> {
    // Validation auch im Backend
    if id.is_empty() || id.len() > 255 {
        return Err("Invalid ID".to_string());
    }
    // ...
}
```

## Security Audit Checklist

### Development
- [x] Input validation auf allen Public APIs
- [x] SQL Injection Prevention (parameterized queries)
- [x] XSS Prevention (sanitization)
- [x] DoS Prevention (size limits)
- [x] Type safety (TypeScript strict mode)
- [x] Error handling (custom error classes)
- [ ] Rate limiting (TODO)
- [ ] Session management (falls User-Auth kommt)

### Production
- [ ] Environment variables gesetzt
- [ ] .env nicht in Git
- [ ] Minimale Tauri Permissions
- [ ] CSP konfiguriert
- [ ] HTTPS für externe Ressourcen
- [ ] Dependency Audit (`npm audit`)
- [ ] Security Headers

### Data Protection
- [x] Lokale Speicherung
- [ ] Encryption at rest (TODO, falls benötigt)
- [x] Sichere JSON Handling
- [x] Foreign Key Constraints
- [ ] Backup Strategy

## Incident Response

### Bei Security-Issue:

1. **Identifizieren**: Logs prüfen, Scope verstehen
2. **Isolieren**: Betroffene Komponenten identifizieren
3. **Fixen**: Patch entwickeln und testen
4. **Deployen**: Update bereitstellen
5. **Dokumentieren**: Incident dokumentieren
6. **Lernen**: Prevention Measures verbessern

### Reporting

Security Issues bitte melden an:
- GitHub Security Advisories
- Oder direkt an Maintainer

## Regelmäßige Security Tasks

### Wöchentlich
- [ ] Dependency Updates prüfen (`npm outdated`)
- [ ] Security Advisories checken

### Monatlich
- [ ] `npm audit` durchführen
- [ ] Code Review mit Security-Fokus
- [ ] Error Logs analysieren

### Quarterly
- [ ] Vollständige Security Audit
- [ ] Penetration Testing (falls applicable)
- [ ] Dokumentation aktualisieren

## Resources & Tools

### Static Analysis
```bash
# TypeScript strict checks
npm run build

# TODO: ESLint Security Plugin
npm install eslint-plugin-security --save-dev
```

### Dependency Scanning
```bash
# Check for known vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix
```

### Best Practices
- OWASP Top 10
- CWE/SANS Top 25
- Tauri Security Best Practices
- SQLite Security Guidelines

## Contact

Für Security-Fragen oder -Bedenken:
- Siehe Repository Issues (für non-critical)
- GitHub Security Advisories (für critical)
