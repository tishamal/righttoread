# API Contract Documentation

## Overview
This document defines the API contract between the React frontend and Express.js backend. All endpoints use JSON for request/response bodies.

## Base URL
```
http://localhost:5000/api
```

## Response Format
All endpoints return responses in this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

---

## Books Endpoints

### GET /api/books
Get all books, optionally filtered by grade.

**Query Parameters:**
- `grade` (optional): Grade filter (e.g., "Grade 3", "Grade 10")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "English Student Handbook - Grade 3",
      "author": "Ministry of Education Sri Lanka",
      "grade": "Grade 3",
      "subject": "English",
      "published_by_nie": true,
      "year_published": 2023,
      "description": "Student handbook for Grade 3",
      "status": "draft|pending|approved|published",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Invalid query parameters
- 500: Server error

---

### GET /api/books/:id
Get a specific book by ID.

**Path Parameters:**
- `id` (required): Book ID (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "English Student Handbook - Grade 3",
    "author": "Ministry of Education Sri Lanka",
    "grade": "Grade 3",
    "subject": "English",
    "published_by_nie": true,
    "year_published": 2023,
    "description": "Student handbook for Grade 3",
    "status": "draft",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- 200: Success
- 404: Book not found
- 500: Server error

---

### POST /api/books
Create a new book.

**Request Body:**
```json
{
  "title": "English Student Handbook - Grade 3",
  "author": "Ministry of Education Sri Lanka",
  "grade": "Grade 3",
  "subject": "English",
  "published_by_nie": true,
  "year_published": 2023,
  "description": "Student handbook for Grade 3",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "English Student Handbook - Grade 3",
    "author": "Ministry of Education Sri Lanka",
    "grade": "Grade 3",
    "subject": "English",
    "published_by_nie": true,
    "year_published": 2023,
    "description": "Student handbook for Grade 3",
    "status": "draft",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- 201: Created
- 400: Invalid data
- 500: Server error

---

### PUT /api/books/:id
Update a book.

**Path Parameters:**
- `id` (required): Book ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Title",
    "author": "Ministry of Education Sri Lanka",
    "grade": "Grade 3",
    "subject": "English",
    "published_by_nie": true,
    "year_published": 2023,
    "description": "Student handbook for Grade 3",
    "status": "approved",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T11:45:00Z"
  }
}
```

**Status Codes:**
- 200: Success
- 404: Book not found
- 400: Invalid data
- 500: Server error

---

### DELETE /api/books/:id
Delete a book.

**Path Parameters:**
- `id` (required): Book ID

**Response:**
```json
{
  "success": true,
  "data": null
}
```

**Status Codes:**
- 200: Success
- 404: Book not found
- 500: Server error

---

### GET /api/books/stats/count
Get total number of books.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 42
  }
}
```

**Status Codes:**
- 200: Success
- 500: Server error

---

## Analytics Endpoints

### POST /api/analytics
Record a new analytics event (called by mobile apps).

**Request Body:**
```json
{
  "book_id": "1",
  "user_id": "user_123",
  "school_name": "ABC School",
  "reading_time_minutes": 15,
  "pages_read": 5,
  "audio_played": true,
  "interaction_type": "page_turn"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "book_id": "1",
    "user_id": "user_123",
    "school_name": "ABC School",
    "reading_time_minutes": 15,
    "pages_read": 5,
    "audio_played": true,
    "interaction_type": "page_turn",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- 201: Created
- 400: Invalid data
- 500: Server error

---

### GET /api/analytics/book/:bookId
Get analytics for a specific book.

**Path Parameters:**
- `bookId` (required): Book ID

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "book_id": "1",
      "user_id": "user_123",
      "school_name": "ABC School",
      "reading_time_minutes": 15,
      "pages_read": 5,
      "audio_played": true,
      "interaction_type": "page_turn",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 404: Book not found
- 500: Server error

---

### GET /api/analytics/school/:schoolName
Get analytics for a specific school.

**Path Parameters:**
- `schoolName` (required, URL encoded): School name

**Query Parameters:**
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "book_id": "1",
      "user_id": "user_123",
      "school_name": "ABC School",
      "reading_time_minutes": 15,
      "pages_read": 5,
      "audio_played": true,
      "interaction_type": "page_turn",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 404: School not found
- 500: Server error

---

### GET /api/analytics/stats
Get overall statistics (used by Analytics Dashboard).

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1250,
    "total_downloads": 8934,
    "total_views": 45678,
    "active_sessions": 127,
    "average_reading_time": 32,
    "total_schools": 42
  }
}
```

**Status Codes:**
- 200: Success
- 500: Server error

---

### GET /api/analytics/stats/books
Get statistics grouped by book/grade.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "book_id": "1",
      "title": "English Student Handbook - Grade 3",
      "grade": "Grade 3",
      "total_views": 4500,
      "total_downloads": 1200,
      "average_reading_time": 28,
      "users_count": 450
    },
    {
      "book_id": "2",
      "title": "English Student Handbook - Grade 4",
      "grade": "Grade 4",
      "total_views": 5200,
      "total_downloads": 1400,
      "average_reading_time": 32,
      "users_count": 520
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 500: Server error

---

### GET /api/analytics/stats/schools
Get statistics grouped by school.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "school_name": "ABC School",
      "total_views": 12000,
      "total_downloads": 3000,
      "users_count": 300,
      "average_reading_time": 35
    },
    {
      "school_name": "XYZ School",
      "total_views": 9500,
      "total_downloads": 2100,
      "users_count": 250,
      "average_reading_time": 28
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 500: Server error

---

### GET /api/analytics/range
Get analytics for a date range.

**Query Parameters:**
- `startDate` (required): ISO format date (e.g., 2025-01-01T00:00:00Z)
- `endDate` (required): ISO format date (e.g., 2025-01-31T23:59:59Z)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "book_id": "1",
      "user_id": "user_123",
      "school_name": "ABC School",
      "reading_time_minutes": 15,
      "pages_read": 5,
      "audio_played": true,
      "interaction_type": "page_turn",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Invalid date format
- 500: Server error

---

## Data Types

### Book
```typescript
{
  id: string;                  // UUID v4
  title: string;              // Max 255 characters
  author: string;             // Max 255 characters
  grade: string;              // "Grade 3" to "Grade 10"
  subject: string;            // "English"
  published_by_nie: boolean;  // Is NIE published
  year_published?: number;    // Year of publication
  description?: string;       // Full text description
  status: string;             // "draft" | "pending" | "approved" | "published"
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
}
```

### Analytics
```typescript
{
  id: string;                      // UUID v4
  book_id: string;                 // Foreign key to books
  user_id?: string;               // Optional user identifier
  school_name: string;            // School name
  reading_time_minutes: number;   // Minutes spent reading
  pages_read: number;             // Number of pages read
  audio_played: boolean;          // Whether audio was used
  interaction_type?: string;      // Type of interaction
  created_at: string;             // ISO timestamp
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "data": null,
  "error": "Description of what went wrong"
}
```

### Common Error Messages
- "Invalid request body" - 400
- "Book not found" - 404
- "School not found" - 404
- "Invalid date format" - 400
- "Internal server error" - 500

---

## Pagination

For endpoints that support pagination:
- Use `limit` and `offset` query parameters
- Default `limit`: 100, Max: 1000
- Default `offset`: 0

Example:
```
GET /api/analytics/book/1?limit=50&offset=0
```

---

## Rate Limiting

(Optional - to be implemented)
- X-RateLimit-Limit: 1000
- X-RateLimit-Remaining: 999
- X-RateLimit-Reset: 1609459200

---

## CORS Configuration

- Allowed Origins: `http://localhost:3000` (development)
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization
- Credentials: Include

