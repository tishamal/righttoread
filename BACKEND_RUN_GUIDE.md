# 🚀 Backend Setup & Running Guide

## Current Status
✅ Frontend is ready and compiled successfully  
⚠️ Backend needs to be started to load books from database  
⚠️ PostgreSQL database needs to be running

---

## Step 1: Start PostgreSQL Database

### Option A: Using Docker (Recommended)
```powershell
docker-compose up -d
```

**Wait for:**
```
✓ PostgreSQL container started on localhost:5432
✓ PgAdmin running on http://localhost:5050
```

### Option B: Local PostgreSQL
Ensure PostgreSQL is installed and running locally on port 5432

**Test connection:**
```powershell
psql -U postgres -h localhost -c "SELECT 1"
```

---

## Step 2: Create Database & Schema

### Initialize the database
```powershell
cd "d:\MyProjects\Right to Read\backend"
npm run init-db
```

**Expected output:**
```
✓ Database 'right_to_read' created
✓ Tables created successfully
✓ Schema initialized
```

### Verify database was created
```powershell
psql -U postgres -d right_to_read -c "\dt"
```

**Should show tables:**
```
users
books
pages
paragraphs
digital_versions
analytics
```

---

## Step 3: Insert Sample Books (Optional)

### Connect to database
```powershell
psql -U postgres -d right_to_read
```

### Insert sample books
```sql
INSERT INTO books (title, author, grade, subject, published_by_nie, year_published, description, status)
VALUES 
  ('English Student Handbook - Grade 3', 'Ministry of Education Sri Lanka', 'Grade 3', 'English', true, 2023, 'Student handbook for Grade 3', 'published'),
  ('English Student Handbook - Grade 4', 'Ministry of Education Sri Lanka', 'Grade 4', 'English', true, 2023, 'Student handbook for Grade 4', 'published'),
  ('English Student Handbook - Grade 5', 'Ministry of Education Sri Lanka', 'Grade 5', 'English', true, 2023, 'Student handbook for Grade 5', 'published');
```

### Verify books were inserted
```sql
SELECT id, title, grade, status FROM books;
```

---

## Step 4: Install Backend Dependencies

```powershell
cd "d:\MyProjects\Right to Read\backend"
npm install
```

**Expected packages installed:**
- express
- postgresql (pg)
- cors
- uuid
- aws-sdk (optional)

---

## Step 5: Start Backend Server

### Development mode with hot reload
```powershell
cd "d:\MyProjects\Right to Read\backend"
npm run dev
```

**Expected output:**
```
Server running on port 5000
Database connected successfully
✓ Backend ready for requests
```

**Keep this terminal open!**

---

## Step 6: Start Frontend Application

### In a NEW terminal
```powershell
cd "d:\MyProjects\Right to Read"
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the app in your browser.
Local: http://localhost:3000
```

**Browser will open automatically to http://localhost:3000**

---

## Step 7: Test Books Loading from Database

### In the browser (http://localhost:3000)
1. **Login** with any email/password
2. **Dashboard** should load
3. **Books should appear** from the database

### Verify in DevTools
1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Look for request: `GET http://localhost:5000/api/books`
4. Response should show books from database

**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "English Student Handbook - Grade 3",
      "grade": "Grade 3",
      "status": "published",
      "author": "Ministry of Education Sri Lanka",
      ...
    }
  ]
}
```

---

## Terminal Setup (Recommended)

You need **3 terminal windows open at the same time**:

### Terminal 1: PostgreSQL Database
```powershell
docker-compose up
```
**Don't close this - keeps database running**

### Terminal 2: Backend Server
```powershell
cd backend
npm run dev
```
**Don't close this - keeps API running**

### Terminal 3: Frontend Application
```powershell
npm start
```
**This will open browser automatically**

---

## Quick Troubleshooting

### Problem: "Cannot connect to database"
**Solution:**
```powershell
# Check if Docker is running
docker ps

# Start Docker if needed
docker-compose up -d

# Test connection
psql -U postgres -c "SELECT 1"
```

### Problem: "Backend connection refused"
**Solution:**
```powershell
# Verify backend is running
curl http://localhost:5000/api/books

# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process
taskkill /PID <process_id> /F

# Restart backend
cd backend
npm run dev
```

### Problem: "Books not loading"
**Solution:**
1. Check backend console for errors
2. Check DevTools Network tab for `/api/books` request
3. Verify database has books:
   ```sql
   SELECT COUNT(*) FROM books;
   ```
4. Check .env.local has correct API URL:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Problem: "Database tables not found"
**Solution:**
```powershell
# Initialize database schema
cd backend
npm run init-db

# Verify tables exist
psql -U postgres -d right_to_read -c "\dt"
```

---

## Complete Startup Sequence

### First Time Setup
```powershell
# 1. Terminal 1 - Start Database
docker-compose up -d

# 2. Terminal 2 - Initialize Backend
cd backend
npm install
npm run init-db

# 3. Terminal 2 - Start Backend
npm run dev

# 4. Terminal 3 - Start Frontend
npm start
```

### Subsequent Startups
```powershell
# Terminal 1
docker-compose up -d

# Terminal 2
cd backend
npm run dev

# Terminal 3
npm start
```

---

## Verifying Everything Works

### 1. Database is running
```powershell
docker ps
# Should show: postgres container is up
```

### 2. Backend is running
```powershell
curl http://localhost:5000/api/books
# Should return JSON with books
```

### 3. Frontend is running
- Open http://localhost:3000 in browser
- Should not see 404 errors

### 4. Integration is working
1. Login to frontend
2. See books in dashboard
3. Check DevTools Network tab for API calls

---

## Environment Variables

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=right_to_read
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/right_to_read
PORT=5000
NODE_ENV=development
```

---

## Database Management

### Access Database UI (PgAdmin)
```
URL: http://localhost:5050
Email: admin@admin.com
Password: admin
```

### Connect in PgAdmin
1. Right-click "Servers" → Register → Server
2. Name: `right_to_read`
3. Host: `postgres`
4. Port: `5432`
5. Username: `postgres`
6. Password: `postgres`
7. Click "Save"

### View Books in PgAdmin
1. Navigate to: Servers → right_to_read → Databases → right_to_read → Schemas → public → Tables → books
2. Right-click → View/Edit Data → All Rows

---

## Common Commands

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker-compose logs postgres` |
| Connect to DB | `psql -U postgres -d right_to_read` |
| Install backend deps | `cd backend && npm install` |
| Initialize DB schema | `cd backend && npm run init-db` |
| Start backend | `cd backend && npm run dev` |
| Start frontend | `npm start` |
| Build frontend | `npm run build` |
| Test API endpoint | `curl http://localhost:5000/api/books` |

---

## Next Steps

1. ✅ Start PostgreSQL: `docker-compose up -d`
2. ✅ Initialize database: `cd backend && npm run init-db`
3. ✅ Start backend: `npm run dev`
4. ✅ Start frontend: `npm start`
5. ✅ Verify books load from database
6. ⏭️ Test other features (Analytics, Digital Review)
7. ⏭️ Implement any missing API endpoints

---

## Need Help?

- Check **QUICKSTART.md** for detailed setup
- Check **DEVELOPER_CHECKLIST.md** for verification
- Check backend console for error messages
- Check DevTools Network tab to see API requests/responses

---

**Backend Status**: ⏳ Ready to start  
**Books Availability**: Depends on backend being started  
**Database Status**: Depends on PostgreSQL running

Start the services in order above and books will load! 🚀

