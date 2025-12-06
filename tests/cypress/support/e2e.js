import './commands';
import './helpers';

// Hide fetch/XHR requests in command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Preserve session data between tests (Cypress 12+ syntax)
// Use cy.session() in individual tests if you need session management

// Global error handler
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false prevents Cypress from failing the test
  return false;
});
