const express = require('express');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

// Public Sentry test endpoint (no auth required)
router.route('/test-sentry').get((req, res) => {
	console.log('⚠️ Public test-sentry endpoint called - throwing error...');
	throw new Error('Test Sentry Backend Error - ' + Date.now());
});

// Sentry's default test endpoint
router.get('/debug-sentry', function mainHandler(req, res) {
	throw new Error('My first Sentry error!');
});

router.route('/login').post(catchErrors(adminAuth.login));

router.route('/forgetpassword').post(catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

module.exports = router;
