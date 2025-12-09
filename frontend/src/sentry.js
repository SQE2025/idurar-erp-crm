import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for frontend error tracking and performance monitoring
 * Only enabled in production and staging environments
 */
export function initSentry() {
  // Only initialize in production or staging
  const isProduction = import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging';
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (isProduction && sentryDsn) {
    try {
      Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE || 'development',
        
        // Performance Monitoring
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            // Mask all text and images by default
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        
        // Capture 100% of transactions for performance monitoring
        // Reduce in production if needed to control costs
        tracesSampleRate: 1.0,
        
        // Session Replay - captures user interactions
        replaysSessionSampleRate: 0.1, // 10% of normal sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
        
        // Enable only when DSN is configured
        enabled: !!sentryDsn,
        
        // Release tracking (optional - set from CI/CD)
        release: import.meta.env.VITE_APP_VERSION || 'idurar-erp-crm@4.1.0',
        
        // Filter out sensitive information
        beforeSend(event, hint) {
          // Remove cookies and sensitive headers
          if (event.request) {
            delete event.request.cookies;
            if (event.request.headers) {
              delete event.request.headers.Authorization;
              delete event.request.headers.Cookie;
            }
          }
          
          // Don't send errors from browser extensions
          if (event.exception) {
            const values = event.exception.values || [];
            for (const value of values) {
              if (value.stacktrace) {
                const frames = value.stacktrace.frames || [];
                for (const frame of frames) {
                  if (frame.filename && (
                    frame.filename.includes('chrome-extension://') ||
                    frame.filename.includes('moz-extension://') ||
                    frame.filename.includes('safari-extension://')
                  )) {
                    return null; // Don't send this error
                  }
                }
              }
            }
          }
          
          return event;
        },
        
        // Ignore common errors that aren't actionable
        ignoreErrors: [
          // Network errors
          'NetworkError',
          'Network request failed',
          'Failed to fetch',
          
          // Browser extensions
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          
          // User canceled actions
          'AbortError',
          'The operation was aborted',
        ],
      });
      
      console.log('✅ Sentry frontend tracking initialized');
      console.log(`   Environment: ${import.meta.env.MODE}`);
      console.log(`   Release: ${import.meta.env.VITE_APP_VERSION || '4.1.0'}`);
    } catch (error) {
      console.error('⚠️ Failed to initialize Sentry:', error);
    }
  } else {
    console.log('ℹ️ Sentry not initialized (development mode or DSN not configured)');
  }
}

/**
 * Manually capture an exception with additional context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context (tags, extra data, user info)
 */
export function captureException(error, context = {}) {
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging') {
    Sentry.captureException(error, context);
  } else {
    console.error('Error captured (dev mode):', error, context);
  }
}

/**
 * Manually capture a message
 * @param {string} message - The message to capture
 * @param {string} level - Severity level: 'info', 'warning', 'error'
 */
export function captureMessage(message, level = 'info') {
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`Message captured (dev mode) [${level}]:`, message);
  }
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information (id, email, username)
 */
export function setUser(user) {
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging') {
    Sentry.setUser(user);
  }
}

/**
 * Clear user context
 */
export function clearUser() {
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging') {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for tracking user actions
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging') {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
};
