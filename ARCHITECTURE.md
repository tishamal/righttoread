# Frontend Integration Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (3000)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   App.tsx        │  │  Analytics       │  │  Digital     │  │
│  │  (Dashboard)     │  │  Dashboard       │  │  Review      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │           │
│           └─────────────────────┼────────────────────┘           │
│                                 │                                │
│                   ┌─────────────▼──────────────┐                │
│                   │  API Service Layer         │                │
│                   │  (src/services/api.ts)     │                │
│                   │                             │                │
│                   │  ┌──────────────────────┐   │                │
│                   │  │  booksAPI            │   │                │
│                   │  │  ├─ getAll()         │   │                │
│                   │  │  ├─ getById()        │   │                │
│                   │  │  ├─ create()        │   │                │
│                   │  │  ├─ update()        │   │                │
│                   │  │  └─ delete()        │   │                │
│                   │  └──────────────────────┘   │                │
│                   │                             │                │
│                   │  ┌──────────────────────┐   │                │
│                   │  │  analyticsAPI        │   │                │
│                   │  │  ├─ record()         │   │                │
│                   │  │  ├─ getByBook()     │   │                │
│                   │  │  ├─ getStats()      │   │                │
│                   │  │  └─ getBookStats()  │   │                │
│                   │  └──────────────────────┘   │                │
│                   │                             │                │
│                   └─────────────┬────────────────┘                │
│                                 │                                │
│      (.env.local)               │ HTTP Requests/Responses        │
│      API_URL: http://localhost  │                                │
│                :5000/api        │                                │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  │ Fetch API
                                  │ (JSON over HTTP)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND (5000)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Books Routes    │  │  Analytics       │                    │
│  │  /api/books      │  │  Routes          │                    │
│  │  ├─ GET          │  │  /api/analytics  │                    │
│  │  ├─ POST         │  │  ├─ GET          │                    │
│  │  ├─ PUT          │  │  └─ POST         │                    │
│  │  └─ DELETE       │  └──────────────────┘                    │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           └──────────────┬───────────────────────────┐          │
│                          │                           │          │
│           ┌──────────────▼─────────┐    ┌───────────▼─────┐   │
│           │  Database Models       │    │  AWS S3 Config  │   │
│           │  ├─ Book queries       │    │  (SSML/Audio)   │   │
│           │  └─ Analytics queries  │    └─────────────────┘   │
│           └──────────────┬─────────┘                           │
│                          │                                      │
│                          ▼                                      │
│           ┌──────────────────────┐                             │
│           │  PostgreSQL Database │                             │
│           │                       │                             │
│           │  Tables:              │                             │
│           │  ├─ users            │                             │
│           │  ├─ books            │                             │
│           │  ├─ pages            │                             │
│           │  ├─ paragraphs       │                             │
│           │  ├─ digital_versions │                             │
│           │  └─ analytics        │                             │
│           └──────────────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Fetching Books

```
User Action: Dashboard Loads
    ↓
Browser: Component Mounts (useEffect)
    ↓
Frontend: calls booksAPI.getAll()
    ↓
Fetch API: Sends GET /api/books to http://localhost:5000/api/books
    ↓
Backend: Router receives GET /api/books
    ↓
Backend: Book.getAll() queries PostgreSQL
    ↓
PostgreSQL: Returns book records from "books" table
    ↓
Backend: Wraps response in ApiResponse<T>
    ↓
Fetch API: Receives JSON response
    ↓
Frontend: Parses response and updates component state (setBooks)
    ↓
React: Re-renders components with new data
    ↓
UI: Displays books in the dashboard
```

## Component Integration Details

### 1. App.tsx (Dashboard)
```
┌─────────────────────────────────┐
│  App Component State            │
├─────────────────────────────────┤
│  • books: Book[]                │
│  • isAuthenticated: boolean     │
│  • currentPage: string          │
│  • filteredBooks: Book[]        │
└────────────┬────────────────────┘
             │
             ├─→ useEffect on mount/auth
             │   calls: booksAPI.getAll()
             │
             ├─→ handleAddBook()
             │   calls: booksAPI.create()
             │
             └─→ Renders BookCard components
                 with books from state
```

