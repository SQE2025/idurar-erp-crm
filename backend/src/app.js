const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');

// Initialize Sentry for error tracking and monitoring
// Initialize when DSN is present (any environment)
const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  try {
    const Sentry = require('@sentry/node');
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      // Capture 100% of transactions for performance monitoring
      // Setting this option to true will send default PII data to Sentry
      sendDefaultPii: true,
    });
    console.log('✅ Sentry error tracking initialized');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.log('⚠️ Sentry not available (install @sentry/node for production)');
  }
} else {
  console.log('ℹ️ Sentry DSN not configured - error tracking disabled');
}

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');

const fileUpload = require('express-fileupload');
// create our Express app
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// // default options
// app.use(fileUpload());

// Here our API Routes

app.use('/api', coreAuthRouter);
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// Sentry error handler - must be before other error handlers
if (process.env.SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/node');
    app.use(Sentry.Handlers.errorHandler());
  } catch (error) {
    // Sentry not installed, skip
  }
}

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
