# Component Integration - Visualisierung

## System-Architektur Diagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                        SDPrivateAI                              │
│                     (Tauri Desktop App)                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (Vite)                      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              App.tsx (Entry Point)                      │   │
│  │              + ErrorBoundary (Global)                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                 │                               │
│                                 ▼                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            Service Container (Singleton)                │   │
│  │  ┌──────────────────┐  ┌──────────────────┐           │   │
│  │  │ Database Service │  │   AI Service     │           │   │
│  │  └──────────────────┘  └──────────────────┘           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                 │                               │
│                                 ▼                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                Custom Hooks Layer                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │  useTheme    │  │ useDatabase  │  │  (future)   │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                 │                               │
│                                 ▼                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              UI Components (React)                      │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │         MainLayout (React.memo)              │     │   │
│  │  │  ┌──────────────┐  ┌──────────────────────┐ │     │   │
│  │  │  │   Header     │  │      Main Content    │ │     │   │
│  │  │  │  - Theme     │  │    - Documents       │ │     │   │
│  │  │  │  - Language  │  │    - Search          │ │     │   │
│  │  │  └──────────────┘  │    - Settings        │ │     │   │
│  │  │                    └──────────────────────┘ │     │   │
│  │  │  ┌──────────────┐                           │     │   │
│  │  │  │   Sidebar    │                           │     │   │
│  │  │  │  Navigation  │                           │     │   │
│  │  │  └──────────────┘                           │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Tauri Backend (Rust)                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Tauri Commands (IPC)                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                 │                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Tauri SQL Plugin                           │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SQLite Database (Local)                       │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   documents      │  │   embeddings     │                   │
│  │  - id            │  │  - id            │                   │
│  │  - title         │  │  - document_id   │                   │
│  │  - content       │  │  - vector (BLOB) │                   │
│  │  - metadata      │  │  - metadata      │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

## Datenfluss-Diagramm

### 1. App-Initialisierung
```
User startet App
       ↓
main.tsx lädt
       ↓
Syncfusion Lizenz registriert
       ↓
i18n konfiguriert
       ↓
App.tsx rendert
       ↓
Service Container initialisiert
       ├→ Database Service ✓
       └→ AI Service ✓
       ↓
Theme aus localStorage geladen
       ↓
UI rendert (MainLayout)
       ↓
App bereit ✅
```

### 2. Dokument-Erstellung
```
User Input (Create Document)
       ↓
Component ruft useDatabase Hook
       ↓
useDatabase.createDocument()
       ↓
Service Container → Database Service
       ↓
Input Validation (utils/validation.ts)
       ├→ validateId()
       ├→ validateStringLength()
       └→ sanitizeString()
       ↓
Database Service → Tauri SQL Plugin
       ↓
Parametrisierte SQL Query
       ↓
SQLite: INSERT INTO documents
       ↓
Dokument erstellt ✓
       ↓
State Update (React)
       ↓
UI Re-render (optimiert mit memo)
       ↓
User sieht neues Dokument
```

### 3. Fehlerbehandlung
```
Error tritt auf (z.B. Database Error)
       ↓
Try-Catch im Service/Hook
       ↓
Error-Logger protokolliert
       ├→ Timestamp
       ├→ Error Type
       ├→ Stack Trace
       └→ Context
       ↓
Error Boundary fängt ab (falls React-Fehler)
       ↓
Fallback UI zeigt Fehler
       ↓
User kann App neu laden
```

### 4. Theme-Wechsel
```
User klickt Theme-Toggle
       ↓
MainLayout.onThemeToggle()
       ↓
useTheme.toggleTheme() (useCallback)
       ↓
State Update: themeMode
       ↓
useMemo berechnet neues Theme
       ↓
localStorage.setItem()
       ↓
useEffect in App.tsx
       ↓
CSS-Variablen aktualisiert
       ↓
UI Re-render (memoized)
       ↓
Neues Theme aktiv ✅
```

## Komponenten-Interaktionen

### Service Container Interaktionen
```
┌─────────────────────┐
│  Service Container  │
│   (Singleton)       │
└─────────────────────┘
         │
         ├──→ initializeAll()
         │         ├──→ initializeDatabase()
         │         └──→ initializeAI()
         │
         ├──→ getDatabase()
         │         └──→ Database Service Instance
         │
         ├──→ getAI()
         │         └──→ AI Service Instance
         │
         └──→ cleanup()
                   └──→ closeDatabase()
```

### Hook Interaktionen
```
┌──────────────┐        ┌──────────────────┐
│  Component   │───────→│   useDatabase    │
│              │        │                  │
│              │←───────│  { loading,      │
│              │        │    error,        │
│              │        │    operations }  │
└──────────────┘        └──────────────────┘
                                │
                                ↓
                        ┌──────────────────┐
                        │ Database Service │
                        │  (via Container) │
                        └──────────────────┘
```

