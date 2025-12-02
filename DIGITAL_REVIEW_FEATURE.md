# Digital Review Feature - Implementation Complete

## Overview
The digital review feature allows reviewers to view processed books from the database, browse through pages with their images and text blocks, listen to audio, and approve/reject books.

## Architecture

### Backend (Python FastAPI)
**Location:** `right-to-read-service/src/main/`

#### 1. Repository Layer (`repositories/book_repository.py`)
- **`get_books_for_review(status, grade)`**: Queries books with optional filters
- **`get_book_with_pages(book_id)`**: Fetches book with all pages and audio files (uses eager loading)
- **`update_book_status(book_id, status, notes)`**: Updates book processing status

#### 2. Controller Layer (`controllers/book_review_controller.py`)
4 REST API endpoints:

- **GET `/api/books/pending_review`**
  - Query params: `status` (optional), `grade` (optional)
  - Returns: List of books for review
  
- **GET `/api/books/{book_id}/details`**
  - Returns: Book object with all pages and audio files
  
- **POST `/api/books/{book_id}/presigned_urls`**
  - Body: `{"s3_keys": ["key1", "key2", ...]}`
  - Returns: `{"key1": "presigned_url1", ...}` (1-hour expiration)
  - Generates presigned URLs for S3 resources
  
- **PUT `/api/books/{book_id}/review_status`**
  - Body: `{"status": "approved|rejected|needs_revision", "notes": "..."}`
  - Updates book status and saves reviewer notes

#### 3. Main App (`main/main.py`)
- Registered `book_review_router` with `/api` prefix

### Frontend (React TypeScript)
**Location:** `righttoread/src/`

#### 1. API Service Layer (`services/api.ts`)
**ttsAPI object** with 7 methods:

1. `uploadBook(bookData)` - Upload new book to TTS service
2. `uploadBookWithDownload(bookData)` - Upload and download processed book
3. `getBooksForReview(params)` - Fetch books list with filters
4. `getBookDetails(bookId)` - Fetch book with all pages
5. `getPresignedUrls(bookId, s3Keys)` - Get presigned URLs for resources
6. `updateReviewStatus(bookId, status, notes)` - Submit review decision

#### 2. Components

**BookListPanel (`components/BookListPanel.tsx`)**
- Displays filterable list of books
- Filters: Status (completed/approved/rejected/all), Grade (all/3-6)
- Shows book status with color-coded chips
- Highlights selected book
- Loading state support

**DigitalVersionReview (`components/DigitalVersionReview.tsx`)**
Main review interface with 2 tabs:

**Tab 1: Page Content**
- Split view: Page Image (left) | Text Blocks (right)
- Page navigation (Previous/Next buttons)
- Toggle audio speed (Normal/Slow)
- Click text blocks to play audio
- Displays SSML markup for each block

**Tab 2: Review Actions**
- Reviewer notes textarea
- Three action buttons:
  - **Approve Book** (green) - Marks book as approved
  - **Reject Book** (red) - Marks book as rejected  
  - **Request Revision** (orange) - Marks book as needs_revision

## Data Flow

### 1. Loading Books List
```
User opens page 
  → fetchBooks() 
  → ttsAPI.getBooksForReview({status, grade}) 
  → GET /api/books/pending_review
  → BookRepository.get_books_for_review()
  → Returns books array
```

### 2. Selecting a Book
```
User clicks book 
  → handleSelectBook(book)
  → fetchBookDetails(book.id)
  → ttsAPI.getBookDetails(bookId)
  → GET /api/books/{id}/details
  → BookRepository.get_book_with_pages() with eager loading
  → Returns book with pages and audio_files
  → loadPageData(0) - Load first page
```

### 3. Loading Page Resources
```
loadPageData(pageIndex)
  → Extract S3 keys (image_s3_key, blocks_s3_key, audio_s3_key's)
  → ttsAPI.getPresignedUrls(bookId, s3Keys)
  → POST /api/books/{id}/presigned_urls
  → boto3.generate_presigned_url() for each key
  → Returns {s3_key: presigned_url} mapping
  → fetch(presignedUrl) to download blocks.json
  → Parse blocks and map audio URLs
  → Update currentPageData state
```

### 4. Playing Audio
```
User clicks block
  → handlePlayBlock(blockId)
  → Lookup audio URL: audioUrls[`${blockId}_${audioSpeed}`]
  → new Audio(url).play()
  → onended → clear playingBlockId
```

### 5. Submitting Review
```
User clicks Approve/Reject/Request Revision
  → handleApproveBook() / handleRejectBook() / handleRequestRevision()
  → ttsAPI.updateReviewStatus(bookId, status, reviewerNotes)
  → PUT /api/books/{id}/review_status
  → BookRepository.update_book_status()
  → Update local state (books array)
  → Clear selection
```

## Database Schema

### Book Table
- `id` (PK)
- `book_name`, `grade`
- `processing_status` (completed, approved, rejected, needs_revision)
- `s3_base_path` - Base S3 path for this book
- `dictionary_s3_key` - S3 key for dictionary JSON
- `total_pages`
- `created_at`, `updated_at`

### BookPage Table
- `id` (PK), `book_id` (FK)
- `page_number`, `status`
- `image_s3_key` - Original page image
- `annotated_image_s3_key` - Image with block annotations
- `blocks_s3_key` - blocks.json (text blocks with SSML)
- `slow_blocks_s3_key` - slow_blocks.json
- `metadata_s3_key` - Page metadata

### BlockAudioFile Table
- `id` (PK), `page_id` (FK)
- `block_id` - Block identifier (e.g., "block_0")
- `audio_type` - "normal" or "slow"
- `audio_s3_key` - S3 key for MP3 file
- `speech_marks_s3_key` - S3 key for speech marks JSON

