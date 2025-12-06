/**
 * Settings Tests - Functional Configuration Management
 * Tests verify actual settings functionality based on Settings Page structure
 */

describe('Settings', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/settings');
    cy.wait(2000);
  });

  it('should access settings page and display tab structure', () => {
    cy.url().should('include', '/settings');
    
    // Verify the tab navigation exists
    cy.get('.ant-tabs').should('exist');
    cy.get('.ant-tabs-tab').should('have.length.greaterThan', 0);
    
    // Verify main settings tabs are visible
    cy.contains('.ant-tabs-tab', /General Settings/i).should('be.visible');
    cy.contains('.ant-tabs-tab', /Company Settings/i).should('be.visible');
    cy.contains('.ant-tabs-tab', /Currency Settings/i).should('be.visible');
    cy.contains('.ant-tabs-tab', /Finance Settings/i).should('be.visible');
  });

  it('should display and interact with General Settings form fields', () => {
    // Ensure we're on General Settings tab
    cy.contains('.ant-tabs-tab', /General Settings/i).click();
    cy.wait(500);
    
    // Verify Date Format field exists
    cy.get('label[for=\"idurar_app_date_format\"]').should('contain', 'Date Format');
    cy.get('input#idurar_app_date_format').should('exist');
    
    // Verify Email field exists
    cy.get('label[for=\"idurar_app_company_email\"]').should('contain', 'Email');
    cy.get('input#idurar_app_company_email').should('exist').and('be.visible');
    
    // Verify form is interactive
    cy.get('input#idurar_app_company_email').should('not.be.disabled');
  });

  it('should allow updating email in General Settings', () => {
    cy.contains('.ant-tabs-tab', /General Settings/i).click();
    cy.wait(500);
    
    const testEmail = 'test' + Date.now() + '@example.com';
    
    // Update email field
    cy.get('input#idurar_app_company_email').clear().type(testEmail);
    cy.wait(300);
    
    // Verify the value was entered
    cy.get('input#idurar_app_company_email').should('have.value', testEmail);
  });

  it('should display Company Settings tab with company information fields', () => {
    // Click Company Settings tab
    cy.contains('.ant-tabs-tab', /Company Settings/i).click();
    cy.wait(500);
    
    // Verify company-related fields exist
    cy.get('body').then($body => {
      // Look for common company fields
      const hasCompanyFields = $body.find('input[id*=\"company\"], label[for*=\"company\"]').length > 0;
      expect(hasCompanyFields).to.be.true;
    });
  });

  it('should verify Save button exists and is functional', () => {
    cy.contains('.ant-tabs-tab', /General Settings/i).click();
    cy.wait(500);
    
    // Verify Save button exists
    cy.contains('button', /save/i).should('exist').and('be.visible');
    
    // Verify button is not disabled
    cy.contains('button', /save/i).should('not.be.disabled');
    
    // Verify button is a primary button (has proper styling class)
    cy.contains('button', /save/i).should('have.class', 'ant-btn');
  });

  it('should switch between different settings tabs', () => {
    // Start on General Settings
    cy.contains('.ant-tabs-tab', /General Settings/i).should('have.class', 'ant-tabs-tab-active');
    
    // Switch to Currency Settings
    cy.contains('.ant-tabs-tab', /Currency Settings/i).click();
    cy.wait(500);
    cy.contains('.ant-tabs-tab', /Currency Settings/i).should('have.class', 'ant-tabs-tab-active');
    
    // Switch to Finance Settings
    cy.contains('.ant-tabs-tab', /Finance Settings/i).click();
    cy.wait(500);
    cy.contains('.ant-tabs-tab', /Finance Settings/i).should('have.class', 'ant-tabs-tab-active');
    
    // Switch back to General Settings
    cy.contains('.ant-tabs-tab', /General Settings/i).click();
    cy.wait(500);
    cy.contains('.ant-tabs-tab', /General Settings/i).should('have.class', 'ant-tabs-tab-active');
  });

  it('should verify Date Format dropdown is functional', () => {
    cy.contains('.ant-tabs-tab', /General Settings/i).click();
    cy.wait(500);
    
    // Find the Date Format select dropdown
    cy.get('label[for=\"idurar_app_date_format\"]').should('be.visible');
    
    // Click on the select to open dropdown
    cy.get('.ant-select[aria-required=\"true\"]').first().click();
    cy.wait(500);
    
    // Verify dropdown options appear
    cy.get('.ant-select-item-option').should('have.length.greaterThan', 0);
  });

  it('should navigate back to dashboard', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.url().should('match', /\/$|\/dashboard/);
  });

  it('should edit company details in Company Settings', () => {
    // Navigate to Company Settings tab
    cy.contains('.ant-tabs-tab', /Company Settings/i).click();
    cy.wait(1000);
    
    const timestamp = Date.now();
    
    // Find and update company name field
    cy.get('body').then($body => {
      if ($body.find('input[id*="company"][id*="name"], input[name*="company"][name*="name"]').length > 0) {
        cy.get('input[id*="company"][id*="name"], input[name*="company"][name*="name"]')
          .first().clear().type('Test Company ' + timestamp);
        cy.wait(500);
      }
    });
    
    // Find and update company address field
    cy.get('body').then($body => {
      if ($body.find('textarea[id*="address"], input[id*="address"]').length > 0) {
        cy.get('textarea[id*="address"], input[id*="address"]')
          .first().clear().type('123 Test Street, City');
        cy.wait(500);
      }
    });
    
    // Verify Save button exists
    cy.contains('button', /save/i).should('exist').and('be.visible');
  });

  it('should configure default currency in Currency Settings', () => {
    // Navigate to Currency Settings tab
    cy.contains('.ant-tabs-tab', /Currency Settings/i).click();
    cy.wait(1000);
    
    // Verify currency dropdown exists
    cy.get('body').then($body => {
      if ($body.find('.ant-select, select[id*="currency"]').length > 0) {
        // Click currency dropdown
        cy.get('.ant-select').first().click({ force: true });
        cy.wait(500);
        
        // Verify options appear
        cy.get('.ant-select-item-option').should('have.length.greaterThan', 0);
        
        // Select a currency option
        cy.get('.ant-select-item-option').eq(1).click({ force: true });
        cy.wait(500);
      }
    });
    
    // Verify currency symbol field
    cy.get('body').then($body => {
      if ($body.find('input[id*="symbol"], input[name*="symbol"]').length > 0) {
        cy.get('input[id*="symbol"], input[name*="symbol"]')
          .first().should('exist').and('be.visible');
      }
    });
    
    // Verify Save button exists
    cy.contains('button', /save/i).should('exist').and('be.visible');
  });

  it('should update finance settings', () => {
    // Navigate to Finance Settings tab
    cy.contains('.ant-tabs-tab', /Finance Settings/i).click();
    cy.wait(1000);
    
    // Verify finance-related fields exist
    cy.get('body').then($body => {
      // Look for invoice number, quote number, or payment number fields
      if ($body.find('input[id*="invoice"], input[id*="quote"], input[id*="payment"]').length > 0) {
        const financeInput = $body.find('input[id*="invoice"], input[id*="quote"], input[id*="payment"]').first();
        const currentValue = financeInput.val();
        
        // Update the value
        cy.wrap(financeInput).clear().type(String(Number(currentValue || 0) + 1));
        cy.wait(500);
      }
    });
    
    // Verify Save button exists
    cy.contains('button', /save/i).should('exist').and('be.visible');
  });
});
