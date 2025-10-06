# Architecture Documentation - SDPrivateAI

## Übersicht

SDPrivateAI ist eine Offline-fähige Desktop-Anwendung für KI-gestütztes Dokumenten-Management mit semantischer Suche. Die Anwendung nutzt moderne Architektur-Patterns für Skalierbarkeit, Wartbarkeit und Performance.

## Technology Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Syncfusion Components** - UI Components
- **i18next** - Internationalisierung

### Backend
- **Tauri** - Native Desktop Runtime
- **Rust** - Backend Logic
- **SQLite** - Lokale Datenbank
- **Tauri SQL Plugin** - Datenbankzugriff

### AI/ML (Geplant)
- **nomic-embed-text** - Text Embeddings (768 Dimensionen)
- **ONNX Runtime / llama.cpp** - ML Inference

## Architektur-Patterns

### 1. Service Container Pattern

**Zweck:** Zentrale Verwaltung aller Services mit Dependency Injection

```typescript
// services/container.ts
class ServiceContainer {
  private static instance: ServiceContainer;
  
  async initializeAll(): Promise<void>
  getDatabase(): typeof DatabaseService
  getAI(): typeof AIService
  async cleanup(): Promise<void>
}
```

**Vorteile:**
- ✅ Single Point of Initialization
- ✅ Einfache Service-Verwaltung
- ✅ Lifecycle-Management
- ✅ Testbarkeit durch Mocking

### 2. Error Boundary Pattern

**Zweck:** Robuste Fehlerbehandlung mit User-freundlicher UI

```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo)
  render() // Fallback UI bei Fehlern
}
```

**Vorteile:**
- ✅ Verhindert kompletten App-Crash
- ✅ Strukturiertes Error-Logging
- ✅ User-freundliche Fehleranzeige
- ✅ Recovery-Optionen

### 3. Custom Hooks Pattern

**Zweck:** Wiederverwendbare State-Logic mit optimaler Performance

#### useDatabase Hook
```typescript
// hooks/useDatabase.ts
export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createDocument = useCallback(async (...) => { ... }, []);
  const getDocument = useCallback(async (...) => { ... }, []);
  // ... weitere Operationen
}
```

**Vorteile:**
- ✅ Separation of Concerns
- ✅ Eingebautes Error-Handling
- ✅ Loading States
- ✅ Wiederverwendbarkeit

#### useTheme Hook
```typescript
// hooks/useTheme.ts
export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Lazy initialization from localStorage
  });
  
  const toggleTheme = useCallback(() => { ... }, []);
  const theme = useMemo(() => { ... }, [themeMode]);
}
```

**Optimierungen:**
- ✅ Lazy Initialization
- ✅ Memoization (useMemo, useCallback)
- ✅ Minimale Re-renders

### 4. Repository Pattern (Database)

**Zweck:** Abstraction Layer für Datenbankzugriff

```typescript
// services/database/index.ts
export async function createDocument(...)
export async function getDocument(id: string)
export async function updateDocument(...)
export async function deleteDocument(id: string)
export async function listDocuments(...)
export async function searchDocuments(query: string)
export async function semanticSearch(...)
```

**Features:**
- ✅ Parametrisierte Queries (SQL-Injection-Schutz)
- ✅ Input Validation
- ✅ Type Safety
- ✅ Error Handling
- ✅ Structured Logging

### 5. Validation Layer

**Zweck:** Defensive Programmierung mit Security-Focus

```typescript
// utils/validation.ts
export function validateNotEmpty(value: string, fieldName: string)
export function validateStringLength(...)
export function validateId(id: string, fieldName?: string)
export function validateNoSqlInjection(...)
export function sanitizeString(value: string)
```

**Security Features:**
- ✅ Input Sanitization
- ✅ SQL-Injection-Prevention
- ✅ XSS-Protection
- ✅ Type Assertions

## Component-Hierarchie

```
App (ErrorBoundary)
├── MainLayout (React.memo)
│   ├── Header
│   │   ├── Theme Toggle
│   │   └── Language Switcher
│   ├── Sidebar
│   │   └── Navigation
│   └── Main Content Area
│       └── Dynamic Components
```

## Data Flow

```
User Interaction
    ↓
React Component (Custom Hook)
    ↓
Service Container
    ↓
Service Layer (Database/AI)
    ↓
Validation Layer
    ↓
Backend (Tauri/Rust)
    ↓
SQLite Database
```

## Performance-Optimierungen

### React Optimizations
1. **React.memo** für teure Komponenten (MainLayout)
2. **useMemo** für berechnete Werte (Styles, Theme)
3. **useCallback** für Event-Handler (toggleTheme)
4. **Lazy Initialization** für State (localStorage)

### Database Optimizations
1. **Indizes** auf häufig abgefragten Feldern
   - `documents.created_at`
   - `documents.updated_at`
   - `embeddings.document_id`

2. **Batch Operations** (geplant)
3. **Connection Pooling** via Service Container
4. **Query Optimization** mit parametrisierten Queries

### Build Optimizations
1. **Code Splitting** (vorbereitet)
2. **Tree Shaking** via Vite
3. **Asset Optimization**
4. **TypeScript Strict Mode**

