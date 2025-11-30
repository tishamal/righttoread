# Book Upload Feature - Testing & Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup ✅
- [x] Create `.env` from `.env.example`
- [ ] Configure `REACT_APP_BACKEND_API_URL`
- [ ] Configure `REACT_APP_TTS_SERVICE_URL`
- [ ] Verify both backend services are running
- [ ] Test database connection

### 2. Code Review ✅
- [x] All TypeScript errors resolved
- [x] No linting issues
- [x] Code follows project conventions
- [x] Error handling implemented
- [x] Loading states added

### 3. Files Created/Modified ✅
- [x] `src/config/apiConfig.ts` (NEW)
- [x] `src/services/api.ts` (UPDATED)
- [x] `src/components/AddBookModal.tsx` (UPDATED)
- [x] `src/App.tsx` (UPDATED)
- [x] `.env.example` (NEW)
- [x] Documentation files created

## Testing Checklist

### Unit Tests
- [ ] Test `apiConfig.ts` exports correct URLs
- [ ] Test `ttsAPI.uploadBook()` with valid PDF
- [ ] Test `ttsAPI.uploadBook()` with invalid file
- [ ] Test `booksAPI.create()` with valid data
- [ ] Test error handling in API calls

### Integration Tests
- [ ] Test complete upload flow (PDF → TTS → Database)
- [ ] Test upload without PDF (metadata only)
- [ ] Test with TTS service down
- [ ] Test with backend API down
- [ ] Test with both services down

### UI/UX Tests
- [ ] Modal opens correctly
- [ ] All form fields work
- [ ] File upload (drag & drop) works
- [ ] File upload (click) works
- [ ] Starting page number validation (min: 1)
- [ ] Loading overlay appears during upload
- [ ] Success message appears after upload
- [ ] Error message appears on failure
- [ ] Modal closes after success
- [ ] Book appears in dashboard

### Edge Cases
- [ ] Upload very large PDF (>50MB)
- [ ] Upload corrupted PDF
- [ ] Upload non-PDF file
- [ ] Starting page number = 0
- [ ] Starting page number = negative
- [ ] Starting page number = 999999
- [ ] Empty form submission
- [ ] Cancel during upload
- [ ] Network disconnection during upload

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Performance Tests
- [ ] Upload 10 page PDF
- [ ] Upload 50 page PDF
- [ ] Upload 100+ page PDF
- [ ] Multiple simultaneous uploads
- [ ] Memory usage during upload
- [ ] Network traffic monitoring

## Manual Testing Script

