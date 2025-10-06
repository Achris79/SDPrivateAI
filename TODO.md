# TODO Liste - SDPrivateAI

## ⚠️ Wichtige Hinweise

### System-Abhängigkeiten (Linux)
Auf Linux-Systemen müssen die folgenden System-Pakete installiert sein, damit Tauri kompiliert werden kann:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

Siehe [INSTALLATION.md](./INSTALLATION.md) für detaillierte Installationsanweisungen.

## Offene Fragen / Klärungsbedarf

### Syncfusion Lizenzierung
- [ ] Syncfusion Lizenzschlüssel erhalten/konfigurieren
- [ ] Lizenzschlüssel in Umgebungsvariablen oder Config-Datei speichern
- [ ] Lizenz-Registrierung beim App-Start implementieren

### Vektor-Datenbank
- [ ] Welche Vektor-DB-Lösung soll verwendet werden?
  - Option 1: SQLite mit sqlite-vss Extension
  - Option 2: Separate Vektor-DB wie Qdrant (embedded mode)
  - Option 3: Custom-Implementierung mit HNSW in SQLite
- [ ] Embedding-Modell-Auswahl definieren
  - nomic-embed-text?
  - all-MiniLM-L6-v2?
  - Eigenes Modell?

### AI/ML Integration
- [ ] Wie sollen die AI-Modelle geladen werden?
  - Via WASM?
  - Via native Bindings (llama.cpp)?
  - ONNX Runtime?
- [ ] Welche Modelle sollen unterstützt werden?
- [ ] Wo werden Modelle gespeichert (lokaler Cache)?
- [ ] Modell-Update-Mechanismus definieren

### Datenbank-Schema
- [ ] SQLite-Schema für Dokumente definieren
- [ ] Schema für Metadaten festlegen
- [ ] Migrations-Strategie definieren
- [ ] Backup-Strategie festlegen

### Android-Support
- [ ] Android-spezifische Konfiguration prüfen
- [ ] Datei-Zugriff-Permissions für Android
- [ ] SQLite-Integration auf Android testen
- [ ] Storage-Location für Android definieren

## Implementierungs-Aufgaben

### Phase 1: Basis-Setup (Grundstruktur)
- [x] Tauri-Projekt mit React + TypeScript initialisieren
- [x] Basis-Ordnerstruktur erstellen
- [ ] Dependencies installieren
- [ ] Basis-Konfigurationen testen

### Phase 2: UI-Framework
- [ ] Syncfusion Components integrieren
- [ ] Lizenz-Key konfigurieren
- [ ] Theme-System aufbauen (Light/Dark Mode)
- [ ] Basis-Layout-Komponenten erstellen
  - [ ] Header/Navigation
  - [ ] Sidebar
  - [ ] Main Content Area
  - [ ] Footer

### Phase 3: i18n-Unterstützung
- [ ] i18next konfigurieren
- [ ] Sprachdateien anlegen (DE, EN)
- [ ] Language-Switcher Component
- [ ] Alle UI-Texte internationalisierbar machen

### Phase 4: Datenbank-Integration
- [ ] Tauri SQL Plugin konfigurieren
- [ ] SQLite-Datei-Struktur definieren
- [ ] Migrations-System einrichten
- [ ] Data Access Layer (DAL) implementieren
  - [ ] CRUD für Dokumente
  - [ ] CRUD für Metadaten
  - [ ] Vektor-Operationen

### Phase 5: Vektor-Suche
- [ ] Vektor-DB-Lösung implementieren
- [ ] Embedding-Funktionen integrieren
- [ ] Semantic Search API
- [ ] Search UI-Komponente

### Phase 6: AI-Integration
- [ ] Embedding-Modell lokal laden
- [ ] Embedding-Service implementieren
- [ ] Optional: Text-Generation-Modell integrieren
- [ ] Model-Management UI

### Phase 7: Features
- [ ] Dokument-Upload-Funktion
- [ ] Text-Editor/Viewer
- [ ] Vektor-basierte Suche
- [ ] Ergebnis-Visualisierung
- [ ] Export-Funktionen

### Phase 8: Testing & Optimierung
- [ ] Unit-Tests für Core-Logik
- [ ] Integration-Tests für DB
- [ ] E2E-Tests für kritische Pfade
- [ ] Performance-Optimierung
- [ ] Memory-Management prüfen

### Phase 9: Documentation
- [ ] API-Dokumentation
- [ ] Benutzer-Handbuch
- [ ] Developer-Guide
- [ ] Setup-Anleitung erweitern

### Phase 10: Deployment
- [ ] Build-Prozess für Windows
- [ ] Build-Prozess für macOS
- [ ] Build-Prozess für Linux
- [ ] Build-Prozess für Android
- [ ] Release-Workflow einrichten
- [ ] Auto-Update-Mechanismus (optional)

## Best Practices zu beachten

### Code-Qualität
- [ ] ESLint-Konfiguration hinzufügen
- [ ] Prettier für Code-Formatierung
- [ ] TypeScript strict mode aktivieren
- [ ] Pre-commit hooks (husky)

### Sicherheit
- [ ] Input-Validierung
- [ ] XSS-Schutz
- [ ] Sichere Datenspeicherung
- [ ] Permissions-Management

### Performance
- [ ] Code-Splitting implementieren
- [ ] Lazy-Loading für Komponenten
- [ ] Memoization wo sinnvoll
- [ ] Effiziente DB-Queries

### Accessibility
- [ ] ARIA-Labels
- [ ] Keyboard-Navigation
- [ ] Screen-Reader-Support
- [ ] Kontrast-Verhältnisse

## Offene Fragen für User-Feedback
1. Welche Sprachen sollen initial unterstützt werden (außer DE/EN)?
2. Welche Dokumentenformate sollen unterstützt werden (TXT, PDF, MD, DOCX)?
3. Maximale Größe für Dokumente?
4. Soll es eine Cloud-Sync-Option geben (optional, zusätzlich zu offline)?
5. Werden bestimmte Syncfusion-Komponenten bevorzugt?
6. Gibt es Design-Vorgaben oder Mockups?
