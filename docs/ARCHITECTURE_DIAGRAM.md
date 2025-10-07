# SDPrivateAI - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                             │
│                                                                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  React          │  │  Error Boundary  │  │  Theme System    │       │
│  │  Components     │  │  (Isolation)     │  │  (Light/Dark)    │       │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘       │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │              MainLayout + Header + Sidebar                   │       │
│  └─────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓ ↑
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                    │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │   Database   │  │    Cache     │  │ Performance  │  │  AI Service ││
│  │   Service    │  │   Service    │  │   Monitor    │  │             ││
│  │              │  │              │  │              │  │             ││
│  │ • CRUD Ops   │  │ • In-Memory  │  │ • Metrics    │  │ • Embedding ││
│  │ • Transactions│ │ • TTL Cache  │  │ • Timing     │  │ • Vector    ││
│  │ • Search     │  │ • Memoize    │  │ • Stats      │  │ • Similarity││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Cross-Cutting Concerns                       │    │
│  │  • Error Logging (logger)                                       │    │
│  │  • Retry Logic (exponential backoff)                            │    │
│  │  • Circuit Breaker (failure isolation)                          │    │
│  │  • Input Validation & Sanitization                              │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓ ↑
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    SQLite Database                            │      │
│  │                                                                │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │      │
│  │  │  Documents   │  │  Embeddings  │  │  Migrations  │       │      │
│  │  │              │  │              │  │  (planned)   │       │      │
│  │  │ • id (PK)    │  │ • id (PK)    │  │              │       │      │
│  │  │ • title      │  │ • doc_id(FK) │  │ • version    │       │      │
│  │  │ • content    │  │ • vector     │  │ • name       │       │      │
│  │  │ • metadata   │  │ • metadata   │  │ • applied_at │       │      │
│  │  │ • timestamps │  │              │  │              │       │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │      │
│  │                                                                │      │
│  │  Indexes:                                                      │      │
│  │  • idx_documents_created_at                                    │      │
│  │  • idx_documents_updated_at                                    │      │
│  │  • idx_embeddings_document_id                                  │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓ ↑
┌─────────────────────────────────────────────────────────────────────────┐
│                         TAURI BACKEND                                    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    Rust Backend (Tauri)                       │      │
│  │                                                                │      │
│  │  • SQL Plugin (Database Access)                               │      │
│  │  • Security (CSP, Permissions)                                │      │
│  │  • Native APIs                                                 │      │
│  │  • File System Access (scoped)                                │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Document Creation Flow
```
User Input
    ↓
[UI Component]
    ↓
[Input Validation] → Sanitization
    ↓
[Error Boundary] → Error Handling
    ↓
[Database Service]
    ↓
[Transaction Begin]
    ↓
[Create Document] → Parameterized Query
    ↓
[Create Embedding] → Vector Generation
    ↓
[Transaction Commit]
    ↓
[Cache Update] → TTL Cache
    ↓
[Performance Log] → Metrics
    ↓
Success Response
```

### Search Flow with Caching
```
Search Query
    ↓
[Cache Check]
    ↓
    ├─── Hit → Return Cached
    │
    └─── Miss
         ↓
    [Input Validation]
         ↓
    [AI Service] → Generate Query Vector
         ↓
    [Database Service] → Vector Similarity Search
         ↓
    [Results Processing]
         ↓
    [Cache Store] → TTL: 5min
         ↓
    [Performance Log]
         ↓
    Return Results
```

## Error Handling Flow

```
                    [Operation]
                         ↓
                    Try Execute
                         ↓
                   ┌─────┴─────┐
                   │           │
               Success      Error
                   │           │
                   │           ↓
                   │    [Error Boundary]
                   │           ↓
                   │      ┌────┴────┐
                   │      │         │
                   │   Known     Unknown
                   │      │         │
                   │      ↓         ↓
                   │  [Retry?]  [Log & Wrap]
                   │      │         │
                   │      ↓         ↓
                   │  [Circuit   [User Error
                   │   Breaker]   Message]
                   │      │         │
                   ↓      ↓         ↓
              [Success Path]  [Error Path]
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Content Security Policy       │
│  • default-src 'self'                   │
│  • script-src restrictions              │
│  • No inline scripts (except approved)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 2: Input Validation              │
│  • Type checking                        │
│  • Length limits                        │
│  • Pattern validation                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 3: Input Sanitization            │
│  • Remove null bytes                    │
│  • Strip control characters             │
│  • SQL injection prevention             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 4: Parameterized Queries         │
│  • Prepared statements                  │
│  • No string concatenation              │
│  • Transaction safety                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 5: Error Handling                │
│  • No sensitive data in errors          │
│  • Structured logging                   │
│  • Error boundaries                     │
└─────────────────────────────────────────┘
```

