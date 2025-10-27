# Backend Setup Instructions

## Quick Start Guide

### Option 1: Using Docker (Recommended)

1. Install Docker and Docker Compose

2. Start PostgreSQL and PgAdmin:
```bash
docker-compose up -d
```

3. Access PgAdmin at `http://localhost:5050`
   - Email: admin@example.com
   - Password: admin

### Option 2: Manual PostgreSQL Setup

1. Install PostgreSQL 12+

2. Create database:
```sql
CREATE DATABASE right_to_read;
```

3. Create user:
```sql
CREATE USER right_to_read_user WITH PASSWORD 'secure_password';
ALTER ROLE right_to_read_user SET client_encoding TO 'utf8';
ALTER ROLE right_to_read_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE right_to_read_user SET default_transaction_deferrable TO on;
ALTER ROLE right_to_read_user SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE right_to_read TO right_to_read_user;
```

### Setup Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres_password
DB_NAME=right_to_read

# Server
PORT=5000
NODE_ENV=development

# AWS S3 (for SSML and audio files)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=right-to-read-bucket

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
```

5. Start development server:
```bash
npm run dev
```

Server will start at `http://localhost:5000`

## API Documentation

### Books Endpoints

**Get all books:**
```bash
curl http://localhost:5000/api/books
```

**Get books by grade:**
```bash
curl http://localhost:5000/api/books?grade=Grade%203
```

**Create a book:**
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "English Student Handbook - Grade 3",
    "grade": "Grade 3",
    "subject": "English",
    "author": "Ministry of Education",
    "status": "draft"
  }'
```

### Analytics Endpoints

**Record analytics:**
```bash
curl -X POST http://localhost:5000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "uuid",
    "school_name": "Colombo High School",
    "reading_time_minutes": 15,
    "pages_read": 5,
    "audio_played": true
  }'
```

**Get book usage stats:**
```bash
curl http://localhost:5000/api/analytics/stats/books
```

**Get school usage stats:**
```bash
curl http://localhost:5000/api/analytics/stats/schools
```

## AWS S3 Setup

1. Create S3 bucket: `right-to-read-bucket`

2. Set bucket policies to allow public read access for SSML and audio files

3. Create folder structure:
   - `ssml/` - For SSML text files
   - `audio/` - For audio files

4. Update `.env` with your AWS credentials

File structure in S3:
```
s3://right-to-read-bucket/
├── ssml/{book_id}/{page_number}/{paragraph_id}.xml
└── audio/{book_id}/{page_number}/{paragraph_id}.mp3
```

## Frontend Integration

In React components, use the API:

```typescript
// Get all books
const response = await fetch('http://localhost:5000/api/books');
const data = await response.json();

// Get analytics for a book
const analytics = await fetch('http://localhost:5000/api/analytics/book/{bookId}');

// Record usage analytics
await fetch('http://localhost:5000/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    book_id: bookId,
    school_name: 'School Name',
    reading_time_minutes: 15,
    pages_read: 5,
    audio_played: true
  })
});
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env`

### S3 Upload Error
- Verify AWS credentials
- Check S3 bucket name and region
- Ensure bucket policy allows uploads

### CORS Error
- Check that frontend and backend have proper CORS configuration
- Update backend CORS settings if needed

## Development Tips

- Use PgAdmin (http://localhost:5050) to manage database
- Check server logs for debugging
- Use Thunder Client or Postman for API testing

## Production Deployment

1. Build backend:
```bash
npm run build
```

2. Set environment variables on server

3. Install production dependencies:
```bash
npm install --production
```

4. Start server:
```bash
npm start
```

5. Use PM2 or similar for process management:
```bash
npm install -g pm2
pm2 start dist/server.js --name "right-to-read-api"
```
