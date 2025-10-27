# Quick Start Guide - Frontend-Backend Integration

## Prerequisites

- Node.js 14+ installed
- PostgreSQL 12+ installed locally or via Docker
- AWS credentials configured (optional, for S3)

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
# From project root
npm install
```

### 2. Start Frontend Development Server
```bash
npm start
```
- Frontend will run on `http://localhost:3000`
- Environment variable: `REACT_APP_API_URL=http://localhost:5000/api`

### 3. Test Frontend
```bash
npm test
```

## Backend Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup Options

#### Option A: Using Docker Compose (Recommended)
```bash
# From project root
docker-compose up -d
```
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`
- Default user: `postgres` / password: `postgres`

#### Option B: Local PostgreSQL
```bash
# Ensure PostgreSQL is running on localhost:5432
# Update DATABASE_URL in .env file if needed
```

### 3. Configure Backend Environment
```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/right_to_read
# AWS_REGION=us-east-1
# AWS_BUCKET_NAME=right-to-read-bucket
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 4. Initialize Database
```bash
cd backend
npm run init-db
```
- This creates tables and initializes the schema

### 5. Start Backend Development Server
```bash
cd backend
npm run dev
```
- Backend will run on `http://localhost:5000`
- API available at `http://localhost:5000/api`

## Testing the Integration

### Test 1: Login and View Dashboard
```
1. Navigate to http://localhost:3000
2. Login with any email/password (demo mode)
3. Dashboard should show books from API
4. Check browser DevTools > Network tab for /api/books request
```

### Test 2: Analytics Dashboard
```
1. Click "Analytics" in sidebar
2. Charts should load with data from /api/analytics/stats
3. Grade-based chart should show book distribution
```

### Test 3: Digital Version Review
```
1. Click "Digital Review" in sidebar
2. Pending books should load from API
3. Select a book to view its details
```

### Test 4: Add New Book
```
1. Click the "+" button in toolbar
2. Fill in book details
3. Click "Add Book"
4. New book appears in list (POST to /api/books)
```

## API Endpoints Reference

### Books Endpoints
```
GET    /api/books              - Get all books
GET    /api/books?grade=Grade+3 - Get books by grade
GET    /api/books/:id          - Get specific book
POST   /api/books              - Create new book
PUT    /api/books/:id          - Update book
DELETE /api/books/:id          - Delete book
GET    /api/books/stats/count  - Get total books count
```

### Analytics Endpoints
```
GET  /api/analytics              - Get all analytics
POST /api/analytics              - Record new analytics
GET  /api/analytics/book/:bookId - Analytics for book
GET  /api/analytics/school/:name - Analytics for school
GET  /api/analytics/stats        - Overall statistics
GET  /api/analytics/stats/books  - Stats by book/grade
GET  /api/analytics/stats/schools - Stats by school
GET  /api/analytics/range        - Date-range analytics
```

## Troubleshooting

### Frontend shows "Select a book to review" but no books loading

**Check:**
1. Is backend server running? (http://localhost:5000/api/health)
2. Are database tables created? (Check PgAdmin)
3. Check browser console for error messages
4. Check backend console for errors

### API connection refused

**Solution:**
1. Ensure backend is running: `npm run dev` in backend folder
2. Check environment variable: `REACT_APP_API_URL` in `.env.local`
3. Verify backend listening on port 5000

### Database connection error

**Solution:**
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `backend/.env`
3. Verify credentials are correct
4. Test connection: `psql postgresql://user:password@localhost:5432/right_to_read`

### "Cannot GET /api/books" error

**Solution:**
1. Backend routes not initialized
2. Run: `npm run dev` to start dev server with hot reload
3. Check `backend/src/server.ts` for route registration

## Development Workflow

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
npm start
```

### Terminal 3: Database (Optional)
```bash
# For Docker Compose
docker-compose up -d
docker-compose logs -f postgres
```

## Production Deployment

### Frontend Build
```bash
npm run build
# Creates optimized build in build/ folder
```

### Backend Deployment
```bash
cd backend
npm run build
npm start  # Runs compiled JavaScript
```

## Environment Files Reference

### `.env.local` (Frontend)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### `backend/.env` (Backend)
```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/right_to_read
AWS_REGION=us-east-1
AWS_BUCKET_NAME=right-to-read-bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
NODE_ENV=development
```

## Useful Commands

### Frontend
```bash
npm start              # Start dev server
npm test               # Run tests
npm run build          # Build for production
npm run eject          # Eject from CRA (not reversible)
```

### Backend
```bash
npm run dev            # Start with hot reload
npm run build          # Compile TypeScript
npm start              # Run compiled app
npm run init-db        # Initialize database schema
npm test               # Run tests
```

### Docker
```bash
docker-compose up -d         # Start all services
docker-compose down          # Stop all services
docker-compose logs -f       # View logs
docker-compose ps            # List containers
```

## Support

For issues:
1. Check console logs (browser DevTools)
2. Check backend logs (terminal running `npm run dev`)
3. Check database logs if using Docker
4. Verify all environment variables are set correctly

