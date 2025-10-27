# ✅ Loading Books from Database - Verification Checklist

## 🎯 Goal
Books should load from PostgreSQL database via the backend API when the frontend loads.

---

## 📋 Pre-Flight Checklist

### ✅ Frontend Code
- [x] API service layer exists: `src/services/api.ts`
- [x] `booksAPI.getAll()` method implemented
- [x] `App.tsx` has `useEffect` hook to fetch books
- [x] `.env.local` has correct API URL: `http://localhost:5000/api`
- [x] Error handling with fallback to sample data
- [x] Frontend compiles without errors

### ⚠️ Backend Requirements (MUST DO)
- [ ] Backend `.env` file created with database config
- [ ] Backend dependencies installed: `npm install`
- [ ] PostgreSQL database running (Docker or local)
- [ ] Database schema created: `npm run init-db`
- [ ] Sample books inserted into database
- [ ] Backend server started: `npm run dev`

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Start Database
```powershell
# PowerShell
cd "d:\MyProjects\Right to Read"
docker-compose up -d
```
**Wait for output:** `✓ container started`

### Step 2: Initialize Backend
```powershell
# PowerShell - NEW TERMINAL
cd "d:\MyProjects\Right to Read\backend"
npm install
npm run init-db
```

### Step 3: Start Backend
```powershell
# Same terminal
npm run dev
```

**Wait for output:**
```
Server running on port 5000
Database connected successfully
```

### Step 4: Start Frontend
```powershell
# PowerShell - NEW TERMINAL
cd "d:\MyProjects\Right to Read"
npm start
```

**Browser opens to:** `http://localhost:3000`

### Step 5: Verify in Browser
1. ✅ Login page appears
2. ✅ Login with any email/password
3. ✅ Dashboard loads
4. ✅ Books appear from database

---

## 🔍 Verification Steps

### In Browser (http://localhost:3000)

#### Step 1: Check Network Requests
1. Open **DevTools** (F12 or Ctrl+Shift+I)
2. Go to **Network** tab
3. Refresh page (Ctrl+R)
4. Look for request: `GET http://localhost:5000/api/books`
5. Response should show books from database

#### Step 2: Check Console
1. Open **DevTools Console** (F12 → Console)
2. Should see NO errors about API connection
3. May see sample data warning if API is down (which is OK)

#### Step 3: Visual Verification
- Books appear in dashboard grid
- Books have correct titles (Grade 3, 4, 5, etc.)
- Books are from database, not just sample data

---

## 📊 Expected Behavior

### When Everything Works ✅
```
Frontend              Backend              Database
   ↓                    ↓                      ↓
 Login            GET /api/books           Query
   ↓                    ↓                      ↓
Dashboard         Connect to DB          Return books
   ↓                    ↓                      ↓
 Display       Return JSON response        (SQL)
  Books        with books from DB
```

### Network Request Shows:
```
Method: GET
URL: http://localhost:5000/api/books
Status: 200 OK
Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "English Student Handbook - Grade 3",
      "grade": "Grade 3",
      "status": "published",
      "author": "Ministry of Education Sri Lanka"
    },
    ...
  ]
}
```

### Dashboard Shows:
- Books from database appear in cards
- Each book shows: Title, Author, Grade, Status
- No "Select a book to review" empty state
- Proper book images and information

---

## 🐛 Troubleshooting

### Problem 1: "Cannot GET /api/books" Error
**Cause:** Backend server is not running

**Fix:**
```powershell
# Check if backend process is running
Get-Process | findstr node

# If not running:
cd backend
npm run dev
```

**Verify:**
```powershell
curl http://localhost:5000/api/books
# Should return JSON, not error
```

---

### Problem 2: Database Connection Error
**Cause:** PostgreSQL not running or wrong credentials

**Fix:**
```powershell
# Check if Docker container is running
docker ps | findstr postgres

# If not running:
docker-compose up -d

# Or test local PostgreSQL:
psql -U postgres -h localhost
```

**Verify:**
```powershell
# Check database exists
psql -U postgres -l | findstr right_to_read

# Check books table has data
psql -U postgres -d right_to_read -c "SELECT COUNT(*) FROM books;"
```

---

### Problem 3: Books Show Empty or Sample Data
**Cause:** Backend can't connect to database OR no books in database

