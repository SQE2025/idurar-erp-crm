/**
 * Smoke Tests - Critical Path Verification
 * Fast sanity checks for application health
 */

describe('Smoke Tests', () => {
  it('should load application and login successfully with credentials', () => {
    cy.visit('/login');

    // Wait for form to be visible
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');

    // Enter credentials
    cy.get('input[type="email"]').clear().type('admin@admin.com');
    cy.get('input[type="password"]').clear().type('admin123');

    // Submit
    cy.get('button[type="submit"]').click();

    // Wait for redirect after login
    cy.wait(3000);
    cy.url().should('not.include', '/login');
  });

  it('should access all critical modules', () => {
    cy.loginAsAdmin();

    const modules = [
      { name: 'Customer', url: '/customer' },
      { name: 'Invoice', url: '/invoice' },
      { name: 'Quote', url: '/quote' },
      { name: 'Payment', url: '/payment' }
    ];

    modules.forEach(module => {
      cy.visit(module.url);
      cy.wait(3000);
      cy.url().should('include', module.url);
      cy.get('body').should('be.visible');
      cy.get('div, table, .ant-table').should('have.length.greaterThan', 5);
    });
  });

  it('should handle responsive viewports', () => {
    cy.visit('/login');

    const viewports = [[375, 667], [768, 1024], [1920, 1080]];
    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.get('body').should('be.visible');
    });
  });

  it('should verify backend API accessibility', () => {
    cy.request({ url: 'http://localhost:8888/api/hello', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 401]);
  });
});
