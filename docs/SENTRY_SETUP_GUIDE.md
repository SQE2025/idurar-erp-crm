# Sentry Error Tracking Setup Guide

## Overview
Sentry is integrated into the IDURAR ERP/CRM application for comprehensive error tracking and monitoring in both backend (Node.js) and frontend (React) environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Configuration](#configuration)
5. [Testing Sentry](#testing-sentry)
6. [CI/CD Integration](#cicd-integration)
7. [Monitoring Dashboard](#monitoring-dashboard)

---

## Prerequisites

### 1. Create a Sentry Account
- Go to [https://sentry.io](https://sentry.io)
- Sign up for a free account
- Create a new organization (e.g., "IDURAR-ERP-CRM")

### 2. Create Sentry Projects
You need **two separate projects** in Sentry:

#### Backend Project (Node.js)
1. Click "Create Project" in Sentry dashboard
2. Select **Node.js** as the platform
3. Name it: `idurar-backend`
4. Copy the **DSN** (looks like: `https://xxxxx@o0000.ingest.sentry.io/0000000`)

#### Frontend Project (React)
1. Click "Create Project" again
2. Select **React** as the platform
3. Name it: `idurar-frontend`
4. Copy the **DSN**

---

## Backend Setup

### Current Status: ✅ Already Configured

The backend is already set up in `backend/src/app.js`:

```javascript
// Sentry is initialized in production/staging environments
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  try {
    const Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN || 'https://example@sentry.io/project-id',
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      enabled: !!process.env.SENTRY_DSN,
    });
    console.log('✅ Sentry error tracking initialized');
  } catch (error) {
    console.log('⚠️ Sentry not available (install @sentry/node for production)');
  }
}
```

### Installation Steps

1. **Install Sentry package**:
   ```bash
   cd backend
   npm install @sentry/node --save
   ```

2. **Configure environment variables**:
   Create/update `.env` file in the backend directory:
   ```env
   NODE_ENV=production
   SENTRY_DSN=https://your-backend-dsn@o0000.ingest.sentry.io/0000000
   ```

3. **Test the installation**:
   ```bash
   npm start
   ```
   You should see: `✅ Sentry error tracking initialized`

---

## Frontend Setup

### Installation Steps

1. **Install Sentry packages**:
   ```bash
   cd frontend
   npm install @sentry/react @sentry/vite-plugin --save
   ```

2. **Create Sentry initialization file**:
   Create `frontend/src/sentry.js`:
   ```javascript
   import * as Sentry from "@sentry/react";

   export function initSentry() {
     // Only initialize in production or staging
     if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging') {
       Sentry.init({
         dsn: import.meta.env.VITE_SENTRY_DSN || "",
         environment: import.meta.env.MODE || 'development',
         integrations: [
           Sentry.browserTracingIntegration(),
           Sentry.replayIntegration(),
         ],
         // Performance Monitoring
         tracesSampleRate: 1.0, // Capture 100% of transactions
         // Session Replay
         replaysSessionSampleRate: 0.1, // 10% of sessions
         replaysOnErrorSampleRate: 1.0, // 100% of errors
         enabled: !!import.meta.env.VITE_SENTRY_DSN,
       });
       console.log('✅ Sentry frontend tracking initialized');
     }
   }
   ```

3. **Initialize in main entry file**:
   Update `frontend/src/main.jsx`:
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   import { initSentry } from './sentry';

   // Initialize Sentry before app renders
   initSentry();

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>,
   );
   ```

4. **Configure environment variables**:
   Create/update `.env.production` in frontend:
   ```env
   VITE_SENTRY_DSN=https://your-frontend-dsn@o0000.ingest.sentry.io/0000000
   ```

5. **Update Vite config** (optional for sourcemaps):
   Update `frontend/vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import { sentryVitePlugin } from "@sentry/vite-plugin";

   export default defineConfig({
     plugins: [
       react(),
       // Upload sourcemaps to Sentry (production only)
       process.env.NODE_ENV === 'production' && sentryVitePlugin({
         org: "your-org-name",
         project: "idurar-frontend",
         authToken: process.env.SENTRY_AUTH_TOKEN,
       }),
     ].filter(Boolean),
     build: {
       sourcemap: true, // Generate sourcemaps
     },
   });
   ```

---

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
NODE_ENV=production

# Sentry Backend DSN
SENTRY_DSN=https://your-backend-dsn@o0000.ingest.sentry.io/0000000

# Other vars...
DATABASE_URL=mongodb://localhost:27017/idurar
JWT_SECRET=your-secret-key
```

#### Frontend (.env.production)
```env
# Sentry Frontend DSN
VITE_SENTRY_DSN=https://your-frontend-dsn@o0000.ingest.sentry.io/0000000

# API URL
VITE_API_URL=https://api.yourdomain.com
```

### GitHub Secrets (for CI/CD)
Add these secrets in GitHub repository settings:

1. **SENTRY_DSN** - Backend Sentry DSN
2. **VITE_SENTRY_DSN** - Frontend Sentry DSN
3. **SENTRY_AUTH_TOKEN** - (Optional) For uploading sourcemaps
4. **SENTRY_ORG** - Your Sentry organization slug
5. **SENTRY_PROJECT_BACKEND** - Backend project name
6. **SENTRY_PROJECT_FRONTEND** - Frontend project name

---

## Testing Sentry

### 1. Manual Testing

#### Backend Test Route
Add a test endpoint in your backend:

```javascript
// In backend/src/routes/coreRoutes/coreApi.js
router.get('/test-sentry', (req, res) => {
  throw new Error('Test Sentry Backend Error - ' + Date.now());
});
```

Test it:
```bash
curl http://localhost:8888/api/test-sentry
```

#### Frontend Test Button
Add a test button in your React app:

```javascript
import * as Sentry from "@sentry/react";

function TestSentryButton() {
  const testSentry = () => {
    try {
      throw new Error('Test Sentry Frontend Error - ' + Date.now());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return <button onClick={testSentry}>Test Sentry</button>;
}
```

### 2. Automated Testing with Cypress

Run the Sentry test suite:
```bash
cd tests
npx cypress run --spec cypress/e2e/10-sentry-error-tracking.cy.js
```

The test file includes:
- ✅ Frontend JavaScript error capture
- ✅ API error handling
- ✅ Unhandled promise rejections
- ✅ Network errors
- ✅ Authentication errors
- ✅ Sentry configuration verification
- ✅ Custom error boundaries

### 3. Verify in Sentry Dashboard

1. Go to [https://sentry.io](https://sentry.io)
2. Select your project (backend or frontend)
3. Check the **Issues** tab - you should see the test errors
4. Click on an error to see:
   - Stack trace
   - User context
   - Request details
   - Browser/Environment info
   - Breadcrumbs (user actions before error)

---

## CI/CD Integration

### Current Status: ✅ Already Integrated

Sentry is integrated in `.github/workflows/cicd-pipeline.yml`:

```yaml
- name: Initialize Sentry Error Tracking
  run: |
    echo "======================================"
    echo "SENTRY ERROR MONITORING SETUP"
    echo "======================================"
    echo "Initializing Sentry for error tracking..."
    
    # Configuration summary
    echo "- DSN: https://example@sentry.io/project-id (simulated)"
    echo "- Environment: staging"
    
    # Monitoring capabilities
    echo "Monitoring Features:"
    echo "- Real-time error alerts"
    echo "- Stack trace analysis"
    echo "- Performance monitoring"
    echo "- User session replay"
    
    # Dashboard link
    echo "Dashboard: https://sentry.io/idurar-crm/ (simulated)"
  env:
    SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

### Update CI/CD for Production

Replace the echo commands with actual Sentry CLI commands:

```yaml
- name: Initialize Sentry Error Tracking
  run: |
    # Install Sentry CLI
    npm install -g @sentry/cli
    
    # Create a release
    export SENTRY_RELEASE=$(sentry-cli releases propose-version)
    sentry-cli releases new -p ${{ secrets.SENTRY_PROJECT_BACKEND }} $SENTRY_RELEASE
    sentry-cli releases new -p ${{ secrets.SENTRY_PROJECT_FRONTEND }} $SENTRY_RELEASE
    
    # Upload sourcemaps (frontend)
    sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps ./frontend/dist
    
    # Finalize release
    sentry-cli releases finalize $SENTRY_RELEASE
    
    # Set commits
    sentry-cli releases set-commits $SENTRY_RELEASE --auto
    
    echo "✅ Sentry release created: $SENTRY_RELEASE"
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
```

---

## Monitoring Dashboard

### Key Metrics to Monitor

1. **Error Rate**
   - Track errors per hour/day
   - Set alerts for spikes in error rate

2. **Response Time**
   - Monitor API endpoint performance
   - Track slow database queries

3. **User Impact**
   - Number of users affected by errors
   - Error frequency per user

4. **Top Issues**
   - Most frequent errors
   - Critical errors requiring immediate attention

### Setting Up Alerts

1. Go to **Alerts** in Sentry dashboard
2. Click **Create Alert**
3. Configure alert rules:
   - **Error frequency**: Alert if >10 errors in 5 minutes
   - **New issues**: Alert on any new error type
   - **Performance**: Alert if response time >2 seconds

4. Set notification channels:
   - Email
   - Slack integration
   - PagerDuty for critical alerts

### Integrations

#### Slack Integration
1. Go to Sentry → Settings → Integrations
2. Add Slack workspace
3. Configure alerts to send to specific channels

#### GitHub Integration
1. Enable GitHub integration
2. Link issues to GitHub commits
3. Automatically resolve issues when commits are deployed

---

## Best Practices

### 1. Environment Separation
- Use separate Sentry projects for dev, staging, production
- Configure different alert rules for each environment
- Production should have stricter monitoring

### 2. Error Context
Always include helpful context:
```javascript
Sentry.captureException(error, {
  tags: {
    feature: 'customer-management',
    action: 'create-customer'
  },
  extra: {
    customerId: customer.id,
    formData: sanitizedFormData
  },
  user: {
    id: user.id,
    email: user.email
  }
});
```

### 3. PII Protection
Never send sensitive data to Sentry:
```javascript
Sentry.init({
  dsn: "...",
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### 4. Performance Monitoring
Enable transaction tracking:
```javascript
const transaction = Sentry.startTransaction({
  op: "http.request",
  name: "Create Customer API"
});

// ... your code ...

transaction.finish();
```

### 5. Release Tracking
Always tag errors with release versions:
```javascript
Sentry.init({
  dsn: "...",
  release: "idurar-erp-crm@4.1.0",
});
```

---

## Troubleshooting

### Issue: No errors appearing in Sentry

**Solutions:**
1. Verify DSN is correct
2. Check `enabled: !!process.env.SENTRY_DSN` is true
3. Ensure NODE_ENV is 'production' or 'staging'
4. Check network connectivity to sentry.io
5. Look for initialization logs in console

### Issue: Too many errors

**Solutions:**
1. Configure sampling rates:
   ```javascript
   sampleRate: 0.5, // Sample 50% of errors
   ```
2. Add filters to ignore non-critical errors
3. Set up error grouping rules

### Issue: Missing sourcemaps

**Solutions:**
1. Ensure `sourcemap: true` in build config
2. Upload sourcemaps using Sentry CLI
3. Verify auth token has correct permissions

---

## Cost Optimization

### Free Tier Limits
- 5,000 errors/month
- 10,000 transactions/month
- 1 user

### Tips to Stay Within Limits
1. **Sample errors in development**: Set `enabled: false` for dev
2. **Use error filtering**: Ignore common non-critical errors
3. **Reduce sample rates**: Lower `tracesSampleRate` to 0.1-0.3
4. **Ignore third-party errors**: Filter browser extension errors

---

## Summary Checklist

### Backend
- [x] Sentry code already in `app.js`
- [ ] Install `@sentry/node` package
- [ ] Set `SENTRY_DSN` environment variable
- [ ] Test with `/test-sentry` endpoint
- [ ] Verify errors appear in dashboard

### Frontend
- [ ] Install `@sentry/react` package
- [ ] Create `sentry.js` initialization file
- [ ] Update `main.jsx` to call `initSentry()`
- [ ] Set `VITE_SENTRY_DSN` in `.env.production`
- [ ] Test with error button
- [ ] Verify errors appear in dashboard

### CI/CD
- [x] GitHub Actions workflow configured
- [ ] Add Sentry secrets to GitHub
- [ ] Update workflow with actual Sentry CLI commands
- [ ] Test deployment pipeline

### Monitoring
- [ ] Set up error alerts
- [ ] Configure Slack/Email notifications
- [ ] Create custom dashboards
- [ ] Document runbooks for common errors

---

## Resources

- **Sentry Documentation**: https://docs.sentry.io
- **Node.js Integration**: https://docs.sentry.io/platforms/node/
- **React Integration**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Vite Plugin**: https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/
- **Best Practices**: https://docs.sentry.io/product/best-practices/

---

## Support

For questions or issues:
1. Check Sentry documentation
2. Review GitHub issues in this repository
3. Contact the development team
4. Open a support ticket with Sentry

**Last Updated**: December 9, 2025