**Fix:**
```powershell
# Check database has books
psql -U postgres -d right_to_read -c "SELECT * FROM books;"

# If empty, insert sample books
psql -U postgres -d right_to_read -c "
INSERT INTO books (title, author, grade, subject, published_by_nie, year_published, description, status)
VALUES 
  ('English Student Handbook - Grade 3', 'Ministry of Education Sri Lanka', 'Grade 3', 'English', true, 2023, 'Grade 3', 'published'),
  ('English Student Handbook - Grade 4', 'Ministry of Education Sri Lanka', 'Grade 4', 'English', true, 2023, 'Grade 4', 'published'),
  ('English Student Handbook - Grade 5', 'Ministry of Education Sri Lanka', 'Grade 5', 'English', true, 2023, 'Grade 5', 'published');
"

# Verify insertion
psql -U postgres -d right_to_read -c "SELECT COUNT(*) FROM books;"
```

**Verify backend sees the data:**
```powershell
curl http://localhost:5000/api/books
```

---

### Problem 4: Frontend Can't Connect to Backend
**Cause:** Wrong API URL or CORS issue

**Fix - Check .env.local:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**If changed, restart frontend:**
```powershell
npm start
```

---

### Problem 5: "Port 5000 Already in Use"
**Cause:** Another process using port 5000

**Fix:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID 12345 /F

# Restart backend
npm run dev
```

---

## 📈 Data Flow Verification

### 1. Database Level
```powershell
# Connect to database
psql -U postgres -d right_to_read

# View tables
\dt

# Check books table
SELECT COUNT(*) FROM books;
SELECT id, title, grade, status FROM books LIMIT 5;
```

**Expected:**
```
 id | title | grade | status
----|-------|-------|----------
 1  | ...   | Gr 3  | published
```

### 2. Backend API Level
```powershell
# Test API endpoint
curl http://localhost:5000/api/books

# Should return JSON with books
```

**Expected:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "title": "...", "grade": "Grade 3", ... }
  ]
}
```

### 3. Frontend Level
1. Open http://localhost:3000
2. DevTools Network tab shows GET `/api/books` with 200 status
3. Response shows books from database
4. Dashboard displays books

---

## ✨ Success Indicators

You know it's working when:

- ✅ Browser shows books on dashboard
- ✅ DevTools Network shows `/api/books` request with 200 status
- ✅ Response JSON contains multiple books
- ✅ Books have correct titles and information
- ✅ No console errors about API connection
- ✅ Books persist if you refresh page (from DB, not session)

---

## 🔧 Maintenance Commands

### Check What's Running
```powershell
# Database
docker ps

# Backend process
Get-Process | findstr node

# Check ports
netstat -ano | findstr :5000
netstat -ano | findstr :5432
```

### Restart Everything
```powershell
# Stop all
docker-compose down
Get-Process | where {$_.ProcessName -eq "node"} | Stop-Process

# Start all
docker-compose up -d
cd backend; npm run dev  # Terminal 2
npm start                # Terminal 3
```

### Reset Database
```powershell
# Stop backend
# Stop database
docker-compose down

# Remove volume (data will be deleted!)
docker volume rm right-to-read_postgres_data

# Restart fresh
docker-compose up -d
cd backend
npm run init-db
npm run dev
```

---

## 📝 Checklist for Confirmation

Once you complete the setup, confirm these points:

### Database Setup ✅
- [ ] PostgreSQL running (docker ps shows postgres)
- [ ] Database exists (psql shows right_to_read)
- [ ] Tables exist (psql \dt shows tables)
- [ ] Books exist (psql SELECT COUNT shows > 0)

### Backend Setup ✅
- [ ] Backend dependencies installed (backend/node_modules exists)
- [ ] Backend started (npm run dev shows "Server running on port 5000")
- [ ] Database connected (no connection errors in logs)
- [ ] API responds (curl http://localhost:5000/api/books returns JSON)

### Frontend Setup ✅
- [ ] Frontend dependencies installed (node_modules exists)
- [ ] Frontend started (browser shows http://localhost:3000)
- [ ] Frontend compiles (no red errors in terminal)
- [ ] Login works (can login with any credentials)

### Integration ✅
- [ ] Books appear on dashboard
- [ ] DevTools shows /api/books request
- [ ] Response has books from database
- [ ] No console errors
- [ ] Books persist on refresh

---

## 🎉 Final Verification

### The Ultimate Test
1. Login to frontend
2. Open DevTools Network tab
3. Look for: `GET http://localhost:5000/api/books` - Status 200
4. See books in dashboard
5. Refresh page (F5) - books still appear (from database)
6. ✅ SUCCESS - Books are loading from database!

---

**Status**: Ready to verify  
**Time to Complete**: ~10 minutes  
**Expected Outcome**: Books loading from database

Start with Step 1 above and follow the checklist! 🚀

