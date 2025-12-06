// ***********************************************
// Custom commands for authentication
// ***********************************************

/**
 * Login as admin user with actual credentials
 * Uses session to cache authentication across tests
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.session('admin-session', () => {
    cy.visit('/login');
    
    // Wait for page to load
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    
    // Enter actual credentials
    cy.get('input[type="email"]').clear().type('admin@demo.com');
    cy.get('input[type="password"]').clear().type('admin123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for successful login - should redirect away from /login
    cy.url().should('not.include', '/login', { timeout: 10000 });
    
    // Verify we're logged in by checking for dashboard or main app
    cy.get('body').should('contain', 'Dashboard').or('contain', 'Client');
  }, {
    validate() {
      // Verify session is still valid
      cy.getCookie('token').should('exist');
    }
  });
  
  // After session is restored, visit the page
  cy.visit('/');
});

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/login');
});

// ***********************************************
// Custom commands for CRUD operations
// ***********************************************

Cypress.Commands.add('createCustomer', (customerData) => {
  cy.visit('/customer');
  cy.get('[data-cy="add-customer-button"]').click();
  
  Object.keys(customerData).forEach((key) => {
    cy.get(`input[name="${key}"]`).type(customerData[key]);
  });
  
  cy.get('button[type="submit"]').click();
  cy.get('.ant-message-success').should('be.visible');
});

Cypress.Commands.add('deleteCustomer', (customerName) => {
  cy.visit('/customer');
  cy.contains('tr', customerName).within(() => {
    cy.get('[data-cy="delete-button"]').click();
  });
  cy.get('.ant-modal-confirm-btns .ant-btn-primary').click();
  cy.get('.ant-message-success').should('be.visible');
});

// ***********************************************
// Custom assertions
// ***********************************************

Cypress.Commands.add('shouldBeVisible', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.visible');
  return cy.wrap(subject);
});

// ***********************************************
// API commands
// ***********************************************

Cypress.Commands.add('apiLogin', (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.result.token);
    return response.body.result.token;
  });
});

// ***********************************************
// Utility commands
// ***********************************************

Cypress.Commands.add('clearDatabase', () => {
  // Only for test environments
  if (Cypress.env('ENVIRONMENT') === 'test') {
    cy.request('POST', '/api/test/clear-database');
  }
});
