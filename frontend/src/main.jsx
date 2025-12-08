import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";

import RootApp from './RootApp';

// Initialize Sentry for error tracking
try {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Setting this option to true will send default PII data to Sentry
      sendDefaultPii: true,
    });
    console.log('✅ Sentry frontend initialized');
  } else {
    console.log('ℹ️ Sentry DSN not configured - error tracking disabled');
  }
} catch (error) {
  console.error('⚠️ Sentry initialization failed:', error);
}

const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);
