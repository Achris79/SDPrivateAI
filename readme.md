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
Vektor-Datenbank (lokal)	Speicherung von Embeddings zur semantischen Suche
OpenAI-kompatible Embedding-Modelle (lokal)	Optionale KI-Verarbeitung über z. B. llama.cpp, nomic-embed, transformers.js

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

- **[QUICKSTART.md](./QUICKSTART.md)** - 🚀 Schnellstart-Guide (5 Minuten)
- **[INSTALLATION.md](./INSTALLATION.md)** - 🔧 Detaillierte Installation & Setup
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - 📖 Vollständige Projekt-Dokumentation
- **[TODO.md](./TODO.md)** - 📝 Aufgabenliste & offene Fragen
- **[SUMMARY.md](./SUMMARY.md)** - ✅ Projekt-Setup Übersicht

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

Für detaillierte Anweisungen siehe [QUICKSTART.md](./QUICKSTART.md).

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
- Datenbank-Layer
- Layout-Komponenten

📋 **Nächste Schritte**
- Syncfusion-Integration
- Vektor-DB Implementation
- AI-Modell-Integration
- Feature-Entwicklung

Siehe [TODO.md](./TODO.md) für Details.

## 🤝 Contributing

Für Beiträge und Entwicklung siehe [DOCUMENTATION.md](./DOCUMENTATION.md).

## 📄 Lizenz

MIT
