# Error Handling Architecture - Visual Overview

## Error Class Hierarchy

```
AppError (Base)
│
├── DatabaseError
│   ├── Connection errors
│   ├── Query errors
│   └── Transaction errors
│
├── ValidationError
│   ├── String validation
│   ├── Number validation
│   ├── Array validation
│   └── Format validation
│
├── AIError
│   ├── Embedding generation errors
│   ├── Vector operation errors
│   └── Model loading errors
│
├── SecurityError
│   ├── SQL injection attempts
│   ├── XSS attempts
│   └── Suspicious patterns
│
└── NotFoundError
    ├── Document not found
    ├── Embedding not found
    └── Resource not found
```

## Data Flow with Error Handling

```
User Input
    │
    ▼
┌─────────────────────┐
│ Input Validation    │ ◄── validateId(), validateStringLength(), etc.
│ (validation.ts)     │
└─────────────────────┘
    │
    ├── ✅ Valid
    │   │
    │   ▼
    │ ┌─────────────────────┐
    │ │ Input Sanitization  │ ◄── sanitizeString()
    │ │ (validation.ts)     │
    │ └─────────────────────┘
    │   │
    │   ▼
    │ ┌─────────────────────┐
    │ │ Business Logic      │ ◄── Database/AI Services
    │ │ (services/)         │
    │ └─────────────────────┘
    │   │
    │   ├── ✅ Success
    │   │   │
    │   │   ▼
    │   │ ┌─────────────────────┐
    │   │ │ Logger.info()       │
    │   │ └─────────────────────┘
    │   │   │
    │   │   ▼
    │   │ Return Result
    │   │
    │   └── ❌ Error
    │       │
    │       ▼
    │     ┌─────────────────────┐
    │     │ Custom Error        │ ◄── DatabaseError, AIError, etc.
    │     └─────────────────────┘
    │       │
    │       ▼
    │     ┌─────────────────────┐
    │     │ Logger.log(error)   │
    │     └─────────────────────┘
    │       │
    │       ▼
    │     Throw Error
    │
    └── ❌ Invalid
        │
        ▼
      ┌─────────────────────┐
      │ ValidationError     │
      └─────────────────────┘
        │
        ▼
      Throw Error
```

## Security Layers

```
┌─────────────────────────────────────────────────┐
│                  User Input                      │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Layer 1: Input Validation                      │
│  - Type checking                                │
│  - Length limits                                │
│  - Format validation                            │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Layer 2: Security Validation                   │
│  - SQL injection detection                      │
│  - XSS pattern detection                        │
│  - Suspicious content check                     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Layer 3: Sanitization                          │
│  - Remove null bytes                            │
│  - Remove control characters                    │
│  - Escape special characters                    │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Layer 4: Safe Database Operation               │
│  - Parameterized queries                        │
│  - Prepared statements                          │
│  - Transaction safety                           │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Layer 5: Error Handling                        │
│  - Custom error classes                         │
│  - Structured logging                           │
│  - No sensitive data leakage                    │
└─────────────────────────────────────────────────┘
```

## Database Service Flow

```
createDocument(id, title, content, metadata)
    │
    ▼
┌──────────────────────────┐
│ validateId(id)           │ ─── ❌ → ValidationError
└──────────────────────────┘
    │ ✅
    ▼
┌──────────────────────────┐
│ validateStringLength()   │ ─── ❌ → ValidationError
│ (title, 1-500)          │
└──────────────────────────┘
    │ ✅
    ▼
┌──────────────────────────┐
│ validateStringLength()   │ ─── ❌ → ValidationError
│ (content, 0-1MB)        │
└──────────────────────────┘
    │ ✅
    ▼
┌──────────────────────────┐
│ sanitizeString(title)    │
│ sanitizeString(content)  │
└──────────────────────────┘
    │
    ▼
┌──────────────────────────┐
│ db.execute(              │
│   INSERT ... VALUES      │
│   (?, ?, ?, ...)        │ ─── ❌ → DatabaseError
│ )                        │
└──────────────────────────┘
    │ ✅
    ▼
┌──────────────────────────┐
│ logger.info()            │
└──────────────────────────┘
    │
    ▼
  Return Document
```

## Error Handling Pattern

```typescript
// Pattern for all service functions:

try {
  // 1. Validate inputs
  validateId(id, 'field');
  validateStringLength(value, 'field', min, max);
  
  // 2. Sanitize inputs
  const safe = sanitizeString(value);
  
  // 3. Perform operation (with parameterized query)
  const result = await db.execute(
    'SELECT ... WHERE id = ?',
    [id]
  );
  
  // 4. Log success
  logger.info('Operation successful', { id });
  
  // 5. Return result
  return result;
  
} catch (error) {
  // 6. Re-throw known errors
  if (error instanceof ValidationError) {
    throw error;
  }
  
  // 7. Wrap unknown errors
  throw new DatabaseError('Operation failed', {
    id,
    originalError: error instanceof Error ? error.message : 'Unknown'
  });
}
```

## Component Integration

```
React Component
    │
    ▼
┌─────────────────────────┐
│ try {                   │
│   await createDocument()│
│ }                       │
└─────────────────────────┘
    │
    ├── ✅ Success
    │   │
    │   ▼
    │ Update UI
    │ Show success message
    │
    └── ❌ Error
        │
        ▼
      ┌─────────────────────────┐
      │ if ValidationError:     │
      │   Show field error      │
      │                         │
      │ if DatabaseError:       │
      │   Show generic error    │
      │   Log to monitoring     │
      │                         │
      │ else:                   │
      │   Show unknown error    │
      └─────────────────────────┘
```

## Validation Function Categories

```
String Validation
├── validateNotEmpty()
├── validateStringLength()
├── validateId()
└── sanitizeString()

Number Validation
├── validateNumber()
└── range checks

Array Validation
├── validateArray()
└── size limits

Security Validation
├── validateNoSqlInjection()
└── pattern detection

Safe Parsing
├── safeJsonParse()
└── validateJson()
```

## Logger Output Format

```
[Info] 2024-01-15T10:30:45.123Z Document created {
  id: 'doc-12345',
  titleLength: 25
}

[Warning] 2024-01-15T10:30:46.456Z Using placeholder implementation {
  feature: 'embeddings'
}

[AppError] 2024-01-15T10:30:47.789Z {
  code: 'DATABASE_ERROR',
  message: 'Failed to create document',
  details: {
    id: 'doc-12345',
    originalError: 'Connection timeout'
  },
  context: {
    component: 'Database',
    operation: 'create'
  }
}
```

## Key Files & Responsibilities

```
src/errors/index.ts
├── Error class definitions
├── ErrorLogger implementation
└── Logging utilities

src/utils/validation.ts
├── Input validators
├── Security validators
└── Sanitization functions

src/services/database/index.ts
├── CRUD operations
├── Input validation
├── SQL injection prevention
└── Error handling

src/services/ai/index.ts
├── AI operations
├── Vector validation
└── Error handling

src/examples/error-handling-examples.ts
└── Usage examples
```

## Security Boundaries

```
External Input (Untrusted)
        ↓
┌────────────────────┐
│  Input Validation  │ ← First line of defense
└────────────────────┘
        ↓
┌────────────────────┐
│  Sanitization      │ ← Remove dangerous content
└────────────────────┘
        ↓
┌────────────────────┐
│  Business Logic    │ ← Validated, safe data
└────────────────────┘
        ↓
┌────────────────────┐
│  Database Layer    │ ← Parameterized queries
└────────────────────┘
        ↓
Internal Storage (Trusted)
```