## Performance Optimization Strategy

```
                [Request]
                    ↓
            [Cache Layer]
                    ↓
              ┌─────┴─────┐
              │           │
           Hit         Miss
              │           │
              │           ↓
              │    [Performance Timer Start]
              │           ↓
              │    [Database Query]
              │           ↓
              │    [Performance Timer End]
              │           ↓
              │    [Cache Store]
              │           │
              └───────────┘
                    ↓
            [Metrics Collection]
                    ↓
         [Response + Timing Data]
```

## Resilience Patterns

### Retry with Exponential Backoff
```
Attempt 1 → Fail → Wait 1s
Attempt 2 → Fail → Wait 2s
Attempt 3 → Fail → Wait 4s
Attempt 4 → Success ✓
```

### Circuit Breaker States
```
[CLOSED] ──5 failures──→ [OPEN]
    ↑                        ↓
    │                   Wait 60s
    │                        ↓
    └──2 successes── [HALF_OPEN]
                            ↓
                      Test Request
```

## Component Communication

```
┌─────────────┐
│    App      │ ← Main Entry Point
└──────┬──────┘
       │
       ├──→ [ErrorBoundary] ← Catches Errors
       │         ↓
       │    [MainLayout]
       │         ↓
       │    ┌────┴────┐
       │    │         │
       │  Header   Content
       │
       ├──→ [useTheme] ← Theme Management
       │
       ├──→ [Database Service] ← Data Access
       │         ↓
       │    [Cache Service] ← Performance
       │         ↓
       │    [Performance Monitor] ← Metrics
       │
       └──→ [i18n Service] ← Localization
```

## Service Dependencies

```
Database Service
    ↓
    ├─→ Validation Utils
    ├─→ Error Classes
    ├─→ Logger
    └─→ Cache Service (optional)

AI Service
    ↓
    ├─→ Validation Utils
    ├─→ Error Classes
    └─→ Cache Service (optional)

Performance Monitor
    ↓
    └─→ Logger

Cache Service
    ↓
    └─→ Logger

Error Boundary
    ↓
    └─→ Logger
```

## Technology Stack

```
┌─────────────────────────────────────┐
│          Frontend                    │
│  • React 19                          │
│  • TypeScript (strict mode)          │
│  • Vite (build tool)                 │
│  • i18next (internationalization)    │
│  • Syncfusion (UI components)        │
└─────────────────────────────────────┘
                ↓ ↑
┌─────────────────────────────────────┐
│          Backend                     │
│  • Tauri 2.x                         │
│  • Rust                              │
│  • SQLite (via Tauri SQL Plugin)     │
└─────────────────────────────────────┘
                ↓ ↑
┌─────────────────────────────────────┐
│          Platform                    │
│  • Windows                           │
│  • macOS                             │
│  • Linux                             │
│  • Android (planned)                 │
└─────────────────────────────────────┘
```

## Monitoring & Observability

```
Application
    ↓
Performance Monitor ──→ Metrics Storage
    ↓                        ↓
    ├─→ Operation Timing    Statistics
    ├─→ Duration Tracking   • Min/Max/Avg
    ├─→ Success/Failure     • P95/P99
    └─→ Metadata            • Count

Error Logger ──→ Log Aggregation
    ↓                  ↓
    ├─→ Error Type    Console
    ├─→ Stack Trace   • Structured
    ├─→ Context       • Timestamped
    └─→ Severity      • Searchable

Cache Monitor ──→ Cache Stats
    ↓                   ↓
    ├─→ Hit Rate       Insights
    ├─→ Size           • Efficiency
    ├─→ Evictions      • Tuning
    └─→ TTL Stats      • Optimization
```

This architecture provides a robust, scalable, and maintainable foundation for the SDPrivateAI application with enterprise-grade features.