## S3 Resource Structure
```
s3://bucket/{book_s3_base_path}/
  ├── dictionary.json                    (dictionary_s3_key)
  ├── page_{N}/
  │   ├── page_{N}.png                   (image_s3_key)
  │   ├── page_{N}_annotated.png         (annotated_image_s3_key)
  │   ├── blocks.json                    (blocks_s3_key)
  │   ├── slow_blocks.json               (slow_blocks_s3_key)
  │   ├── metadata.json                  (metadata_s3_key)
  │   └── audio/
  │       ├── block_0_normal.mp3         (audio_s3_key)
  │       ├── block_0_normal_speech.json (speech_marks_s3_key)
  │       ├── block_0_slow.mp3
  │       └── block_0_slow_speech.json
```

## State Management

### DigitalVersionReview Component State
```typescript
books: Book[]                           // List of books for review
selectedBook: Book | null               // Currently selected book
bookDetails: BookDetails | null         // Full book data with pages
currentPageIndex: number                // Current page being viewed (0-based)
currentPageData: {                      // Current page's loaded resources
  imageUrl: string | null
  blocks: Block[]
  audioUrls: Record<string, string>     // {blockId_audioType: presignedUrl}
}
playingBlockId: string | null           // Currently playing block
audioSpeed: 'normal' | 'slow'           // Selected audio speed
tabValue: 0 | 1                         // Active tab index
loading: boolean                        // Loading books list
loadingPage: boolean                    // Loading page resources
reviewerNotes: string                   // Reviewer's notes
statusFilter: string                    // Filter: completed/approved/rejected/all
gradeFilter: string                     // Filter: all/3/4/5/6
snackbar: {open, message, severity}     // Notification state
```

## UI Features

### Book List (Left Sidebar)
- ✅ Status filter dropdown
- ✅ Grade filter dropdown
- ✅ Scrollable list of books
- ✅ Color-coded status chips
- ✅ Selected book highlighting
- ✅ Loading spinner

### Page Viewer (Main Area - Tab 1)
- ✅ Page navigation buttons
- ✅ Page counter display
- ✅ Split-screen layout (image + blocks)
- ✅ Audio speed toggle (Normal/Slow)
- ✅ Clickable text blocks
- ✅ Play/pause icons
- ✅ SSML display for each block
- ✅ Active block highlighting
- ✅ Loading spinner for page load

### Review Actions (Main Area - Tab 2)
- ✅ Multiline notes textarea
- ✅ Approve button (green with checkmark icon)
- ✅ Reject button (red with cancel icon)
- ✅ Request Revision button (orange with edit icon)
- ✅ Success/error notifications (Snackbar)

## Error Handling

### Backend
- Database query errors → HTTP 500
- Missing book → HTTP 404
- S3 errors → HTTP 500 with error message
- Invalid input → HTTP 422 validation error

### Frontend
- API call failures → Snackbar error notification
- Missing resources → Display fallback message ("No image available", "No blocks available")
- Audio play failure → Console error + Snackbar notification
- Network errors → Caught in try-catch, user notified

## Testing Checklist

- [ ] Upload a book via AddBookModal (should call TTS service)
- [ ] Wait for TTS processing to complete
- [ ] Open Digital Review page
- [ ] Verify book appears in list with "completed" status
- [ ] Click on book → Should load book details
- [ ] Verify page image displays
- [ ] Verify text blocks display
- [ ] Click text block → Audio should play
- [ ] Toggle Normal/Slow → Should play different audio
- [ ] Click Next/Previous → Should load different pages
- [ ] Switch to Review Actions tab
- [ ] Enter reviewer notes
- [ ] Click Approve → Book status should update to "approved"
- [ ] Verify book disappears from "completed" filter
- [ ] Change filter to "approved" → Book should reappear

## Environment Variables

### Backend (TTS Service)
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
DATABASE_URL=postgresql://user:pass@localhost/dbname
```

### Frontend
```env
REACT_APP_BACKEND_API_URL=http://localhost:3001
REACT_APP_TTS_SERVICE_URL=http://localhost:8080
```

## API Contract

See `API_CONTRACT.md` for detailed API specifications including:
- Request/response schemas
- Error codes
- Example payloads
- Authentication requirements (if any)

## Known Limitations

1. **Audio playback**: Only one block can play at a time (no queue)
2. **Presigned URL expiration**: URLs expire after 1 hour (requires page reload)
3. **No inline editing**: SSML cannot be edited directly in review interface
4. **No pagination**: All books loaded at once (may need pagination for large datasets)
5. **No search**: Books can only be filtered by status/grade (no text search)

## Future Enhancements

- [ ] Audio player with timeline/scrubbing
- [ ] Side-by-side comparison (original image + annotated image)
- [ ] Inline SSML editing with live audio regeneration
- [ ] Comment/annotation system for specific blocks
- [ ] Bulk approve/reject multiple books
- [ ] Export review report as PDF
- [ ] Real-time collaboration (multiple reviewers)
- [ ] Revision history tracking
- [ ] Audio waveform visualization

## Deployment

1. **Backend**: Ensure TTS service is running on port 8080
2. **Frontend**: Configure `.env` with correct backend URLs
3. **Database**: Run migrations to create tables (if not already done)
4. **S3**: Ensure AWS credentials are configured and bucket exists
5. **Start servers**:
   ```bash
   # Backend (TTS service)
   cd right-to-read-service
   python -m src.main.main
   
   # Frontend
   cd righttoread
   npm start
   ```

## Support

For issues or questions:
- Check console logs (browser DevTools for frontend, server logs for backend)
- Verify environment variables are set correctly
- Ensure AWS credentials have S3 read permissions
- Check database connectivity