### Test 1: Successful Upload
1. Open app (http://localhost:3000)
2. Login with test credentials
3. Click "Create Book" button
4. Fill in:
   - Name: "Test Book 1"
   - Grade: "Grade 9"
   - NIE Published: "Yes"
   - Author: "Test Author"
   - Year: "2024"
   - Starting Page: "1"
   - Description: "Test description"
5. Upload a small PDF (5-10 pages)
6. Click "Save Book"
7. ✅ Loading overlay should appear
8. ✅ Wait for processing (may take 1-2 minutes)
9. ✅ Success message should appear
10. ✅ Modal should close
11. ✅ Book should appear in dashboard

### Test 2: Upload Without PDF
1. Click "Create Book"
2. Fill in all fields EXCEPT PDF
3. Leave starting page as default (1)
4. Click "Save Book"
5. ✅ Should create book without TTS processing
6. ✅ Success message should appear

### Test 3: Custom Starting Page
1. Click "Create Book"
2. Fill in all fields including PDF
3. Set starting page to "5"
4. Click "Save Book"
5. ✅ TTS should start from page 5
6. ✅ Success message should mention page count

### Test 4: Error Handling (TTS Down)
1. Stop the Python TTS service
2. Try to upload a book with PDF
3. ✅ Error message about TTS failure
4. ✅ Book should still be created
5. ✅ Book appears in dashboard

### Test 5: Error Handling (Backend Down)
1. Stop the Node.js backend
2. Try to upload a book
3. ✅ Error message about creation failure
4. ✅ Book added to local state (visible but not saved)

### Test 6: Invalid File Type
1. Try to upload a .docx or .txt file
2. ✅ Should show "Please upload a PDF file only"
3. ✅ File should not be accepted

### Test 7: Form Validation
1. Click "Create Book"
2. Click "Save Book" without filling anything
3. ✅ Should show "Please fill in all required fields"

## Backend Service Verification

### TTS Service (Python)
```bash
# Start service
cd right-to-read-service
python src/main/main.py

# Verify health
curl http://localhost:8080/health

# Expected: {"status": "healthy"}
```

### Backend API (Node.js)
```bash
# Start service
cd righttoread/backend
npm run dev

# Verify health
curl http://localhost:8080/health

# Expected: {"status": "OK", "timestamp": "..."}
```

### Database
```bash
# Test connection
psql -h localhost -U postgres -d right_to_read

# Or check from backend
curl http://localhost:8080/api/books

# Expected: {"success": true, "data": [...]}
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backup created

### Build
- [ ] `npm install` (clean install)
- [ ] `npm run build`
- [ ] Build succeeds without errors
- [ ] Check build size
- [ ] Test built files locally

### Deployment
- [ ] Deploy frontend to hosting
- [ ] Update environment variables in production
- [ ] Deploy backend services
- [ ] Verify CORS settings
- [ ] Check SSL certificates
- [ ] Test production URLs

### Post-Deployment
- [ ] Health check endpoints
- [ ] Test upload in production
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify database connections

## Monitoring

### Metrics to Track
- [ ] Upload success rate
- [ ] Average upload time
- [ ] TTS processing time
- [ ] Error rate
- [ ] API response times
- [ ] Storage usage

### Logs to Monitor
- [ ] Frontend console errors
- [ ] Backend API errors
- [ ] TTS service errors
- [ ] Database errors
- [ ] File system errors

## Rollback Plan

### If Issues Found
1. Identify the issue
2. Check if it's critical
3. If critical:
   - Revert to previous version
   - Restore database backup
   - Notify users
4. If not critical:
   - Log the issue
   - Create fix
   - Deploy fix

### Rollback Steps
```bash
# Revert git commit
git revert <commit-hash>

# Or checkout previous version
git checkout <previous-tag>

# Rebuild and redeploy
npm install
npm run build
# Deploy...
```

## Support Documentation

### For Users
- [ ] User guide created
- [ ] FAQ document prepared
- [ ] Video tutorial recorded
- [ ] Help desk notified

### For Developers
- [x] Architecture documented (ARCHITECTURE_DIAGRAM.md)
- [x] Implementation guide (UPLOAD_FEATURE_README.md)
- [x] Quick start guide (QUICK_START_UPLOAD.md)
- [x] API documentation complete

## Sign-Off

### Developer ✅
- [x] Code complete
- [x] Self-tested
- [x] Documentation complete
- [x] Ready for QA

### QA
- [ ] Test plan executed
- [ ] All tests passed
- [ ] Edge cases tested
- [ ] Performance acceptable
- [ ] Ready for staging

### Staging
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Stakeholder approval
- [ ] Ready for production

### Production
- [ ] Deployed to production
- [ ] Health checks passed
- [ ] Users notified
- [ ] Monitoring active
- [ ] Support ready

## Notes

### Known Issues
- None

### Future Improvements
- Add upload progress percentage
- Support batch uploads
- Add PDF preview
- Track upload history
- Add retry mechanism

### Dependencies
- TTS Service must be running on port 8080
- Backend API must be running on port 8080
- PostgreSQL database must be accessible
- AWS credentials for S3 (optional)

---

**Date:** November 27, 2025
**Version:** 1.0.0
**Status:** ✅ Ready for Testing
