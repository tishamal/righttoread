# 🚨 Database Status & How to View Books

## Current Situation

The PostgreSQL database is **NOT RUNNING**. This is why you can't see the books yet.

```
❌ PostgreSQL Status: OFFLINE
❌ Books Visible: NO
```

## To See Books in Database, You Need to:

### Step 1: Start PostgreSQL (Choose ONE method)

#### **Option A: Docker Compose (Recommended)**

First, ensure Docker Desktop is installed and running, then:

```powershell
cd "d:\MyProjects\Right to Read"
docker-compose up
```

**Expected Output:**
```
postgres_1  | LOG:  database system is ready to accept connections
pgadmin_1   | [32m[10/27/2025 10:30:45] [1] [INFO] - Flask server started on [0.0.0.0:80]
```

#### **Option B: Local PostgreSQL Installation**

If you have PostgreSQL installed locally:

1. Start PostgreSQL service
2. Create database:
   ```sql
   CREATE DATABASE right_to_read;
   ```
3. Then run the backend initialization

---

### Step 2: Initialize Database Schema

Once PostgreSQL is running, initialize the tables:

```powershell
cd "d:\MyProjects\Right to Read\backend"
npm install
npm run init-db
```

---

### Step 3: View Books

After PostgreSQL is running and initialized, use any of these methods:

#### **Method 1: Query Script (Easiest)**
```powershell
cd "d:\MyProjects\Right to Read"
node query-books.js
```

#### **Method 2: PgAdmin Web Interface**
1. Open http://localhost:5050
2. Login: admin@example.com / admin
3. Navigate to: Servers → localhost → right_to_read → Schemas → public → Tables → books
4. Right-click `books` → View/Edit Data → All Rows

#### **Method 3: psql CLI**
```powershell
psql -h localhost -U postgres -d right_to_read -c "SELECT * FROM books;"
```

#### **Method 4: Through Backend API**
```powershell
# Start backend
cd backend
npm run dev

# In another terminal:
curl http://localhost:5000/api/books
```

#### **Method 5: Through React Frontend**
```powershell
# With backend running, start frontend
npm start
# Open http://localhost:3000
# Login and see books in dashboard
```

---

## Database Schema

When initialized, the database will have these tables:

```
📊 right_to_read (Database)
├── users (admin accounts)
├── books (textbook metadata)
│   ├── id (UUID)
│   ├── title
│   ├── grade (3, 4, 5, 6, 7, 8, 9, 10)
│   ├── subject (English)
│   ├── author
│   ├── status (draft, pending, approved, published)
│   └── created_at, updated_at
├── pages (book pages)
├── paragraphs (paragraph text, SSML, audio)
├── digital_versions (review status)
└── analytics (usage data)
```

---

## Sample Books (Will be inserted)

When the database initializes, sample books will be created:

```
Grade 3: English Handbook 3 (Status: Published)
Grade 4: English Handbook 4 (Status: Published)
Grade 5: English Handbook 5 (Status: Published)
Grade 6: English Handbook 6 (Status: Published)
Grade 7: English Handbook 7 (Status: Pending Review)
Grade 8: English Handbook 8 (Status: Pending Review)
Grade 9: English Handbook 9 (Status: Approved)
Grade 10: English Handbook 10 (Status: Approved)
```

---

## 🔧 Quick Startup Steps

### All Three Services (Full Application)

**Terminal 1 - Database:**
```powershell
cd "d:\MyProjects\Right to Read"
docker-compose up
```

**Terminal 2 - Backend:**
```powershell
cd "d:\MyProjects\Right to Read\backend"
npm install
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
cd "d:\MyProjects\Right to Read"
npm start
```

**Then:**
1. Open http://localhost:3000 in browser
2. Login with any credentials
3. See books in dashboard ✅

---

## 📝 Configuration Files

Your configuration is set up correctly:

**Frontend:** `.env.local`
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Backend:** `backend/.env`
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres_password
DB_NAME=right_to_read
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/right_to_read
```

**Docker Compose:** `docker-compose.yml`
```
PostgreSQL 15-Alpine with:
- Database: right_to_read
- User: postgres
- Password: postgres_password
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | PostgreSQL not running - `docker-compose up` |
| "Database does not exist" | Run `npm run init-db` in backend folder |
| "No books found" | Insert sample data or use frontend to add books |
| "Port 5432 in use" | Kill process: `taskkill /PID <pid> /F` |
| "Docker not found" | Install Docker Desktop |
| "Password authentication failed" | Check `.env` password matches docker-compose.yml |

---

## 📊 Next Command to Run

When you're ready to see the books:

```powershell
# Terminal 1 - Start database
cd "d:\MyProjects\Right to Read"
docker-compose up

# Wait for "database system is ready to accept connections"

# Terminal 2 - Initialize & start backend
cd "d:\MyProjects\Right to Read\backend"
npm install
npm run init-db
npm run dev

# Terminal 3 - Start frontend
cd "d:\MyProjects\Right to Read"
npm start

# Then open http://localhost:3000
```

---

## ✅ Success Indicators

You'll know it's working when you see:

✅ Docker terminal: `LOG:  database system is ready to accept connections`  
✅ Backend terminal: `Server running on port 5000`  
✅ Frontend terminal: `Compiled successfully!`  
✅ Browser: http://localhost:3000 shows books in dashboard  
✅ Query script: `Found X book(s) in database`  

---

## 📞 Quick Commands

**Check if PostgreSQL is running:**
```powershell
node query-books.js
```

**Check if backend is running:**
```powershell
curl http://localhost:5000/api/books
```

**Check if frontend is running:**
```
Open http://localhost:3000 in browser
```

---

**Status:** 🔴 Database offline - needs to be started  
**Next Step:** Start `docker-compose up` in Terminal 1  

