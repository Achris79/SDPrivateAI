# SDPrivateAI - Projektdokumentation

## Überblick

SDPrivateAI ist eine offline-fähige, plattformübergreifende KI-Anwendung für die Verwaltung und semantische Suche von persönlichen Dokumenten. Die Anwendung kombiniert moderne Web-Technologien mit nativen Desktop-Features.

## Technologie-Stack

### Frontend
- **React 19** - UI-Framework
- **TypeScript** - Typsicherheit und bessere Developer Experience
- **Vite** - Schneller Build-Tool und Dev-Server
- **Syncfusion Components** - Professionelle UI-Komponenten
- **i18next** - Internationalisierung (DE/EN)

### Backend
- **Tauri** - Native Desktop-App-Framework in Rust
- **SQLite** - Lokale Datenbank für strukturierte Daten und Vektorspeicherung
- **tauri-plugin-sql** - SQLite-Integration für Tauri
- **Vector Search** - Cosine Similarity für semantische Suche

### AI/ML
- **nomic-embed-text** - Embedding-Modell (768 Dimensionen)
- **Cosine Similarity** - In-Memory Vector Search

### Geplante Erweiterungen
- AI/ML-Modell-Integration (transformers.js, ONNX Runtime Web)
- Android-Unterstützung

## Projektstruktur

```
SDPrivateAI/
│
├── src/                              # React Frontend
│   │
│   ├── components/                   # React Komponenten
│   │   ├── common/                  # Wiederverwendbare UI-Komponenten
│   │   ├── layout/                  # Layout-Komponenten
│   │   │   ├── Header.tsx          # App-Header mit Sprach-/Theme-Toggle
│   │   │   ├── Sidebar.tsx         # Navigation Sidebar
│   │   │   └── MainLayout.tsx      # Haupt-Layout-Wrapper
│   │   └── features/                # Feature-spezifische Komponenten
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   └── useTheme.ts              # Theme-Management Hook
│   │
│   ├── services/                     # Business Logic & Services
│   │   ├── database/                # SQLite Datenzugriff
│   │   │   └── index.ts            # DB-Initialisierung und CRUD
│   │   ├── i18n/                    # Internationalisierung
│   │   │   └── config.ts           # i18next Konfiguration
│   │   └── ai/                      # AI/ML Services (geplant)
│   │       └── index.ts            # Embedding-Funktionen (Placeholder)
│   │
│   ├── types/                        # TypeScript Type Definitions
│   │   └── index.ts                 # Zentrale Type-Definitionen
│   │
│   ├── styles/                       # Styling
│   │   ├── global.css               # Globale Styles
│   │   └── theme.ts                 # Theme-Definitionen (Light/Dark)
│   │
│   ├── utils/                        # Utility Functions
│   │   └── index.ts                 # Helper-Funktionen
│   │
│   ├── locales/                      # Übersetzungsdateien
│   │   ├── en/                      # Englisch
│   │   │   └── translation.json
│   │   └── de/                      # Deutsch
│   │       └── translation.json
│   │
│   ├── App.tsx                       # Haupt-App-Komponente
│   └── main.tsx                      # Entry Point
│
├── src-tauri/                        # Tauri Backend (Rust)
│   ├── src/
│   │   ├── main.rs                  # Tauri Entry Point
│   │   └── lib.rs                   # Core Tauri Logic
│   ├── Cargo.toml                    # Rust Dependencies
│   └── tauri.conf.json              # Tauri Konfiguration
│
├── public/                           # Statische Assets
│
├── package.json                      # Node.js Dependencies
├── tsconfig.json                     # TypeScript Konfiguration
├── vite.config.ts                   # Vite Build-Konfiguration
├── .env.example                      # Beispiel Umgebungsvariablen
├── .gitignore                        # Git Ignore-Regeln
├── .prettierrc                       # Code-Formatierung
│
├── TODO.md                           # Aufgabenliste und offene Fragen
├── INSTALLATION.md                   # Installations-Anleitung
├── ERROR_HANDLING.md                 # Fehlerbehandlung & Defensive Programming
├── SECURITY.md                       # Sicherheitsrichtlinien & Best Practices
├── VECTOR_SEARCH.md                  # Vector Search & Semantische Suche
└── readme.md                         # Projekt-Readme

```

## Kernfunktionalität (aktuell implementiert)

### 1. Basis-Layout
- **Header**: Zeigt App-Titel und bietet Sprach-/Theme-Toggle
- **Sidebar**: Navigation zu verschiedenen Bereichen
- **MainLayout**: Wrapper für konsistentes Layout

### 2. Internationalisierung (i18n)
- Unterstützung für Deutsch und Englisch
- Einfache Erweiterung um weitere Sprachen
- Sprachumschaltung zur Laufzeit

### 3. Theme-System
- Light und Dark Mode
- Persistierung der Theme-Auswahl
- Zentrale Theme-Definitionen

### 4. Datenbank-Setup
- SQLite-Integration mit umfassender Fehlerbehandlung
- Basis-Schema für Dokumente und Embeddings
- CRUD-Operationen mit Input-Validierung
- SQL-Injection-Schutz durch parametrisierte Queries
- XSS-Prävention durch Input-Sanitisierung

