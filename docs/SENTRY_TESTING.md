# Sentry Testing Instructions

## ✅ Configuration Complete!

Your Sentry is now properly configured:
- **Frontend DSN**: `4770d7f0e04eb94a613ad9e01b2b9e4d...`
- **Backend DSN**: `5375d221ddded753e56b051c8420ef35...`

---

## 🧪 How to Test Sentry

### Option 1: Use the Test HTML Page

1. **Open the test page**:
   ```bash
   # Open in browser
   start docs/sentry-test.html
   ```

2. **Click the test buttons**:
   - "Throw Frontend Error" - Sends error to Sentry
   - "Send Info Message" - Sends info message
   - "Uncaught Error" - Tests automatic error capture

3. **Check your Sentry dashboard**:
   - Go to: https://sentry.io
   - Login to your account
   - Select your organization
   - Check "Issues" tab for errors

---

### Option 2: Test Backend Manually

1. **Make sure backend is running**:
   ```powershell
   cd backend
   npm start
   ```
   
   If port 8888 is in use, either:
   - Stop the other process
   - Or change port in `backend/src/server.js`

2. **Call the test endpoint**:
   ```powershell
   # Using curl (if installed)
   curl http://localhost:8888/api/test-sentry
   
   # Or using PowerShell
   Invoke-WebRequest -Uri http://localhost:8888/api/test-sentry
   ```

3. **Check Sentry dashboard** for the error

---

### Option 3: Test Frontend with Cypress

Run the Sentry test suite:
```powershell
cd tests
npx cypress run --spec cypress/e2e/10-sentry-error-tracking.cy.js --browser chrome
```

---

## 🔍 Verify Sentry is Working

### Backend Verification

When you start the backend, you should see:
```
✅ Sentry error tracking initialized
```

If you see this message, Sentry is configured correctly!

### Frontend Verification

1. Start the frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

2. Open browser console (F12)

3. You should see:
   ```
   ✅ Sentry frontend initialized
   ```

---

## 📊 Check Sentry Dashboard

### Where to Find Your Errors

1. **Login**: https://sentry.io
2. **Navigate to**: Issues → All Issues
3. **Look for**:
   - "Test Frontend Error"
   - "Test Sentry Backend Error"
   - Timestamp should match when you triggered them

### What You'll See in Sentry

For each error:
- ✅ **Error message** and type
- ✅ **Stack trace** showing exactly where error occurred
- ✅ **User info** (if logged in)
- ✅ **Browser/Environment** details
- ✅ **Breadcrumbs** (actions before error)
- ✅ **Session replay** (if error occurred)

---

## 🐛 Troubleshooting

### "Port 8888 already in use"

Find and kill the process:
```powershell
# Find process using port 8888
netstat -ano | findstr :8888

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### "Sentry not initialized"

Make sure you're running in production/staging mode for backend:
```powershell
$env:NODE_ENV="production"
npm start
```

Or remove the environment check from `backend/src/app.js` (already done).

### "No errors in Sentry dashboard"

1. Wait 30-60 seconds for errors to appear
2. Refresh the Sentry dashboard
3. Check if DSN is correct in code
4. Verify you're logged into the correct Sentry organization

### "404 on project URLs"

The project URLs in the screenshots show 404 because:
- They're direct project URLs (not dashboard URLs)
- Correct format: `https://sentry.io/organizations/YOUR_ORG/issues/`

To find your correct URL:
1. Go to https://sentry.io
2. Click on your organization name
3. Click on a project (idurar-backend or idurar-frontend)
4. Copy the URL from browser

---

## ✨ Quick Test Commands

### Test Everything at Once

```powershell
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm run dev

# Terminal 3 - Open test page
start docs/sentry-test.html

# Terminal 4 - Call backend test
Invoke-WebRequest -Uri http://localhost:8888/api/test-sentry
```

Then check: https://sentry.io → Issues tab

---

## 📝 What Was Changed

### Files Modified:
1. ✅ `frontend/src/main.jsx` - Sentry initialization
2. ✅ `backend/src/app.js` - Sentry initialization (fixed enabled flag)
3. ✅ `backend/src/routes/coreRoutes/coreApi.js` - Added test endpoint
4. ✅ `.github/workflows/cicd-pipeline.yml` - Updated DSN keys

### Files Created:
1. ✅ `docs/sentry-test.html` - Interactive test page
2. ✅ `docs/SENTRY_SETUP_GUIDE.md` - Complete guide
3. ✅ `docs/SENTRY_STATUS_REPORT.md` - Status checklist
4. ✅ `tests/cypress/e2e/10-sentry-error-tracking.cy.js` - Automated tests
5. ✅ `frontend/src/sentry.js` - Sentry utilities
6. ✅ `backend/.env.sentry.example` - Backend env template
7. ✅ `frontend/.env.sentry.example` - Frontend env template

---

## 🎯 Expected Results

### When Working Correctly:

**Backend Console**:
```
✅ Sentry error tracking initialized
Server running on port 8888
```

**Frontend Console**:
```
✅ Sentry frontend initialized
```

**Sentry Dashboard**:
- New issues appear within 30-60 seconds
- Stack traces visible
- Environment tagged correctly
- DSN shows as active

---

## 📞 Support

If Sentry still isn't working:
1. Check `docs/SENTRY_SETUP_GUIDE.md` troubleshooting section
2. Verify DSN keys are correct
3. Check browser network tab for blocked requests
4. Verify Sentry.io account has active projects

---

**Last Updated**: December 9, 2025
