# Right to Read Backend API

Backend service for the Right to Read Admin Dashboard with PostgreSQL database integration and AWS S3 storage.

## Features

- **PostgreSQL Database**: Books, analytics, users, and digital version metadata
- **AWS S3 Integration**: Store SSML and audio files
- **REST API**: Complete CRUD operations for books and analytics
- **TypeScript**: Fully typed codebase

## Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- AWS Account with S3 bucket
- AWS Access Keys

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=right_to_read

PORT=5000
NODE_ENV=development

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
```

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE right_to_read;
```

2. The database tables will be created automatically on first run.

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/grade/:grade` - Get books by grade
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/stats/count` - Get total book count

### Analytics
- `POST /api/analytics` - Record analytics event
- `GET /api/analytics/book/:bookId` - Get analytics for a book
- `GET /api/analytics/school/:schoolName` - Get analytics for a school
- `GET /api/analytics/stats/books` - Get book usage statistics
- `GET /api/analytics/stats/schools` - Get school usage statistics
- `GET /api/analytics/range` - Get analytics for date range

## Database Schema

### Books Table
```sql
- id (UUID, Primary Key)
- title (VARCHAR)
- grade (VARCHAR) - Grade 3-10
- subject (VARCHAR) - English
- author (VARCHAR)
- description (TEXT)
- published_by_nie (BOOLEAN)
- year_published (INTEGER)
- status (VARCHAR) - draft, pending, approved, published
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Analytics Table
```sql
- id (UUID, Primary Key)
- book_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- school_name (VARCHAR)
- reading_time_minutes (INTEGER)
- pages_read (INTEGER)
- audio_played (BOOLEAN)
- interaction_type (VARCHAR)
- created_at (TIMESTAMP)
```

### S3 File Structure

SSML and audio files are stored in S3 with the following structure:
```
s3://bucket-name/
  ├── ssml/
  │   └── {book_id}/{page_number}/{paragraph_id}.xml
  └── audio/
      └── {book_id}/{page_number}/{paragraph_id}.mp3
```

## Error Handling

All endpoints return JSON responses:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Development

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Jest for testing

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy `dist/` folder to your server

3. Set environment variables on production server

4. Run migrations and start the server
