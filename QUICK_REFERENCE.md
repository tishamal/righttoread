# Quick Reference Card

## 🚀 Quick Start (60 seconds)

### Terminal 1: Backend
```bash
cd backend && npm run dev
```
**Wait for**: "Server running on port 5000"

### Terminal 2: Frontend
```bash
npm start
```
**Wait for**: Browser opens on http://localhost:3000

### Terminal 3 (Optional): Database
```bash
docker-compose up -d
```

---

## 📱 Common Commands

| Task | Command |
|------|---------|
| Start Frontend | `npm start` |
| Start Backend | `cd backend && npm run dev` |
| Build Frontend | `npm run build` |
| Test Frontend | `npm test` |
| Start DB (Docker) | `docker-compose up -d` |
| Stop DB | `docker-compose down` |
| View DB Logs | `docker-compose logs postgres` |
| Initialize DB | `cd backend && npm run init-db` |
| Backend Build | `cd backend && npm run build` |

---

## 🔗 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| PgAdmin | http://localhost:5050 |
| Books Endpoint | GET http://localhost:5000/api/books |
| Analytics Endpoint | GET http://localhost:5000/api/analytics/stats |

---

## 🗂️ Key Files

| File | Purpose | Status |
|------|---------|--------|
| `src/App.tsx` | Main dashboard | ✅ Updated |
| `src/services/api.ts` | API layer | ✅ Created |
| `src/components/AnalyticsDashboard.tsx` | Analytics | ✅ Updated |
| `src/components/DigitalVersionReview.tsx` | Review | ✅ Updated |
| `.env.local` | Config | ✅ Created |
| `backend/src/server.ts` | Backend app | Needs testing |

---

## 🧪 Quick Test

### Test API Connection
```bash
# In browser console or terminal
curl http://localhost:5000/api/books
```

### Test Frontend Integration
1. Open http://localhost:3000
2. Login (any credentials)
3. Check DevTools → Network → /api/books request
4. Verify books appear in dashboard

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API connection refused | `cd backend && npm run dev` |
| Port 5000 already in use | `lsof -i :5000 && kill -9 <PID>` |
| Port 3000 already in use | `lsof -i :3000 && kill -9 <PID>` |
| DB connection error | `docker-compose up -d` |
| Books not loading | Check Network tab for 500 errors |
| TypeScript errors | `npm run build` to see all errors |

---

## 📊 API Methods Cheat Sheet

### Books
```typescript
import { booksAPI } from './services/api';

await booksAPI.getAll();           // Get all books
await booksAPI.getById('1');       // Get specific book
await booksAPI.create({ ... });    // Create book
await booksAPI.update('1', { ... }); // Update book
await booksAPI.delete('1');        // Delete book
```

### Analytics
```typescript
import { analyticsAPI } from './services/api';

await analyticsAPI.record({ ... });        // Record event
await analyticsAPI.getStats();             // Get stats
await analyticsAPI.getBookStats();         // Stats by book
await analyticsAPI.getByBook('1');         // Book analytics
```

---

## 🎯 Feature Checklist

- ✅ Frontend built and running
- ✅ API service layer created
- ✅ App.tsx integrated with API
- ✅ AnalyticsDashboard integrated
- ✅ DigitalVersionReview integrated
- ⚠️ Backend needs to be tested
- ⚠️ Database schema needs verification
- ⚠️ AWS S3 needs configuration

---

## 📚 Documentation

| Document | Link | Purpose |
|----------|------|---------|
| Integration Summary | `INTEGRATION_SUMMARY.md` | Overview |
| Quick Start | `QUICKSTART.md` | Setup guide |
| API Contract | `API_CONTRACT.md` | Endpoint reference |
| Architecture | `ARCHITECTURE.md` | System design |
| Checklist | `DEVELOPER_CHECKLIST.md` | Verification |

---

## 🔐 Environment Variables

### Frontend (`.env.local`)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/right_to_read
AWS_BUCKET_NAME=right-to-read-bucket
AWS_REGION=us-east-1
PORT=5000
```

---

## 💡 Tips & Tricks

### View Database
```bash
# Connect to DB
psql postgresql://postgres:postgres@localhost:5432/right_to_read

# List tables
\dt

# View books
SELECT * FROM books;

# View analytics
SELECT * FROM analytics;
```

### Debug API Calls
```javascript
// In browser console
// All API calls will be logged
localStorage.setItem('debug', 'api:*');
```

### Test API Endpoint
```bash
# Get all books
curl -X GET http://localhost:5000/api/books

# Create book
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","grade":"Grade 3","author":"Test"}'
```

---

## 🚨 Emergency Recovery

### If Frontend Won't Start
```bash
npm install
npm cache clean --force
npm start
```

### If Backend Won't Start
```bash
cd backend
npm install
npm run build
npm run dev
```

### If Database is Corrupt
```bash
docker-compose down
docker volume rm <project>_postgres_data
docker-compose up -d
npm run init-db
```

### If Port is Stuck
```bash
# Kill process on port
lsof -i :<PORT>
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

---

## 📞 Getting Help

1. **Check console**: Browser DevTools → Console tab
2. **Check logs**: Backend terminal output
3. **Check network**: DevTools → Network tab
4. **Review docs**: See documentation files
5. **Check Git**: Recent commits/changes

---

## ✨ Integration Status

```
Frontend Components
├── App.tsx                 [✅ Ready]
├── AnalyticsDashboard     [✅ Ready]
└── DigitalVersionReview   [✅ Ready]

API Service Layer
└── src/services/api.ts    [✅ Ready]

Backend Endpoints
├── Books                  [⚠️ Needs Testing]
└── Analytics              [⚠️ Needs Testing]

Database
└── PostgreSQL             [⚠️ Needs Setup]
```

**Overall**: ✅ Frontend Ready | ⚠️ Backend Testing Required

---

## 🎉 You're All Set!

1. ✅ Frontend code is complete
2. ✅ API integration is done
3. ✅ Documentation is comprehensive
4. ⏭️ Next: Test backend server
5. ⏭️ Then: Deploy to production

**Happy Coding!** 🚀

---

*Generated: January 2025*  
*Version: 1.0*  
*Status: Integration Complete*

