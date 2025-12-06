// ***********************************************
// Custom commands for authentication
// ***********************************************

Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.get('button[type="submit"]').click();
  cy.wait(3000);
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