### Error Boundary Flow
```
┌─────────────────────────────────────────────┐
│              React Component Tree           │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │      ErrorBoundary (Level 1)        │  │
│  │  ┌───────────────────────────────┐  │  │
│  │  │        MainLayout             │  │  │
│  │  │  ┌─────────────────────────┐  │  │  │
│  │  │  │  Feature Component      │  │  │  │
│  │  │  │  (Error occurs here)    │  │  │  │
│  │  │  └─────────────────────────┘  │  │  │
│  │  └───────────────────────────────┘  │  │
│  └─────────────────────────────────────┘  │
│                    │                       │
│                    ↓                       │
│           Error caught by Boundary         │
│                    │                       │
│                    ↓                       │
│           Fallback UI rendered             │
│                    │                       │
│                    ↓                       │
│           Error logged to console          │
└─────────────────────────────────────────────┘
```

## Performance-Optimierungen Visualisierung

### Vorher (Nicht optimiert)
```
User Interaction
       ↓
Component Re-render
       ├→ Alle Child-Components re-rendern
       ├→ Styles neu berechnen
       ├→ Theme neu laden
       ├→ Callbacks neu erstellen
       └→ Langsam ❌
```

### Nachher (Optimiert)
```
User Interaction
       ↓
Component Re-render
       ├→ React.memo verhindert unnötige Child-Re-renders ✓
       ├→ useMemo cached Styles ✓
       ├→ useMemo cached Theme ✓
       ├→ useCallback stabilisiert Callbacks ✓
       └→ Schnell ✅
```

## Sicherheits-Layer

```
┌─────────────────────────────────────────────────────────┐
│                    User Input                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend Validation Layer                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  - validateNotEmpty()                          │    │
│  │  - validateStringLength()                      │    │
│  │  - validateId()                                │    │
│  │  - sanitizeString()                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SQL Injection Prevention                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  - Parametrisierte Queries                     │    │
│  │  - validateNoSqlInjection()                    │    │
│  │  - Escaped LIKE patterns                       │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Tauri Backend                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  - Content Security Policy (CSP)               │    │
│  │  - Minimal Permissions                         │    │
│  │  - Secure IPC                                  │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  SQLite Database                        │
│  (Lokaler, sicherer Zugriff)                           │
└─────────────────────────────────────────────────────────┘
```

## Build & Deployment Flow

```
┌─────────────────────┐
│  Source Code (TS)   │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  TypeScript Check   │
│  (Strict Mode)      │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   ESLint Check      │
│  (Code Quality)     │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Vite Build        │
│  - Tree Shaking     │
│  - Minification     │
│  - Code Splitting   │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Tauri Build       │
│  - Rust Compile     │
│  - Native Bundle    │
│  - Platform Pkg     │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Distributable      │
│  - Windows (exe)    │
│  - macOS (dmg)      │
│  - Linux (AppImage) │
└─────────────────────┘
```

## Zukunftige Erweiterungen

### Vector Search Integration (Geplant)
```
┌──────────────────────────────────────┐
│         User Query (Text)            │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│      AI Service (nomic-embed)        │
│   Text → 768D Vector Embedding       │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│    Database: Vector Similarity       │
│   Cosine Similarity Berechnung       │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│    Ranked Results (by similarity)    │
│    Threshold: 0.5 (configurable)     │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│    UI: Search Results Display        │
└──────────────────────────────────────┘
```

### Plugin System (Konzept)
```
┌─────────────────────────────────────────┐
│           Plugin Registry               │
│  ┌─────────────────────────────────┐   │
│  │  - Document Processors          │   │
│  │  - AI Models                    │   │
│  │  - Export Formats               │   │
│  │  - Custom UI Components         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Plugin Loader (Dynamic)         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Integration in Service Layer       │
└─────────────────────────────────────────┘
```

## Monitoring & Debugging

```
┌─────────────────────────────────────────┐
│           Application Events            │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Error Logger  │       │ Info Logger   │
│ - Errors      │       │ - Init        │
│ - Stack       │       │ - Operations  │
│ - Context     │       │ - Success     │
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
┌─────────────────────────────────────────┐
│         Console Output (Dev)            │
│         File Logging (Prod, optional)   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Developer Tools / Monitoring     │
│  - React DevTools                       │
│  - Tauri DevTools                       │
│  - Performance Profiler                 │
└─────────────────────────────────────────┘
```

## Zusammenfassung

Diese Visualisierung zeigt:
- ✅ Klare Trennung der Verantwortlichkeiten (Separation of Concerns)
- ✅ Robuste Error-Handling-Mechanismen auf allen Ebenen
- ✅ Optimierte Performance durch Memoization und React.memo
- ✅ Sicherheit auf mehreren Ebenen (Validation, Sanitization, CSP)
- ✅ Skalierbare Architektur für zukünftige Features
- ✅ Gut dokumentierte Datenflüsse und Interaktionen

Das System ist bereit für Production-Deployment und weitere Feature-Entwicklung! 🚀
