# Book Upload Functionality - Implementation Summary

## Overview
This document summarizes the implementation of the book upload functionality that allows users to upload PDF books and process them through the TTS (Text-to-Speech) service.

## Changes Made

### 1. Centralized API Configuration
**File**: `src/config/apiConfig.ts` (NEW)

Created a single source of truth for all backend URLs to make it easy to change endpoints without modifying multiple files.

**Key Features:**
- Single place to configure backend API URL
- Single place to configure TTS service URL
- Environment variable support via `.env` file
- Organized endpoints by service (books, analytics, tts)

**Environment Variables:**
- `REACT_APP_BACKEND_API_URL`: Node.js Express backend (default: http://localhost:8080/api)
- `REACT_APP_TTS_SERVICE_URL`: Python FastAPI TTS service (default: http://localhost:8080/api)

### 2. Updated API Service
**File**: `src/services/api.ts` (MODIFIED)

- Refactored to use centralized API configuration
- Added `ttsAPI` with two methods:
  - `uploadBook()`: Uploads PDF and returns processing status
  - `uploadBookWithDownload()`: Uploads PDF and returns processed files as download
- All endpoints now reference `API_ENDPOINTS` from config

### 3. Enhanced Add Book Modal
**File**: `src/components/AddBookModal.tsx` (MODIFIED)

**New Field Added:**
- **Starting Page Number**: Numeric input field with validation
  - Default value: 1
  - Minimum value: 1
  - Helper text explaining its purpose
  - Auto-increments to prevent values below 1

**Updated Interface:**
```typescript
interface BookFormData {
  name: string;
  grade: string;
  isPublishedByNIE: string;
  author: string;
  yearOfPublished: string;
  description: string;
  pdfFile: File | null;
  startingPageNumber: number; // NEW
}
```

### 4. Enhanced Main App Component
**File**: `src/App.tsx` (MODIFIED)

**New Features:**
1. **Upload Status Management**
   - Added upload state tracking
   - Status messages with severity levels (success, error, info)
   - Snackbar notifications for user feedback

2. **Loading Overlay**
   - Full-screen loading indicator during upload
   - Progress message
   - Prevents user interaction during processing

3. **Enhanced handleAddBook Function**
   - Step 1: Upload PDF to TTS service (if provided)
   - Step 2: Create book record in database
   - Error handling for each step
   - User-friendly status messages
   - Fallback to local state if API fails

**New State Variables:**
```typescript
const [uploading, setUploading] = useState(false);
const [uploadStatus, setUploadStatus] = useState<{
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
}>({...});
```

### 5. Environment Configuration
**File**: `.env.example` (NEW)

Template for environment variables:
```bash
REACT_APP_BACKEND_API_URL=http://localhost:8080/api
REACT_APP_TTS_SERVICE_URL=http://localhost:8080/api
```

## How It Works

### Upload Flow

1. **User Opens Add Book Modal**
   - Fills in book details (name, author, grade, etc.)
   - Selects PDF file
   - Specifies starting page number (default: 1)

2. **User Clicks "Save Book"**
   - App shows loading overlay
   - Status message: "Processing book upload and generating TTS..."

3. **PDF Processing (if file provided)**
   - PDF uploaded to `/api/tts_service` endpoint
   - Request includes:
     - `pdf_file`: The PDF file
     - `starting_page_number`: Starting page for processing
   - Success: Shows pages processed count
   - Failure: Shows error but continues to create book record

4. **Book Record Creation**
   - Book metadata saved to database via `/api/books`
   - Book added to local state for immediate UI update

5. **Completion**
   - Loading overlay dismissed
   - Success message shown in snackbar
   - Modal closes
   - New book appears in dashboard

## API Endpoints Used

### TTS Service (Python FastAPI)
- **POST** `/api/tts_service`
  - Accepts: multipart/form-data
  - Parameters:
    - `pdf_file`: File
    - `starting_page_number`: Integer
  - Returns: Processing status and file information

### Books API (Node.js Express)
- **POST** `/api/books`
  - Accepts: application/json
  - Body: Book metadata
  - Returns: Created book object

## Configuration

### To Change Backend URLs

Edit `.env` file (create from `.env.example` if it doesn't exist):

```bash
# For local development
REACT_APP_BACKEND_API_URL=http://localhost:8080/api
REACT_APP_TTS_SERVICE_URL=http://localhost:8080/api

# For production
REACT_APP_BACKEND_API_URL=https://api.yourapp.com/api
REACT_APP_TTS_SERVICE_URL=https://tts.yourapp.com/api
```

No code changes needed - all components use the centralized configuration!

## User Experience Improvements

1. **Clear Visual Feedback**
   - Loading spinner during upload
   - Progress messages
   - Success/error notifications

2. **Error Handling**
   - Graceful failure handling
   - Informative error messages
   - Book creation continues even if TTS fails

3. **Input Validation**
   - Starting page number must be >= 1
   - PDF file type validation
   - Required field validation

4. **Accessibility**
   - Helper text for starting page number
   - Clear labels for all fields
   - Keyboard navigation support

## Testing Checklist

- [ ] Upload book with PDF and default starting page (1)
- [ ] Upload book with PDF and custom starting page (e.g., 5)
- [ ] Upload book without PDF (metadata only)
- [ ] Test with large PDF files
- [ ] Test error handling when TTS service is down
- [ ] Test error handling when backend API is down
- [ ] Verify loading overlay appears and disappears correctly
- [ ] Verify success/error messages appear
- [ ] Test with different grades and book types
- [ ] Verify book appears in dashboard after upload

## Future Enhancements

1. **Upload Progress**
   - Show percentage complete for large files
   - Estimated time remaining

2. **Batch Upload**
   - Upload multiple books at once
   - Queue management

3. **Preview**
   - Preview PDF before upload
   - Preview generated TTS audio samples

4. **Validation**
   - Check for duplicate books
   - Validate PDF structure before upload

5. **History**
   - Track upload history
   - Retry failed uploads
   - View processing logs

## Notes

- The TTS service endpoint (`/api/tts_service`) must be running for PDF processing
- Book records can be created without PDF processing
- All URLs are configurable via environment variables
- The implementation uses async/await for better error handling
- File uploads use FormData for multipart encoding
