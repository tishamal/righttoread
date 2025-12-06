# Quick Start Guide - Book Upload Feature

## For Developers

### Setting Up

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Configure URLs in `.env`**
   ```bash
   REACT_APP_BACKEND_API_URL=http://localhost:8080/api
   REACT_APP_TTS_SERVICE_URL=http://localhost:8080/api
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the app**
   ```bash
   npm start
   ```

### Important Files

- **`src/config/apiConfig.ts`** - All API endpoints (CHANGE URLS HERE)
- **`src/services/api.ts`** - API service functions
- **`src/components/AddBookModal.tsx`** - Upload form UI
- **`src/App.tsx`** - Main app with upload logic

## For Users

### Uploading a Book

1. **Click "Create Book"** button in the dashboard

2. **Fill in book details:**
   - Name of the Book *
   - Grade *
   - Is the Book Published by NIE?
   - Author *
   - Year of Published
   - Starting Page Number (default: 1)
   - Description

3. **Upload PDF:**
   - Click the upload area or drag & drop
   - Only PDF files accepted
   - Max size: 50MB

4. **Set Starting Page Number:**
   - Default is 1 (process entire book)
   - Set to 5 to start from page 5
   - Useful for resuming interrupted processing

5. **Click "Save Book"**
   - Wait for processing (may take several minutes)
   - You'll see a success message when done

### What Happens During Upload

1. ✅ **PDF Validation** - File type and size checked
2. 🔄 **TTS Processing** - PDF converted to audio blocks
3. 💾 **Database Save** - Book metadata saved
4. ✨ **Complete** - Book appears in dashboard

### Troubleshooting

**"Upload failed with status: 500"**
- TTS service may be down
- Check if Python backend is running
- Check PDF file isn't corrupted

**"Failed to create book"**
- Node.js backend may be down
- Check database connection
- Check network connectivity

**Book created but no TTS**
- TTS processing failed but book record saved
- Try uploading the PDF again from book details

**Loading takes too long**
- Large PDFs take time (normal)
- Don't close the window
- Check browser console for progress

## For DevOps

### Production Deployment

1. **Set production URLs in `.env`:**
   ```bash
   REACT_APP_BACKEND_API_URL=https://api.production.com/api
   REACT_APP_TTS_SERVICE_URL=https://tts.production.com/api
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Deploy `build/` folder** to your hosting service

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_BACKEND_API_URL` | Node.js backend | `http://localhost:8080/api` |
| `REACT_APP_TTS_SERVICE_URL` | Python TTS service | `http://localhost:8080/api` |

### CORS Configuration

Ensure backend allows requests from frontend domain:

```javascript
// Backend server.ts
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourapp.com'],
  credentials: true
}));
```

### Health Checks

- Backend: `GET http://localhost:8080/health`
- TTS Service: `GET http://localhost:8080/api/health`

## API Reference

### Upload Book for TTS Processing

**Endpoint:** `POST /api/tts_service`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `pdf_file` (File, required) - The PDF file
- `starting_page_number` (Integer, optional) - Starting page (default: 1)

**Response:**
```json
{
  "status": "success",
  "message": "TTS processing completed",
  "book_name": "grade_3_english_book",
  "starting_page": 1,
  "total_pages_processed": 70,
  "local_files": {
    "output_directory": "output/grade_3_english_book-...",
    "zip_file_path": "output/grade_3_english_book.zip",
    "dictionary_path": "output/grade_3_english_book_dictionary.json"
  }
}
```

### Create Book Record

**Endpoint:** `POST /api/books`

**Content-Type:** `application/json`

**Body:**
```json
{
  "title": "English Student Handbook",
  "author": "Ministry of Education",
  "grade": "Grade 3",
  "subject": "English",
  "description": "Student handbook for grade 3",
  "published_by_nie": true,
  "year_published": 2024,
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "English Student Handbook",
    ...
  }
}
```
