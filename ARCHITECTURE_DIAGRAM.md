# Architecture Overview - Book Upload Feature

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                            │
│                      http://localhost:3000                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐    ┌──────────────────┐   ┌─────────────────┐ │
│  │  AddBookModal   │───▶│   App.tsx        │◀──│  API Config     │ │
│  │  (UI Form)      │    │  (Upload Logic)  │   │  (apiConfig.ts) │ │
│  └─────────────────┘    └──────────────────┘   └─────────────────┘ │
│                                  │                                   │
│                                  ▼                                   │
│                          ┌──────────────┐                            │
│                          │  api.ts      │                            │
│                          │  (Services)  │                            │
│                          └──────────────┘                            │
│                                  │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌────────────────────┐        ┌────────────────────┐
        │   TTS Service      │        │  Backend API       │
        │   (Python FastAPI) │        │  (Node.js Express) │
        │   Port: 8080       │        │  Port: 8080        │
        └────────────────────┘        └────────────────────┘
                    │                             │
                    ▼                             ▼
        ┌────────────────────┐        ┌────────────────────┐
        │  File System       │        │  PostgreSQL DB     │
        │  (output/)         │        │                    │
        └────────────────────┘        └────────────────────┘
```

## Upload Flow Sequence

```
User                AddBookModal         App.tsx            api.ts          TTS Service      Backend API
 │                       │                   │                 │                 │                │
 │  Fill Form           │                   │                 │                 │                │
 │ ──────────────────▶  │                   │                 │                 │                │
 │                       │                   │                 │                 │                │
 │  Upload PDF          │                   │                 │                 │                │
 │ ──────────────────▶  │                   │                 │                 │                │
 │                       │                   │                 │                 │                │
 │  Set Starting Page   │                   │                 │                 │                │
 │ ──────────────────▶  │                   │                 │                 │                │
 │                       │                   │                 │                 │                │
 │  Click Save          │                   │                 │                 │                │
 │ ──────────────────▶  │                   │                 │                 │                │
 │                       │                   │                 │                 │                │
 │                       │  onSave(data)     │                 │                 │                │
 │                       │ ───────────────▶  │                 │                 │                │
 │                       │                   │                 │                 │                │
 │                       │                   │ Show Loading    │                 │                │
 │                       │                   │ ─────────────▶  │                 │                │
 │                       │                   │                 │                 │                │
 │                       │                   │ ttsAPI.upload() │                 │                │
 │                       │                   │ ──────────────▶ │                 │                │
 │                       │                   │                 │                 │                │
 │                       │                   │                 │ POST /tts_service               │
 │                       │                   │                 │ ─────────────▶  │                │
 │                       │                   │                 │                 │                │
 │                       │                   │                 │  Process PDF    │                │
 │                       │                   │                 │  Generate Audio │                │
 │                       │                   │                 │  Save Files     │                │
 │                       │                   │                 │                 │                │
 │                       │                   │                 │ Success Response│                │
 │                       │                   │                 │ ◀───────────────│                │
 │                       │                   │                 │                 │                │
 │                       │                   │ TTS Complete    │                 │                │
 │                       │                   │ ◀──────────────  │                 │                │
 │                       │                   │                 │                 │                │
 │                       │                   │ booksAPI.create()│                │                │
 │                       │                   │ ──────────────▶ │                 │                │
 │                       │                   │                 │                 │                │
 │                       │                   │                 │  POST /books    │                │
 │                       │                   │                 │ ──────────────────────────────▶ │
 │                       │                   │                 │                 │                │
 │                       │                   │                 │                 │  Save to DB    │
 │                       │                   │                 │                 │                │
 │                       │                   │                 │  Success Response               │
 │                       │                   │                 │ ◀──────────────────────────────  │
 │                       │                   │                 │                 │                │
 │                       │                   │ Book Created    │                 │                │
 │                       │                   │ ◀──────────────  │                 │                │
 │                       │                   │                 │                 │                │
 │                       │                   │ Update UI       │                 │                │
 │                       │                   │ Hide Loading    │                 │                │
 │                       │                   │ Show Success    │                 │                │
 │                       │                   │                 │                 │                │
 │  Success Message      │                   │                 │                 │                │
 │ ◀─────────────────────────────────────────                  │                 │                │
 │                       │                   │                 │                 │                │
