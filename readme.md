🧠 Offline AI App – Tauri + React + TypeScript + Syncfusion + SQLite

Eine plattformübergreifende Offline-KI-Anwendung, die unter Windows, macOS, Linux und Android läuft.
Die App kombiniert Tauri für native Performance mit React + TypeScript für ein modernes Frontend,
nutzt Syncfusion Components für eine ansprechende Oberfläche und speichert Daten in einer lokalen SQLite-Datenbank mit Vektor-Unterstützung.

🚀 Ziel der Anwendung

Diese App soll es ermöglichen, eigene Dokumente, Texte oder Notizen lokal zu speichern, zu vektorisieren und semantisch zu durchsuchen –
also eine persönliche, offline-fähige KI-Wissensdatenbank ohne Cloud-Abhängigkeit.

🧩 Technologie-Stack
Komponente	Zweck
Tauri	Native Cross-Plattform-App mit sehr kleiner Binary-Größe
React + TypeScript	Modernes, typsicheres UI-Frontend
Syncfusion React Components	Professionelle GUI-Komponenten (DataGrid, Charts, Dialogs, Inputs etc.)
SQLite	Lokale Datenbank für strukturierte Daten
Vektor-Datenbank (lokal)	Speicherung von Embeddings zur semantischen Suche
OpenAI-kompatible Embedding-Modelle (lokal)	Optionale KI-Verarbeitung über z. B. llama.cpp, nomic-embed, transformers.js

🖼️ Features (geplant)

✅ Plattformübergreifend (Windows, macOS, Linux, Android)
✅ Vollständig offline-fähig
✅ Moderne UI mit Syncfusion-Komponenten
✅ Speicherung lokaler Daten in SQLite
✅ Speicherung von Vektoren für semantische Suche
✅ CRUD-Operationen über eine eigene Datenzugriffsschicht
✅ Optionale KI-Modelle lokal ladbar (z. B. über WASM)
✅ Theming + Dark Mode
✅ i18n-Unterstützung (mehrsprachig)

🧰 Voraussetzungen

Node.js (≥ 18.x)
Rust (für Tauri Backend)
npm oder pnpm
Syncfusion Lizenzschlüssel
SQLite3 (wird automatisch eingebunden)
