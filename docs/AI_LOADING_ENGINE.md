# AI Loading Engine Architecture

## Übersicht

Die SDPrivateAI App verwendet eine mehrstufige Lade-Engine-Architektur für AI/ML-Modelle mit ONNX Runtime als primärer Engine und WASM (transformers.js) als Fallback.

## Architektur

```
┌─────────────────────────────────────────┐
│         AI Service (index.ts)           │
│  - generateEmbedding()                  │
│  - initializeAI()                       │
│  - getCurrentEngine()                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Loading Engine Manager               │
│  - Auto-Detection                       │
│  - Primary/Fallback Strategy            │
│  - Resource Management                  │
└────────────┬───────────────┬────────────┘
             │               │
             ▼               ▼
┌────────────────┐  ┌────────────────────┐
│  ONNX Loader   │  │   WASM Loader      │
│  (Primary)     │  │   (Fallback)       │
│                │  │                    │
│ - ONNX Runtime │  │ - transformers.js  │
│ - WebGL/WASM   │  │ - Pure WASM        │
│ - Optimized    │  │ - Compatible       │
└────────────────┘  └────────────────────┘
```

## Komponenten

### 1. Loading Engine Manager

**Zweck:** Zentrale Verwaltung der Lade-Engines mit automatischer Auswahl und Fallback-Logik.

**Features:**
- Automatische Engine-Erkennung
- Intelligente Primär/Fallback-Strategie
- Singleton-Pattern für globalen Zugriff
- Resource-Lifecycle-Management

**Strategien:**

```typescript
export enum EngineStrategy {
  AUTO = 'auto',           // ONNX primär, WASM fallback
  ONNX_ONLY = 'onnx-only', // Nur ONNX verwenden
  WASM_ONLY = 'wasm-only', // Nur WASM verwenden
}
```

### 2. ONNX Loader (Primary)

**Vorteile:**
- ✅ Beste Performance durch WebGL-Beschleunigung
- ✅ Optimierte Inferenz mit Graph-Optimierungen
- ✅ Native ONNX-Modell-Unterstützung
- ✅ Multi-Threading über Web Workers möglich

**Execution Providers:**
1. **WebGL** (bevorzugt) - GPU-beschleunigt
2. **WASM** (Fallback) - CPU-optimiert

**Konfiguration:**

```typescript
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;

const session = await ort.InferenceSession.create(modelPath, {
  executionProviders: ['webgl', 'wasm'],
  graphOptimizationLevel: 'all',
});
```

**Limitierungen:**
- Benötigt ONNX-Modell-Datei (muss bereitgestellt werden)
- Größere Bundle-Größe (~23 MB WASM Runtime)

### 3. WASM Loader (Fallback)

**Vorteile:**
- ✅ Automatischer Modell-Download und Caching
- ✅ Out-of-the-box nomic-embed-text Unterstützung
- ✅ Keine manuelle Modell-Verwaltung nötig
- ✅ Breite Modell-Kompatibilität

**Konfiguration:**

```typescript
env.allowLocalModels = false;
env.useBrowserCache = true;

const extractor = await pipeline(
  'feature-extraction',
  'nomic-ai/nomic-embed-text-v1.5',
  { quantized: true }
);
```

**Features:**
- Automatisches Caching von Modellen
- Quantisierung für bessere Performance
- Mean pooling und Normalisierung

## Verwendung

### Basis-Verwendung (Auto-Modus)

```typescript
import { generateEmbedding, initializeAI } from './services/ai';

// Optional: Explizite Initialisierung
await initializeAI();

// Embedding generieren (auto-initialisiert wenn nötig)
const result = await generateEmbedding('Mein Text');
console.log(result.vector.length); // 768
console.log(result.dimensionality); // 768
```

### Konfigurierte Initialisierung

```typescript
import { initializeAI, EngineStrategy } from './services/ai';

// Mit ONNX-Modell (Primary)
await initializeAI({
  modelPath: '/models/nomic-embed-text.onnx',
  modelName: 'nomic-embed-text',
  dimension: 768,
  strategy: EngineStrategy.AUTO, // ONNX primär, WASM fallback
});

// Nur WASM verwenden (kein lokales Modell nötig)
await initializeAI({
  modelName: 'nomic-ai/nomic-embed-text-v1.5',
  dimension: 768,
  strategy: EngineStrategy.WASM_ONLY,
});

// Nur ONNX verwenden (wirft Fehler wenn nicht verfügbar)
await initializeAI({
  modelPath: '/models/nomic-embed-text.onnx',
  dimension: 768,
  strategy: EngineStrategy.ONNX_ONLY,
});
```