```

## Component Structure

```
src/
├── config/
│   └── apiConfig.ts ──────────┐ (Single source of truth)
│                               │
├── services/                   │
│   └── api.ts ─────────────────┤ (Uses config)
│                               │
├── components/                 │
│   └── AddBookModal.tsx        │
│                               │
└── App.tsx ────────────────────┘ (Uses api.ts)
```

## Configuration Flow

```
.env file
    │
    ├─ REACT_APP_BACKEND_API_URL
    │       │
    │       ▼
    │  ┌──────────────────────────┐
    │  │  apiConfig.ts            │
    │  │                          │
    └──│  BACKEND_API_URL         │
       │  TTS_SERVICE_URL         │
       │                          │
       │  API_ENDPOINTS {         │
       │    books: ...            │
       │    analytics: ...        │
       │    tts: ...              │
       │  }                       │
       └──────────────────────────┘
                  │
                  ├──▶ api.ts (booksAPI)
                  │
                  ├──▶ api.ts (analyticsAPI)
                  │
                  └──▶ api.ts (ttsAPI)
                          │
                          └──▶ All Components
```

## Data Flow

```
1. User Input (AddBookModal)
   ├─ name: string
   ├─ grade: string
   ├─ author: string
   ├─ yearOfPublished: string
   ├─ description: string
   ├─ isPublishedByNIE: string
   ├─ pdfFile: File
   └─ startingPageNumber: number

2. FormData (to TTS Service)
   ├─ pdf_file: File
   └─ starting_page_number: number

3. TTS Response
   ├─ status: "success"
   ├─ book_name: string
   ├─ starting_page: number
   ├─ total_pages_processed: number
   └─ local_files: {...}

4. Book Metadata (to Backend API)
   ├─ title: string
   ├─ author: string
   ├─ grade: string
   ├─ subject: string
   ├─ description: string
   ├─ published_by_nie: boolean
   ├─ year_published: number
   └─ status: "draft"

5. Backend Response
   ├─ success: true
   └─ data: Book object
```

## State Management

```
App.tsx State:
├── books: Book[]
│   └── Updated after successful upload
│
├── uploading: boolean
│   ├── false: Initial state
│   ├── true: During upload/processing
│   └── false: After completion
│
├── uploadStatus: {
│   ├── open: boolean
│   ├── message: string
│   └── severity: 'success' | 'error' | 'info'
│   }
│
├── addBookModalOpen: boolean
└── isAuthenticated: boolean
```

## Error Handling Strategy

```
Try Upload PDF (ttsAPI.uploadBook)
    │
    ├─ Success ──▶ Show success message
    │              Continue to create book record
    │
    └─ Failure ──▶ Log error
                   Show error message
                   Continue to create book record anyway
                   (Book created, but without TTS processing)

Try Create Book Record (booksAPI.create)
    │
    ├─ Success ──▶ Add to state
    │              Show in UI
    │
    └─ Failure ──▶ Log error
                   Show error message
                   Fallback: Add to local state only
                   (Visible in UI, but not persisted)
```

## File Organization

```
righttoread/
├── src/
│   ├── config/
│   │   └── apiConfig.ts         ✨ NEW - Central config
│   │
│   ├── services/
│   │   └── api.ts               ✏️ UPDATED - Uses config
│   │
│   ├── components/
│   │   └── AddBookModal.tsx     ✏️ UPDATED - Added field
│   │
│   └── App.tsx                  ✏️ UPDATED - Upload logic
│
├── .env.example                 ✨ NEW - Config template
├── UPLOAD_FEATURE_README.md     ✨ NEW - Documentation
├── QUICK_START_UPLOAD.md        ✨ NEW - Quick guide
└── IMPLEMENTATION_COMPLETE.md   ✨ NEW - Summary
```

## Environment Variables

```
Development:
.env
├── REACT_APP_BACKEND_API_URL=http://localhost:8080/api
└── REACT_APP_TTS_SERVICE_URL=http://localhost:8080/api

Production:
.env.production
├── REACT_APP_BACKEND_API_URL=https://api.yourapp.com/api
└── REACT_APP_TTS_SERVICE_URL=https://tts.yourapp.com/api

All components automatically use the correct URLs!
```

## Key Design Decisions

1. **Centralized Configuration**
   - All URLs in one place
   - Easy to change without touching code
   - Environment-aware (dev/staging/prod)

2. **Progressive Enhancement**
   - Book can be created without TTS
   - TTS failure doesn't block book creation
   - User always gets feedback

3. **User Experience First**
   - Loading indicators
   - Clear error messages
   - Non-blocking operations

4. **Separation of Concerns**
   - Config ← API Service ← Components
   - Each layer has single responsibility
   - Easy to test and maintain

---

**Legend:**
- ✨ NEW: Newly created file
- ✏️ UPDATED: Modified existing file
- ──▶: Data/control flow
- ◀──: Response/callback flow
