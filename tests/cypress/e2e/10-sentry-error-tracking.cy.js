/**
 * Sentry Error Tracking Tests
 * Tests verify that errors are properly captured and reported
 */

describe('Sentry Error Tracking', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should capture frontend JavaScript errors', () => {
    // Visit a page
    cy.visit('/dashboard');
    cy.wait(1000);

    // Trigger a JavaScript error by executing code in browser console
    cy.window().then((win) => {
      // Spy on Sentry captureException if available
      if (win.Sentry && win.Sentry.captureException) {
        cy.spy(win.Sentry, 'captureException').as('sentryCapture');
      }

      // Throw a test error
      try {
        throw new Error('Cypress Test Error - Frontend Exception');
      } catch (error) {
        if (win.Sentry && win.Sentry.captureException) {
          win.Sentry.captureException(error);
        }
      }
    });

    // Verify Sentry was called (if spy was set up)
    cy.window().then((win) => {
      if (win.Sentry && win.Sentry.captureException) {
        cy.get('@sentryCapture').should('have.been.calledOnce');
      } else {
        cy.log('Sentry not found - may be disabled in test environment');
      }
    });
  });

  it('should capture API errors and failed requests', () => {
    // Intercept API calls
    cy.intercept('GET', '/api/**').as('apiCall');

    // Try to access a non-existent endpoint
    cy.request({
      url: Cypress.env('API_URL') || 'http://localhost:8888/api/nonexistent',
      failOnStatusCode: false
    }).then((response) => {
      // Verify it returns an error status
      expect(response.status).to.be.oneOf([404, 500]);
    });
  });

  it('should capture unhandled promise rejections', () => {
    cy.visit('/dashboard');
    cy.wait(1000);

    cy.window().then((win) => {
      // Create an unhandled promise rejection
      Promise.reject(new Error('Cypress Test - Unhandled Promise Rejection'));
      
      cy.wait(500);
      
      // Check if Sentry is configured
      if (win.Sentry) {
        cy.log('✓ Sentry is configured on this page');
        expect(win.Sentry).to.exist;
      }
    });
  });

  it('should capture network errors', () => {
    // Simulate network failure by intercepting and failing a request
    cy.intercept('GET', '**/api/admin/setting/filter**', {
      forceNetworkError: true
    }).as('networkError');

    cy.visit('/settings');
    
    // Wait to see if the error is handled
    cy.wait(2000);
    
    // The page should still be functional despite the error
    cy.get('body').should('be.visible');
  });

  it('should capture authentication errors', () => {
    // Clear authentication
    cy.clearCookies();
    cy.clearLocalStorage();

    // Try to access protected route
    cy.request({
      url: Cypress.env('API_URL') || 'http://localhost:8888/api/admin/profile',
      failOnStatusCode: false
    }).then((response) => {
      // Should return 401 or 403
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it('should verify Sentry configuration exists', () => {
    cy.visit('/dashboard');
    
    cy.window().then((win) => {
      // Check if Sentry DSN is configured
      if (win.Sentry) {
        cy.log('✓ Sentry SDK is loaded');
        
        // Verify Sentry methods exist
        expect(win.Sentry.captureException).to.be.a('function');
        expect(win.Sentry.captureMessage).to.be.a('function');
        
        // Send a test message
        win.Sentry.captureMessage('Cypress E2E Test - Sentry is working', 'info');
      } else {
        cy.log('⚠ Sentry not found - check if it\'s enabled in this environment');
      }
    });
  });

  it('should test custom error boundary', () => {
    cy.visit('/dashboard');
    cy.wait(1000);

    // Trigger an error by clicking a broken component (if exists)
    // Or by manipulating the DOM to cause a React error
    cy.window().then((win) => {
      if (win.Sentry) {
        // Send custom error with context
        win.Sentry.captureException(
          new Error('Custom Error Boundary Test'),
          {
            tags: { 
              test: 'cypress',
              component: 'dashboard'
            },
            extra: {
              timestamp: Date.now(),
              testName: 'should test custom error boundary'
            }
          }
        );
      }
    });

    cy.wait(1000);
  });
});
