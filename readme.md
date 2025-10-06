🧠 Offline AI App – Tauri + React + TypeScript + Syncfusion + SQLite

Eine plattformübergreifende Offline-KI-Anwendung, die unter Windows, macOS, Linux und Android läuft.
Die App kombiniert Tauri für native Performance mit React + TypeScript für ein modernes Frontend,
nutzt Syncfusion Components für eine ansprechende Oberfläche und speichert Daten in einer lokalen SQLite-Datenbank mit Vektor-Unterstützung.

## 🚀 Ziel der Anwendung

Diese App soll es ermöglichen, eigene Dokumente, Texte oder Notizen lokal zu speichern, zu vektorisieren und semantisch zu durchsuchen –
also eine persönliche, offline-fähige KI-Wissensdatenbank ohne Cloud-Abhängigkeit.

## 🧩 Technologie-Stack
Komponente	Zweck
Tauri	Native Cross-Plattform-App mit sehr kleiner Binary-Größe
React + TypeScript	Modernes, typsicheres UI-Frontend
Syncfusion React Components	Professionelle GUI-Komponenten (DataGrid, Charts, Dialogs, Inputs etc.)
SQLite	Lokale Datenbank für strukturierte Daten
Vektor-Suche (SQLite + Cosine Similarity)	Semantische Suche mit In-Memory Vector Similarity
nomic-embed-text (768D)	Lokales Embedding-Modell für semantische Vektorisierung

## 🖼️ Features (geplant)

✅ Plattformübergreifend (Windows, macOS, Linux, Android)
✅ Vollständig offline-fähig
✅ Moderne UI mit Syncfusion-Komponenten
✅ Speicherung lokaler Daten in SQLite
✅ Speicherung von Vektoren für semantische Suche
✅ CRUD-Operationen über eine eigene Datenzugriffsschicht
✅ Optionale KI-Modelle lokal ladbar (z. B. über WASM)
✅ Theming + Dark Mode
✅ i18n-Unterstützung (mehrsprachig)

## 🧰 Voraussetzungen

Node.js (≥ 18.x)
Rust (für Tauri Backend)
npm oder pnpm
Syncfusion Lizenzschlüssel
SQLite3 (wird automatisch eingebunden)

## 📚 Dokumentation

Die vollständige Dokumentation findest du in folgenden Dateien:

- **[QUICKSTART.md](./docs/QUICKSTART.md)** - 🚀 Schnellstart-Guide (5 Minuten)
- **[INSTALLATION.md](./docs/INSTALLATION.md)** - 🔧 Detaillierte Installation & Setup
- **[DOCUMENTATION.md](./docs/DOCUMENTATION.md)** - 📖 Vollständige Projekt-Dokumentation
- **[VECTOR_SEARCH.md](./docs/VECTOR_SEARCH.md)** - 🔍 Vector Search & Semantische Suche
- **[ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)** - 🛡️ Fehlerbehandlung & Defensive Programming
- **[SECURITY.md](./docs/SECURITY.md)** - 🔒 Sicherheitsrichtlinien & Best Practices
- **[TODO.md](./docs/TODO.md)** - 📝 Aufgabenliste & offene Fragen
- **[SUMMARY.md](./docs/SUMMARY.md)** - ✅ Projekt-Setup Übersicht

## 🏃 Quick Start

```bash
# 1. Dependencies installieren
npm install

# 2. Development Server starten
npm run dev

# 3. Mit Tauri Desktop (benötigt System-Dependencies)
npm run tauri:dev

# 4. Production Build
npm run build
npm run tauri:build
```

Für detaillierte Anweisungen siehe [QUICKSTART.md](./docs/QUICKSTART.md).

## 📁 Projekt-Struktur

```
SDPrivateAI/
├── src/                    # React Frontend
│   ├── components/        # UI-Komponenten
│   ├── services/          # Business Logic
│   ├── hooks/             # Custom Hooks
│   ├── types/             # TypeScript Types
│   └── locales/           # i18n Übersetzungen
├── src-tauri/             # Rust Backend
└── docs/                  # Dokumentation
```

## 🎯 Aktueller Status

✅ **Grundstruktur erstellt**
- Tauri + React + TypeScript Setup
- i18n (DE/EN)
- Theme-System (Light/Dark)
- Datenbank-Layer mit vollständigen CRUD-Operationen
- SQLite mit Performance-Indizes
- Typsichere TypeScript-API
- Layout-Komponenten

✅ **Sicherheit & Fehlerbehandlung**
- Custom Error Classes für typsichere Fehlerbehandlung
- Defensive Input-Validierung auf allen APIs
- SQL-Injection-Prävention durch parametrisierte Queries
- XSS-Schutz durch Input-Sanitisierung
- DoS-Prävention durch Größenlimits
- Strukturiertes Error-Logging mit Context

✅ **Vector Search & Semantische Suche** 🆕
- nomic-embed-text Modell konfiguriert (768 Dimensionen)
- SQLite-basierte Vector-Datenbank
- Cosine Similarity für Vector Search
- `searchSimilarEmbeddings()` API
- `semanticSearch()` für semantische Dokumentensuche
- Vollständige Dokumentation in [VECTOR_SEARCH.md](./docs/VECTOR_SEARCH.md)

## 💾 Datenbank-Features

Die App bietet eine **lokale, schnelle SQLite-Datenbankanbindung** mit:

- ✅ **Sicher** - SQL-Injection-Prävention, Input-Validierung
- ✅ **Robust** - Umfassende Fehlerbehandlung und Logging
- ✅ **Minimal Dependencies** - Nur Tauri SQL Plugin
- ✅ **Einfach zu implementieren** - Intuitive TypeScript-API
- ✅ **Wartbar** - Saubere Code-Struktur mit Custom Error Classes
- ✅ **Performant** - Automatische Indizierung
- ✅ **Offline-fähig** - 100% lokal, keine Cloud

**CRUD-Operationen für:**
- Dokumente (erstellen, lesen, aktualisieren, löschen, suchen)
- Embeddings (Vektoren für semantische Suche)
- Metadaten (flexible JSON-Speicherung)

**Sicherheitsfeatures:**
- Parametrisierte Queries gegen SQL-Injection
- Input-Sanitisierung gegen XSS
- Größenlimits gegen DoS
- Defensive Validierung aller Eingaben

Siehe [Database README](./docs/database.md) und [ERROR_HANDLING.md](./docs/ERROR_HANDLING.md) für Details.

📋 **Nächste Schritte**
- Syncfusion-Integration
- Vektor-DB Implementation
- AI-Modell-Integration
- Feature-Entwicklung

Siehe [TODO.md](./docs/TODO.md) für Details.

## 🤝 Contributing

Für Beiträge und Entwicklung siehe [DOCUMENTATION.md](./docs/DOCUMENTATION.md).

## 📄 Lizenz

MIT
