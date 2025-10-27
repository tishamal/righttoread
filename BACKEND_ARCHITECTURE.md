# Backend Architecture Overview

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # PostgreSQL connection
│   │   ├── s3.ts            # AWS S3 configuration
│   │   └── initDb.ts        # Database initialization
│   ├── models/
│   │   ├── book.ts          # Book data model
│   │   └── analytics.ts     # Analytics data model
│   ├── routes/
│   │   ├── books.ts         # Book API endpoints
│   │   └── analytics.ts     # Analytics API endpoints
│   ├── middleware/
│   │   └── (auth middleware)
│   └── server.ts            # Express server entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Database Schema

### Tables Created

1. **users** - Admin users
   - id, email, password_hash, name, role, created_at, updated_at

2. **books** - Book metadata
   - id, title, grade, subject, author, description, status, created_at, updated_at

3. **pages** - Book pages
   - id, book_id, page_number, created_at, updated_at

4. **paragraphs** - Text paragraphs with SSML
   - id, page_id, text, ssml_text, audio_s3_key, paragraph_order, created_at, updated_at

5. **digital_versions** - Version control for digital books
   - id, book_id, status, approval_notes, approved_by, approved_at, created_at, updated_at

6. **analytics** - Usage analytics from mobile apps
   - id, book_id, user_id, school_name, reading_time_minutes, pages_read, audio_played, interaction_type, created_at

## API Endpoints

### Books API (`/api/books`)

- `GET /` - Get all books (with optional grade filter)
- `GET /:id` - Get book by ID
- `GET /grade/:grade` - Get books by grade
- `GET /stats/count` - Get total book count
- `POST /` - Create book
- `PUT /:id` - Update book
- `DELETE /:id` - Delete book

### Analytics API (`/api/analytics`)

- `POST /` - Record analytics event
- `GET /book/:bookId` - Get analytics for specific book
- `GET /school/:schoolName` - Get analytics for school
- `GET /stats/books` - Get book usage statistics
- `GET /stats/schools` - Get school usage statistics
- `GET /range` - Get analytics for date range

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 12+
- **File Storage**: AWS S3
- **Authentication**: JWT (prepared)
- **CORS**: Enabled for frontend integration

## Key Features

✅ **Book Management**
- CRUD operations for books
- Filter by grade (3-10)
- Track book status (draft, pending, approved, published)

✅ **Digital Version Review**
- Page-by-page structure
- Paragraph-level SSML and audio management
- Digital version approval workflow

✅ **Analytics Tracking**
- Record usage from mobile apps
- Track reading time, pages read, audio usage
- Generate statistics by book or school
- Date range queries

✅ **S3 Integration**
- SSML files stored in S3
- Audio files stored in S3
- Organized folder structure
- Public access for media files

✅ **Database Features**
- Automatic table creation on startup
- Indexes for performance optimization
- Foreign key relationships
- Timestamps for audit trail

## Setup Steps

1. **Install Dependencies** (in backend directory)
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update database credentials
   - Add AWS S3 credentials

3. **Setup Database**
   - Using Docker: `docker-compose up -d`
   - Or manual PostgreSQL installation

4. **Start Server**
   - Development: `npm run dev`
   - Production: `npm run build && npm start`

5. **Database Initialization**
   - Runs automatically on server start
   - Creates all required tables and indexes

## Frontend Integration

Update React components to use the API:

```typescript
// Get books from backend
const fetchBooks = async () => {
  const response = await fetch('http://localhost:5000/api/books');
  return response.json();
};

// Send analytics to backend
const recordAnalytics = async (data) => {
  return fetch('http://localhost:5000/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};
```

## Security Considerations

- JWT authentication for admin users
- Password hashing with bcryptjs
- CORS configuration
- Input validation
- SQL injection prevention (using parameterized queries)
- Environment variables for sensitive data

## Scalability Features

- Database indexes on frequently queried fields
- Connection pooling for database
- S3 for unlimited file storage
- Stateless server design for horizontal scaling

## Performance Optimizations

- Database indexes on grade, book_id, created_at
- Connection pooling
- S3 for efficient file serving
- Aggregate queries for statistics

## Next Steps

1. Connect frontend to backend APIs
2. Add authentication endpoints
3. Implement file upload to S3
4. Add more validation and error handling
5. Deploy to production environment
