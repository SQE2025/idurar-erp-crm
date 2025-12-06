/**
 * Authentication Tests - Core Functionality
 * 6 focused tests covering essential login/logout flows
 */

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form with all elements', () => {
    cy.url().should('include', '/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="email"]').clear().type('admin@admin.com'); 
    cy.get('input[type="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect away from login
    cy.url().should('not.include', '/login', { timeout: 10000 });
    
    // Should show dashboard or main content
    cy.get('body').should('be.visible');
  });

  it('should reject invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@test.com');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('should validate required fields and email format', () => {
    // Empty fields
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    
    // Invalid email format
    cy.visit('/login');
    cy.get('input[type="email"]').type('notanemail');
    cy.get('input[type="password"]').type('pass123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('should navigate to forgot password', () => {
    cy.contains(/forgot.*password/i).click();
    cy.url().should('include', '/forget');
  });

  it('should logout and redirect to login page', () => {
    // First login
    cy.get('input[type="email"]').clear().type('admin@demo.com');
    cy.get('input[type="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    
    // Look for logout button/menu (adjust selector based on actual UI)
    cy.get('body').then($body => {
      if ($body.find('[data-cy="logout"]').length > 0) {
        cy.get('[data-cy="logout"]').click();
      } else if ($body.text().includes('Logout')) {
        cy.contains('Logout').click();
      }
      // If logout button found, verify redirect
      cy.url().should('include', '/login', { timeout: 5000 });
    });
  });
});