### Engine-Status prüfen

```typescript
import { getCurrentEngine, LoadingEngineType } from './services/ai';

const engine = getCurrentEngine();

if (engine === LoadingEngineType.ONNX) {
  console.log('Using optimized ONNX Runtime');
} else if (engine === LoadingEngineType.WASM) {
  console.log('Using WASM fallback');
}
```

### Resource-Cleanup

```typescript
import { disposeAI } from './services/ai';

// Beim App-Shutdown
await disposeAI();
```

## Automatischer Fallback

Die Engine wählt automatisch die beste verfügbare Option:

```
1. Prüfe ONNX-Verfügbarkeit
   ├─ Ja → Initialisiere ONNX Loader
   └─ Nein → Weiter zu Schritt 2

2. Prüfe WASM-Verfügbarkeit
   ├─ Ja → Initialisiere WASM Loader
   └─ Nein → Fehler werfen
```

**Fallback-Gründe:**
- Kein ONNX-Modell-Pfad angegeben
- ONNX Runtime nicht verfügbar
- ONNX-Initialisierung fehlgeschlagen
- WebAssembly nicht unterstützt (sehr selten)

## Performance-Vergleich

| Engine | Initalisierung | Inferenz (768D) | Bundle-Größe | GPU-Beschleunigung |
|--------|----------------|-----------------|--------------|-------------------|
| ONNX (WebGL) | ~2-3s | ~50-100ms | ~23 MB | ✅ Ja |
| ONNX (WASM) | ~2-3s | ~100-200ms | ~23 MB | ❌ Nein |
| WASM (transformers.js) | ~5-10s* | ~150-300ms | ~5 MB | ❌ Nein |

*Erste Initialisierung mit Modell-Download kann länger dauern (wird gecached)

## Best Practices

### 1. Frühe Initialisierung

Initialisieren Sie den AI Service früh im App-Lifecycle:

```typescript
// In App.tsx oder main.tsx
useEffect(() => {
  initializeAI().catch(console.error);
}, []);
```

### 2. Fehlerbehandlung

Behandeln Sie Engine-Fehler gracefully:

```typescript
try {
  await initializeAI({
    modelPath: '/models/nomic-embed.onnx',
    strategy: EngineStrategy.AUTO,
  });
} catch (error) {
  console.error('AI initialization failed:', error);
  // App bleibt funktionsfähig, Embedding-Features deaktiviert
}
```

### 3. Lazy Loading für Modelle

Nutzen Sie Code-Splitting für große Modelle:

```typescript
// Dynamischer Import
const loadModel = async () => {
  const { initializeAI } = await import('./services/ai');
  await initializeAI();
};
```

### 4. Progress Feedback

Informieren Sie User über Modell-Downloads:

```typescript
import { env } from '@xenova/transformers';

// Progress-Callback (nur WASM)
env.onnx.wasm.proxy = true;
```

## Troubleshooting

### ONNX Loader initialisiert nicht

**Problem:** ONNX Runtime wirft Fehler oder lädt nicht

**Lösungen:**
1. Überprüfen Sie Modell-Pfad: Muss korrekt sein
2. Überprüfen Sie Modell-Format: Muss ONNX (.onnx) sein
3. Browser-Kompatibilität: WebGL verfügbar?
4. Lassen Sie automatisch auf WASM fallen

### WASM Loader langsam beim ersten Start

**Problem:** Erste Embedding-Generierung dauert sehr lange

**Erklärung:** transformers.js lädt Modell vom CDN (nur beim ersten Mal)

**Lösungen:**
1. Pre-cache Modell bei App-Installation
2. Zeigen Sie Loading-Indikator
3. Verwenden Sie quantisierte Modelle (`quantized: true`)

### Speicher-Probleme

**Problem:** Browser läuft aus Speicher

**Lösungen:**
1. Verwenden Sie quantisierte Modelle
2. Rufen Sie `disposeAI()` auf wenn nicht gebraucht
3. Limitieren Sie Batch-Größe bei vielen Embeddings

## Zukünftige Erweiterungen

- [ ] Tauri Command Integration für native Performance
- [ ] Batch-Embedding-Generierung
- [ ] Model Quantization Options
- [ ] Custom Tokenizer Integration
- [ ] Model Warmup auf App-Start
- [ ] Offline-Modell-Packaging

## Referenzen

- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/tutorials/web/)
- [transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [nomic-embed-text Model](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5)
