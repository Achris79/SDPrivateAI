# Quick Start Guide - SDPrivateAI

## 🚀 Schnellstart (5 Minuten)

### 1. Dependencies installieren
```bash
npm install
```

### 2. Entwicklungsserver starten
```bash
# Nur Frontend (im Browser)
npm run dev

# Mit Tauri Desktop Window (benötigt System-Dependencies)
npm run tauri:dev
```

### 3. Build erstellen
```bash
npm run build
```

## 📁 Wichtigste Dateien

### Für UI-Entwicklung
- `src/App.tsx` - Haupt-App-Komponente
- `src/components/layout/` - Layout-Komponenten
- `src/styles/theme.ts` - Theme-Definitionen

### Für Backend-Integration
- `src/services/database/index.ts` - Datenbank-Zugriff
- `src-tauri/src/lib.rs` - Rust Backend

### Für Internationalisierung
- `src/services/i18n/config.ts` - i18n-Config
- `src/locales/de/translation.json` - Deutsche Übersetzungen
- `src/locales/en/translation.json` - Englische Übersetzungen

### Konfiguration
- `.env` - Umgebungsvariablen (basierend auf `.env.example`)
- `package.json` - NPM Dependencies
- `src-tauri/Cargo.toml` - Rust Dependencies

## 🎯 Häufige Aufgaben

### Neue Komponente hinzufügen
```typescript
// src/components/features/MeineKomponente.tsx
import React from 'react';

const MeineKomponente: React.FC = () => {
  return <div>Meine Komponente</div>;
};

export default MeineKomponente;
```

### Übersetzung hinzufügen
```typescript
// In src/services/i18n/config.ts
const translationDE = {
  // ... existing translations
  mySection: {
    title: 'Mein Titel',
    description: 'Meine Beschreibung'
  }
};

// In Komponente verwenden
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('mySection.title')}</h1>;
};
```

### Datenbank-Abfrage
```typescript
import { getDatabase } from './services/database';

const db = getDatabase();
const results = await db.select('SELECT * FROM documents');
```

### Theme verwenden
```typescript
import { useTheme } from './hooks/useTheme';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div style={{ color: theme.colors.text }}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### Neue Route/Seite hinzufügen
```typescript
// 1. Komponente erstellen in src/components/features/
// 2. In src/components/layout/Sidebar.tsx Navigation hinzufügen
// 3. In src/App.tsx Route-Logik implementieren
```

## 🔧 Troubleshooting

### Problem: npm install schlägt fehl
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Tauri build schlägt fehl (Linux)
```bash
# System-Dependencies installieren
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### Problem: TypeScript-Fehler
```bash
npm run build  # Prüft alle TypeScript-Fehler
```

### Problem: Datenbank-Fehler
```bash
# Datenbank-Datei löschen (wird neu erstellt)
# Location siehe INSTALLATION.md
```

## 📚 Weitere Dokumentation

- **[INSTALLATION.md](./INSTALLATION.md)** - Detaillierte Setup-Anleitung
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Vollständige Projekt-Dokumentation
- **[TODO.md](./TODO.md)** - Aufgaben und offene Fragen
- **[SUMMARY.md](./SUMMARY.md)** - Projekt-Übersicht

## 🎨 Syncfusion Setup

### 1. Lizenz erhalten
- Registrieren auf [syncfusion.com](https://www.syncfusion.com/)
- Community-Lizenz oder Commercial-Lizenz

### 2. Lizenz konfigurieren
```bash
# .env Datei erstellen
cp .env.example .env

# Lizenz-Key eintragen
VITE_SYNCFUSION_LICENSE_KEY=your-license-key-here
```

### 3. Lizenz registrieren

**✅ Bereits implementiert in `src/main.tsx`**

Die Lizenz wird automatisch beim App-Start registriert, wenn ein gültiger Schlüssel in `.env` hinterlegt ist:

```typescript
// Siehe src/main.tsx
import { registerLicense } from '@syncfusion/ej2-base';

const licenseKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY;
if (licenseKey) {
  registerLicense(licenseKey);
}
```

### 4. Komponente verwenden
```typescript
import { GridComponent } from '@syncfusion/ej2-react-grids';

const MyGrid = () => {
  return <GridComponent dataSource={data} />;
};
```

## 🔥 Nächste Schritte

1. ✅ Projekt-Setup abgeschlossen
2. 📝 Siehe [TODO.md](./TODO.md) für die komplette Aufgabenliste
3. 🎨 Syncfusion-Komponenten integrieren
4. 💾 Datenbank-Schema erweitern
5. 🤖 AI-Features implementieren

## 💡 Tipps

- **Hot Reload**: Änderungen werden automatisch neu geladen
- **TypeScript**: Nutze IntelliSense in VSCode
- **Debugging**: Browser DevTools für Frontend, Rust debugger für Backend
- **Testing**: Test-Framework noch nicht eingerichtet (siehe TODO.md)

## 🆘 Support

Bei Fragen:
1. Prüfe [DOCUMENTATION.md](./DOCUMENTATION.md)
2. Prüfe [TODO.md](./TODO.md) für bekannte Issues
3. Erstelle ein Issue im Repository