---

## Testing the API

### Using cURL

```bash
# Get all books
curl http://localhost:5000/api/books

# Get books by grade
curl "http://localhost:5000/api/books?grade=Grade+3"

# Get specific book
curl http://localhost:5000/api/books/1

# Create new book
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Book",
    "author": "Author Name",
    "grade": "Grade 3",
    "subject": "English",
    "published_by_nie": true,
    "year_published": 2024
  }'

# Record analytics
curl -X POST http://localhost:5000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "1",
    "school_name": "ABC School",
    "reading_time_minutes": 15,
    "pages_read": 5,
    "audio_played": true
  }'

# Get analytics stats
curl http://localhost:5000/api/analytics/stats
```

### Using Postman

1. Import the API collection (create collection with provided endpoint details)
2. Set environment variables:
   - `base_url`: http://localhost:5000/api
3. Test each endpoint individually
4. Use pre-request scripts for dynamic data

---

## Implementation Checklist

- [ ] Implement Books CRUD endpoints
- [ ] Implement Analytics recording endpoint
- [ ] Implement Analytics query endpoints
- [ ] Add database schema migration
- [ ] Add input validation
- [ ] Add error handling middleware
- [ ] Add CORS middleware
- [ ] Add logging middleware
- [ ] Add request/response compression
- [ ] Add rate limiting (optional)
- [ ] Add authentication (optional)
- [ ] Test all endpoints with frontend