### 2. AnalyticsDashboard
```
┌──────────────────────────────────┐
│  Analytics Component State       │
├──────────────────────────────────┤
│  • analytics: any                │
│  • bookUsageData: any[]          │
│  • statsData: any[]              │
│  • loading: boolean              │
└────────────┬─────────────────────┘
             │
             ├─→ useEffect on mount/timeRange
             │   calls: analyticsAPI.getStats()
             │   calls: analyticsAPI.getBookStats()
             │
             └─→ Renders Charts with data
                 from state
```

### 3. DigitalVersionReview
```
┌──────────────────────────────────┐
│  Review Component State          │
├──────────────────────────────────┤
│  • versions: DigitalVersion[]   │
│  • selectedVersion: ?             │
│  • currentPage: number           │
│  • loading: boolean              │
└────────────┬─────────────────────┘
             │
             ├─→ useEffect on mount
             │   calls: booksAPI.getAll()
             │   filters pending/approved
             │
             └─→ Renders Version list
                 with book data
```

## Type System Flow

```
Backend                                    Frontend
PostgreSQL Records                         TypeScript Types
    ↓                                            ↑
Book Entity                                Book Interface
  id: UUID                                  id: string
  title: string                             title: string
  grade: string                             grade: string
  status: enum                              status: string
  ...                                       ...
    ↓                                            ↑
Express Response                           API Service
  JsonResponse { ... }                      export interface Book { ... }
    ↓                                            ↑
HTTP JSON Body                              Fetch Response
  { "id": "...", ... }                      JSON.parse()
    ↓                                            ↑
Fetch API                                  booksAPI.getAll()
  response.json()                           returns Promise<Book[]>
    ↓                                            ↑
TypeScript Validation                      Component State
  data: ApiResponse<Book[]>                 books: Book[]
```

## API Request/Response Cycle

### Example: Create New Book

```
FRONTEND
┌──────────────────────────────────────┐
│ User fills form and clicks "Add"      │
│                                        │
│ handleAddBook() is called with:       │
│ {                                      │
│   name: "Math Book Grade 5"           │
│   grade: "Grade 5"                    │
│   author: "Ministry of Education"     │
│   ...                                  │
│ }                                      │
└────────────┬─────────────────────────┘
             │
             ↓ Convert to API format
┌────────────────────────────────────────┐
│ booksAPI.create({                      │
│   title: "Math Book Grade 5"           │
│   grade: "Grade 5"                     │
│   author: "Ministry of Education"      │
│   status: "draft"                      │
│ })                                     │
│                                        │
│ Returns: Promise<Book>                │
└────────────┬─────────────────────────┘
             │
             ↓ HTTP Request
┌────────────────────────────────────────┐
│ POST /api/books HTTP/1.1               │
│ Host: localhost:5000                   │
│ Content-Type: application/json         │
│                                        │
│ {                                      │
│   "title": "Math Book Grade 5",       │
│   "grade": "Grade 5",                  │
│   "author": "Ministry of Education",   │
│   "status": "draft"                    │
│ }                                      │
└────────────┬─────────────────────────┘
             │
             ↓ Network
             
BACKEND
┌────────────────────────────────────────┐
│ Express receives POST /api/books        │
│                                        │
│ Body parsed as JSON                    │
└────────────┬─────────────────────────┘
             │
             ↓ Route handler
┌────────────────────────────────────────┐
│ router.post('/books', async (req) => { │
│   const book = await Book.create(...)  │
│   return { success: true, data: book } │
│ })                                     │
└────────────┬─────────────────────────┘
             │
             ↓ Database Query
┌────────────────────────────────────────┐
│ INSERT INTO books (                    │
│   title, grade, author, status, ...   │
│ ) VALUES (...)                         │
│                                        │
│ RETURNING *;                           │
└────────────┬─────────────────────────┘
             │
             ↓ HTTP Response
┌────────────────────────────────────────┐
│ HTTP/1.1 201 Created                   │
│ Content-Type: application/json         │
│                                        │
│ {                                      │
│   "success": true,                     │
│   "data": {                            │
│     "id": "550e8400...",              │
│     "title": "Math Book Grade 5",     │
│     "grade": "Grade 5",                │
│     "status": "draft",                 │
│     "created_at": "2025-01-15..."     │
│   }                                    │
│ }                                      │
└────────────┬─────────────────────────┘
             │
             ↓ Network

FRONTEND
┌────────────────────────────────────────┐
│ Fetch API receives response             │
│ response.json() parses JSON             │
│                                        │
│ Returns: Book object                   │
└────────────┬─────────────────────────┘
             │
             ↓ Update component state
┌────────────────────────────────────────┐
│ setBooks(prev => [...prev, newBook])   │
│                                        │
│ Component re-renders                   │
│ New book appears in list                │
└────────────────────────────────────────┘
```

