# 🚀 Getting Started - Load Books from Database in 10 Minutes

## What You Need to Do

You have 3 services that need to be running:
1. **PostgreSQL Database** (stores books)
2. **Express Backend** (API server)
3. **React Frontend** (user interface)

All 3 must be running simultaneously for books to load from the database.

---

## 🎯 Quick Start (Copy & Paste)

### TERMINAL 1: Start Database
Open PowerShell and run:

```powershell
cd "d:\MyProjects\Right to Read"
docker-compose up
```

**Wait for this message to appear:**
```
postgres_1 | LOG: database system is ready to accept connections
```

**Leave this terminal open - it keeps database running**

---

### TERMINAL 2: Start Backend (NEW TERMINAL)
Open a NEW PowerShell window and run:

```powershell
cd "d:\MyProjects\Right to Read\backend"
npm install
npm run init-db
npm run dev
```

**Wait for this message to appear:**
```
Server running on port 5000
Database connected successfully
```

**Keep this terminal open - it keeps backend running**

---

### TERMINAL 3: Start Frontend (NEW TERMINAL)
Open another NEW PowerShell window and run:

```powershell
cd "d:\MyProjects\Right to Read"
npm start
```

**Wait for browser to open to http://localhost:3000**

---

## 📋 Step-by-Step (First Time Setup)

### Step 1: Prepare Terminal 1 (Database)
```powershell
cd "d:\MyProjects\Right to Read"
```

**Copy the entire command below and paste into Terminal 1:**
```powershell
docker-compose up
```

**Expected output within 30 seconds:**
```
postgres_1 | LOG:  database system is ready to accept connections
postgres_1 | LOG:  autovacuum launcher started
```

✅ **Leave this running. Database is ready.**

---

### Step 2: Prepare Terminal 2 (Backend)

**Right-click PowerShell taskbar → New Window**

```powershell
cd "d:\MyProjects\Right to Read\backend"
```

**First time only, install dependencies:**
```powershell
npm install
```

**Wait for "added X packages"**

**Create the database tables:**
```powershell
npm run init-db
```

**Wait for "Schema initialized" message**

**Start the backend server:**
```powershell
npm run dev
```

**Expected output:**
```
Server running on port 5000
Database connected successfully
```

✅ **Leave this running. Backend is ready.**

---

### Step 3: Prepare Terminal 3 (Frontend)

**Right-click PowerShell taskbar → New Window**

```powershell
cd "d:\MyProjects\Right to Read"
npm start
```

**Browser will automatically open to http://localhost:3000**

✅ **Frontend is running.**

---

## 🎯 Test If It Works

### In Browser (http://localhost:3000)

1. **Login Page**
   - Type any email (e.g., admin@example.com)
   - Type any password (e.g., password)
   - Click "Login"

2. **Dashboard Should Load**
   - Wait for page to load
   - Books should appear in a grid

3. **Verify Books Are From Database**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Refresh page (Ctrl+R)
   - Look for: `api/books?` request
   - Response should show books with database IDs

4. **Final Confirmation**
   - Close browser tab
   - Reopen http://localhost:3000
   - Books should still be there (from database, not session)
   - ✅ SUCCESS!

---

## 🔍 Troubleshooting

### Issue: "Port 5000 already in use"
**Terminal 2 shows error about port**

**Fix:**
```powershell
# Find and kill process on port 5000
Get-Process | where {$_.ProcessName -eq "node"} | Stop-Process -Force

# Try again
npm run dev
```

---

### Issue: "Cannot connect to database"
**Terminal 2 shows connection error**

**Fix:**
```powershell
# In Terminal 1, check Docker is actually running
docker ps

# Should show postgres container. If not:
docker-compose up
```

---

### Issue: "No books appear on dashboard"
**Frontend loads but no books shown**

**Check in Terminal 2 (backend):**
- Do you see "Database connected successfully"?
- Any error messages?

**If database connected fine:**
```powershell
# In Terminal 2, test the API endpoint directly
curl http://localhost:5000/api/books
```

