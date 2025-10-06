# SD Private AI - Installation & Setup

## Voraussetzungen

Stellen Sie sicher, dass folgende Software installiert ist:

- **Node.js** (≥ 18.x) - [Download](https://nodejs.org/)
- **Rust** - [Installation](https://www.rust-lang.org/tools/install)
- **npm** oder **pnpm**
- **Syncfusion Lizenzschlüssel** (für produktive Nutzung)

### Platform-spezifische Voraussetzungen

#### Linux
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### macOS
```bash
xcode-select --install
```

#### Windows
Keine zusätzlichen Abhängigkeiten erforderlich.

## Installation

1. **Repository klonen**
   ```bash
   git clone https://github.com/Achris79/SDPrivateAI.git
   cd SDPrivateAI
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Syncfusion Lizenz konfigurieren** (optional)
   
   Erstellen Sie eine `.env` Datei im Projekt-Root:
   ```
   VITE_SYNCFUSION_LICENSE_KEY=your-license-key-here
   ```

## Entwicklung

### Development Server starten
```bash
npm run tauri:dev
```

Dies startet:
- Vite Development Server (Frontend)
- Tauri Development Window

### Nur Frontend entwickeln
```bash
npm run dev
```

## Build

### Desktop-Build erstellen
```bash
npm run tauri:build
```

Die Build-Artefakte finden Sie unter:
- **Windows**: `src-tauri/target/release/sd-private-ai.exe`
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Linux**: `src-tauri/target/release/bundle/`

### Android (geplant)
```bash
npm run tauri android init
npm run tauri android dev
```

## Projektstruktur

```
SDPrivateAI/
├── src/                          # React Frontend
│   ├── components/               # React Komponenten
│   │   ├── common/              # Wiederverwendbare Komponenten
│   │   ├── layout/              # Layout-Komponenten (Header, Sidebar, etc.)
│   │   └── features/            # Feature-spezifische Komponenten
│   ├── hooks/                    # Custom React Hooks
│   ├── services/                 # Business Logic & Services
│   │   ├── database/            # SQLite Datenzugriff
│   │   ├── i18n/                # Internationalisierung
│   │   └── ai/                  # AI/ML Services
│   ├── types/                    # TypeScript Type Definitions
│   ├── styles/                   # Global Styles & Themes
│   ├── utils/                    # Utility Functions
│   ├── locales/                  # Übersetzungsdateien
│   │   ├── en/                  # Englisch
│   │   └── de/                  # Deutsch
│   ├── App.tsx                   # Main App Component
│   └── main.tsx                  # Entry Point
│
├── src-tauri/                    # Tauri Backend (Rust)
│   ├── src/                     # Rust Source Code
│   ├── icons/                   # App Icons
│   ├── Cargo.toml               # Rust Dependencies
│   └── tauri.conf.json          # Tauri Configuration
│
├── public/                       # Static Assets
├── package.json                  # Node.js Dependencies
├── tsconfig.json                 # TypeScript Configuration
├── vite.config.ts               # Vite Configuration
├── TODO.md                       # Aufgabenliste
└── readme.md                     # Projekt-Dokumentation
```

## Konfiguration

### Datenbank
Die SQLite-Datenbank wird automatisch beim ersten Start erstellt unter:
- **Windows**: `%APPDATA%/sd-private-ai/sd-private-ai.db`
- **macOS**: `~/Library/Application Support/sd-private-ai/sd-private-ai.db`
- **Linux**: `~/.local/share/sd-private-ai/sd-private-ai.db`

### Sprache ändern
Die Standardsprache ist Deutsch. Sie können die Sprache im Header über den Sprach-Toggle ändern.

### Theme (Light/Dark Mode)
Klicken Sie auf den Theme-Button im Header, um zwischen Hell- und Dunkelmodus zu wechseln.

## Nächste Schritte

1. Siehe [TODO.md](./TODO.md) für die vollständige Aufgabenliste
2. Syncfusion Komponenten integrieren
3. Vektor-Datenbank-Lösung implementieren
4. AI-Modelle integrieren

## Troubleshooting

### Build-Fehler
```bash
# Cache leeren und neu installieren
rm -rf node_modules package-lock.json
npm install

# Rust Dependencies aktualisieren
cd src-tauri
cargo clean
cargo build
```

### Datenbank-Fehler
Löschen Sie die Datenbank-Datei und starten Sie die App neu. Eine neue Datenbank wird automatisch erstellt.

## Support

Für Fragen oder Probleme, siehe [TODO.md](./TODO.md) für offene Punkte oder erstellen Sie ein Issue im Repository.