## Security Architecture

### Frontend Security
1. **Input Validation** auf allen Public APIs
2. **XSS Prevention** durch Sanitization
3. **Type Safety** mit TypeScript Strict Mode
4. **CSP Headers** konfiguriert

### Backend Security
1. **Parametrisierte Queries** (SQL-Injection-Schutz)
2. **Minimal Tauri Permissions**
3. **Secure Storage** (SQLite mit Validation)
4. **Error Handling** ohne Sensitive Data

### Planned Enhancements
- [ ] Encryption at Rest
- [ ] Rate Limiting
- [ ] Audit Logging
- [ ] RBAC (Role-Based Access Control)

## Error Handling Strategy

### Error Classes Hierarchy
```
AppError (Base)
├── DatabaseError
├── ValidationError
├── AIError
├── SecurityError
└── NotFoundError
```

### Error Logging
```typescript
ErrorLogger (Singleton)
├── log(error: Error, context?: Record<string, any>)
├── warn(message: string, context?: Record<string, any>)
└── info(message: string, context?: Record<string, any>)
```

### Error Boundaries
- **Global Boundary**: Fängt alle unbehandelten React-Fehler
- **Component Boundaries**: Für kritische Sections (geplant)
- **Async Boundaries**: Try-Catch in allen async Funktionen

## Testing Strategy (Geplant)

### Unit Tests
- Services (Database, AI)
- Validation Utils
- Custom Hooks

### Integration Tests
- Database Operations
- Service Container
- Error Handling

### E2E Tests
- Kritische User-Flows
- Error Scenarios
- Performance Tests

## Deployment Architecture

### Desktop (Tauri)
```
┌─────────────────────────────┐
│   React Frontend (Vite)     │
├─────────────────────────────┤
│   Tauri Runtime (Rust)      │
├─────────────────────────────┤
│   SQLite Database           │
├─────────────────────────────┤
│   Operating System          │
└─────────────────────────────┘
```

### Build Targets
- Windows (NSIS Installer)
- macOS (DMG, App Bundle)
- Linux (AppImage, deb)
- Android (APK) - geplant

## Code Quality Tools

### Linting & Formatting
- **ESLint** - Code Quality
- **TypeScript** - Type Checking
- **Prettier** - Code Formatting (geplant)

### Pre-commit Hooks (Geplant)
- Type Check
- Linting
- Tests
- Build Verification

## Future Enhancements

### Short Term
1. Vitest Setup für Testing
2. Husky Pre-commit Hooks
3. Code Splitting für Services
4. Lazy Loading für Routes

### Medium Term
1. Vector Database Integration (sqlite-vss)
2. nomic-embed-text Integration
3. Advanced Search UI
4. Document Upload/Processing

### Long Term
1. LLM Integration (llama.cpp)
2. Android Support
3. Cloud Sync (Optional)
4. Plugin System

## Best Practices

### Code Organization
```
src/
├── components/        # React Components
│   ├── common/       # Shared Components
│   ├── layout/       # Layout Components
│   └── features/     # Feature Components
├── hooks/            # Custom Hooks
├── services/         # Business Logic
│   ├── database/    # Database Service
│   ├── ai/          # AI Service
│   └── container.ts # Service Container
├── utils/            # Utility Functions
├── types/            # TypeScript Types
└── errors/           # Error Classes
```

### Naming Conventions
- **Components**: PascalCase (MainLayout.tsx)
- **Hooks**: camelCase with 'use' prefix (useDatabase.ts)
- **Services**: camelCase (database/index.ts)
- **Types**: PascalCase (Document, VectorEmbedding)
- **Constants**: UPPER_SNAKE_CASE

### Git Workflow
1. Feature Branches
2. Pull Request Reviews
3. Automated Testing (geplant)
4. Semantic Versioning

## Monitoring & Debugging

### Logging Strategy
- **Development**: Verbose Console Logs
- **Production**: Error Logs Only
- **Structured Logging**: JSON Format mit Context

### Debug Tools
- React DevTools
- Tauri DevTools
- SQLite Browser
- Performance Profiler

## Documentation

### Code Documentation
- JSDoc für alle Public APIs
- README files in Service-Ordnern
- Inline Comments für komplexe Logic

### Project Documentation
- Architecture Docs (dieses Dokument)
- API Documentation
- Error Handling Guide
- Security Guidelines

## Conclusion

Die Architektur von SDPrivateAI ist darauf ausgelegt, eine skalierbare, wartbare und performante Offline-AI-Anwendung zu ermöglichen. Durch den Einsatz moderner Patterns wie Service Container, Error Boundaries und Custom Hooks wird eine robuste Grundlage für zukünftige Features geschaffen.

### Key Strengths
✅ Type Safety durch TypeScript
✅ Robuste Error Handling
✅ Performance-Optimierungen
✅ Security-First Approach
✅ Skalierbare Architektur
✅ Testbarkeit
✅ Dokumentation

### Areas for Improvement
⏳ Testing Coverage erhöhen
⏳ Code Splitting implementieren
⏳ Performance Monitoring
⏳ CI/CD Pipeline