## File Structure

```
Right to Read/
├── src/
│   ├── App.tsx                    [Main Dashboard, API integration]
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx [API integration]
│   │   ├── DigitalVersionReview.tsx[API integration]
│   │   ├── AddBookModal.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   ├── services/
│   │   └── api.ts                 [NEW - API Service Layer]
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── server.ts              [Express app setup]
│   │   ├── config/
│   │   │   ├── database.ts        [PostgreSQL connection]
│   │   │   └── s3.ts              [AWS S3 config]
│   │   ├── models/
│   │   │   ├── book.ts            [Book CRUD]
│   │   │   └── analytics.ts       [Analytics queries]
│   │   └── routes/
│   │       ├── books.ts           [Books endpoints]
│   │       └── analytics.ts       [Analytics endpoints]
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                       [Database & AWS config]
│
├── .env.local                     [NEW - Frontend API URL]
├── INTEGRATION_SUMMARY.md         [NEW - This integration guide]
├── QUICKSTART.md                  [NEW - Setup instructions]
└── API_CONTRACT.md                [NEW - API documentation]
```

## Dependencies

### Frontend
- React 18
- Material-UI v5
- Recharts (charts)
- Fetch API (built-in)

### Backend
- Express.js
- PostgreSQL (pg)
- AWS SDK
- UUID
- CORS
- TypeScript

## Error Handling Flow

```
Frontend Request
    ↓
try/catch block in API service
    ↓
┌─────────────────────┬──────────────────────┐
│  Response OK?       │  Network Error?      │
├─────────────────────┼──────────────────────┤
│ YES ↓               │ YES ↓                │
│ Parse JSON          │ Log error            │
│ Return data.data    │ Return fallback      │
└─────────────────────┴──────────────────────┘
    ↓
Component receives data or fallback
    ↓
UI updates or shows error state
```

## Performance Considerations

1. **API Calls**
   - Called only when needed (useEffect dependencies)
   - Responses cached in component state
   - Fallback to sample data prevents blank UI

2. **Component Rendering**
   - Each component has its own API call
   - No prop drilling needed
   - Parallel API calls possible

3. **Data Validation**
   - TypeScript prevents type errors
   - API responses validated by interfaces
   - Failed requests use fallback data

## Security Notes

- ✅ No hardcoded API keys in frontend
- ✅ Environment variables for API URL
- ⚠️ Authentication not yet implemented (TODO)
- ⚠️ HTTPS not shown (needed for production)
- ⚠️ CORS configured for localhost only

## Deployment Checklist

- [ ] Update API_URL for production environment
- [ ] Configure CORS for production domain
- [ ] Implement authentication/JWT tokens
- [ ] Add request logging/monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure API rate limiting
- [ ] Add database backups
- [ ] Set up SSL/HTTPS certificates
- [ ] Configure environment variables on server
- [ ] Test end-to-end workflows