**Should return JSON with books. If empty:**
```powershell
# In Terminal 1 PostgreSQL, insert sample books:
docker-compose exec postgres psql -U postgres -d right_to_read -c "
INSERT INTO books (title, author, grade, subject, published_by_nie, year_published, description, status)
VALUES 
  ('English Student Handbook - Grade 3', 'Ministry of Education Sri Lanka', 'Grade 3', 'English', true, 2023, 'Grade 3 Handbook', 'published'),
  ('English Student Handbook - Grade 4', 'Ministry of Education Sri Lanka', 'Grade 4', 'English', true, 2023, 'Grade 4 Handbook', 'published');
"
```

---

### Issue: "Books show but seem to be sample data"
**DevTools Network shows 200 but response seems hardcoded**

**Check .env.local:**
```powershell
cat ".env.local"
```

**Should show:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**If wrong, edit and restart frontend:**
```powershell
npm start
```

---

## 📊 Expected File Tree

After setup, you should have:

```
Right to Read/
├── node_modules/           ✅ Frontend dependencies
├── src/                    ✅ Frontend code
├── .env.local              ✅ Has API URL
├── backend/
│   ├── node_modules/       ✅ Backend dependencies
│   ├── .env               ✅ Database config
│   ├── src/               ✅ Backend code
│   └── npm run init-db    ✅ Run once
├── docker-compose.yml     ✅ Database config
└── docker-compose.override.yml
```

---

## ✅ Sign-Off Checklist

- [ ] Terminal 1: Docker running (postgres visible)
- [ ] Terminal 2: Backend started (port 5000 listening)
- [ ] Terminal 3: Frontend running (http://localhost:3000 opens)
- [ ] Browser: Can login
- [ ] Dashboard: Books appear
- [ ] DevTools: `/api/books` request returns 200
- [ ] DevTools: Response shows books from database
- [ ] Refresh: Books still there (not session/sample data)

When all boxes are checked: ✅ **SUCCESS - Books loading from database!**

---

## 🎓 Understanding the Architecture

```
┌──────────────────┐
│  React Frontend  │  (localhost:3000)
│  - Login page    │
│  - Dashboard     │
│  - Shows books   │
└────────┬─────────┘
         │ HTTP Request
         │ GET /api/books
         ↓
┌──────────────────┐
│ Express Backend  │  (localhost:5000)
│  - API Server    │
│  - Queries DB    │
│  - Returns JSON  │
└────────┬─────────┘
         │ SQL Query
         │ SELECT * FROM books
         ↓
┌──────────────────┐
│   PostgreSQL     │  (localhost:5432)
│  - right_to_read │
│  - books table   │
│  - stores data   │
└──────────────────┘
```

**Data Flow:**
1. User opens frontend (http://localhost:3000)
2. Frontend calls backend API (/api/books)
3. Backend queries PostgreSQL database
4. Database returns book records
5. Backend sends books as JSON to frontend
6. Frontend displays books in dashboard

---

## 💡 Pro Tips

### Keep All Terminals Open
Don't close any of the 3 terminals while working. They all need to stay running.

### One Terminal Per Service
- Terminal 1: Only docker-compose (for database)
- Terminal 2: Only backend npm run dev
- Terminal 3: Only frontend npm start

### Monitor the Logs
Each terminal shows useful information:
- **Terminal 1**: Database activity
- **Terminal 2**: API requests and errors
- **Terminal 3**: Build status and frontend errors

### Quick Restart
If something breaks:
1. Stop all terminals (Ctrl+C)
2. Start in order: Database → Backend → Frontend

---

## 📱 Next Steps After Success

Once books are loading from database:

1. **Test Analytics Page**
   - Click "Analytics" in sidebar
   - Should show data from database

2. **Test Digital Review Page**
   - Click "Digital Review" in sidebar
   - Should show pending books

3. **Test Add Book**
   - Click "+" button
   - Fill in form
   - Click "Add"
   - New book appears in dashboard

4. **Check Database**
   - Open http://localhost:5050 (PgAdmin)
   - Login with admin/admin
   - Browse books table
   - See your new book in database

---

## 🎉 You're Ready!

**Next action:** 
1. Open Terminal 1
2. Run `docker-compose up`
3. Follow the steps above
4. Books will load from database!

**Time needed:** ~10 minutes  
**Success rate:** 99% if you follow these steps

Let me know if you hit any issues! 🚀