### 5. Fehlerbehandlungssystem
- Custom Error Classes (DatabaseError, ValidationError, AIError, etc.)
- Defensive Input-Validierung auf allen Public APIs
- Strukturiertes Error-Logging mit Context
- Security-fokussierte Validatoren

### 6. TypeScript-Typsystem
- Zentrale Type-Definitionen
- Type-Safety für Dokumente, Embeddings, Settings

## Wichtige Dateien

### Frontend

#### `src/App.tsx`
Haupt-App-Komponente, die das Layout initialisiert und Theme/i18n verwaltet.

#### `src/services/database/index.ts`
Datenbank-Service mit:
- `initDatabase()` - DB-Initialisierung mit Error Handling
- `getDatabase()` - DB-Zugriff
- Tabellen-Erstellung für Dokumente und Embeddings
- CRUD-Operationen mit umfassender Validierung
- SQL-Injection-Schutz
- Input-Sanitisierung

#### `src/errors/index.ts`
Fehlerbehandlungssystem:
- Custom Error Classes (AppError, DatabaseError, ValidationError, etc.)
- ErrorLogger für strukturiertes Logging
- Context-basierte Fehlerinformationen

#### `src/utils/validation.ts`
Validierungs-Utilities:
- Input-Validierung (Strings, Numbers, Arrays)
- Security-Validatoren (SQL-Injection, XSS-Prevention)
- Safe Parsing Utilities

#### `src/services/i18n/config.ts`
i18next-Konfiguration mit DE/EN Übersetzungen.

#### `src/hooks/useTheme.ts`
Custom Hook für Theme-Management (Light/Dark Mode).

#### `src/types/index.ts`
Zentrale TypeScript-Typen:
- `Document` - Dokument-Struktur
- `VectorEmbedding` - Vektor-Embedding für Suche
- `AppSettings` - App-Einstellungen

### Backend

#### `src-tauri/src/lib.rs`
Tauri Core-Logik mit:
- Plugin-Registrierung (SQL, Opener)
- Tauri-Commands (erweiterbar)

#### `src-tauri/Cargo.toml`
Rust-Dependencies:
- tauri (Core)
- tauri-plugin-sql (SQLite)
- serde (JSON-Serialisierung)

## Entwicklungs-Workflow

### 1. Setup
```bash
npm install
```

### 2. Development
```bash
npm run dev          # Nur Frontend
npm run tauri:dev    # Frontend + Tauri Window
```

### 3. Build
```bash
npm run build        # Frontend build
npm run tauri:build  # Native App build
```

### 4. Code-Qualität
```bash
npm run lint         # (noch zu konfigurieren)
npm run format       # (noch zu konfigurieren)
```

## Nächste Schritte

Siehe [TODO.md](./TODO.md) für die vollständige Liste der geplanten Features und Aufgaben.

### Kurzfristig (Phase 1-2)
1. Syncfusion-Lizenz konfigurieren
2. Syncfusion-Komponenten integrieren
3. Basis-UI-Komponenten erweitern

### Mittelfristig (Phase 3-5)
1. Dokument-Management implementieren
2. Vektor-DB-Lösung integrieren
3. Embedding-Service aufbauen

### Langfristig (Phase 6-10)
1. AI-Modelle integrieren
2. Erweiterte Such-Features
3. Android-Support
4. Testing & Optimierung

## Best Practices

### Sicherheit & Fehlerbehandlung
- **Defensive Programmierung**: Alle Eingaben validieren
- **Input Sanitization**: XSS und SQL-Injection Prevention
- **Type Safety**: TypeScript strict mode aktiviert
- **Custom Error Classes**: Strukturierte Fehlerbehandlung
- **Logging**: Umfassendes Error-Logging mit Context

Siehe [ERROR_HANDLING.md](./ERROR_HANDLING.md) und [SECURITY.md](./SECURITY.md) für Details.

### Code-Organisation
- Komponenten nach Features gruppieren
- Services für Business-Logik verwenden
- Types zentral definieren
- Utils für wiederverwendbare Funktionen

### TypeScript
- Strict Mode aktiviert
- Explizite Types für alle Exports
- Interfaces für Datenstrukturen

### Styling
- Theme-basiertes Styling
- Zentrale Theme-Definitionen
- Responsive Design

### Datenbank
- Migrations für Schema-Änderungen
- Transaktionen für atomare Operationen
- Indizes für Performance

## Konfiguration

### Umgebungsvariablen
Erstellen Sie eine `.env` Datei basierend auf `.env.example`:
```env
VITE_SYNCFUSION_LICENSE_KEY=your-license-key
VITE_DEFAULT_LANGUAGE=de
```

### Tauri-Konfiguration
Siehe `src-tauri/tauri.conf.json` für:
- App-Metadaten
- Window-Einstellungen
- Build-Optionen
- Permissions

## Lizenz

MIT (siehe package.json)

## Support

Bei Fragen oder Problemen:
1. Siehe [INSTALLATION.md](./INSTALLATION.md) für Setup-Hilfe
2. Siehe [TODO.md](./TODO.md) für bekannte offene Punkte
3. Erstellen Sie ein Issue im Repository
