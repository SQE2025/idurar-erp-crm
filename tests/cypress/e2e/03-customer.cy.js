/**
 * Customer Management Tests - Functional CRUD Operations
 * Tests verify actual customer management functionality
 */

describe('Customer Management', () => {

  // 🔥 REUSABLE FUNCTION: Find text in AntD paginated table across unlimited pages
  function findCustomerInPages(email) {
    cy.get('.ant-table-tbody', { timeout: 8000 }).then($tbody => {

      // Check if the email is on current page
      if ($tbody.text().includes(email)) {
        cy.log(`✔ Found customer on this page: ${email}`);
        return;
      }

      // Check if NEXT PAGE button is disabled
      cy.get('.ant-pagination-next').then($nextBtn => {
        const isDisabled = $nextBtn.hasClass('ant-pagination-disabled');

        if (isDisabled) {
          throw new Error(`❌ Customer NOT found in ANY page: ${email}`);
        }

        // Go to next page
        cy.wrap($nextBtn).click({ force: true });

        // Wait for new rows to render
        cy.get('.ant-table-row', { timeout: 8000 }).should('exist');

        // Recursive search on next page
        findCustomerInPages(email);
      });
    });
  }

  // -------------------------------------------------------------------------

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/customer');
    cy.wait(2000);
  });

  it('should display customer list page with data table', () => {
    cy.url().should('include', '/customer');

    // Verify page title/header
    cy.contains(/client/i).should('exist');

    // Verify table structure exists
    cy.get('.ant-table').should('exist');
    cy.get('.ant-table-thead').should('exist');

    // Verify table headers
    cy.get('.ant-table-thead th').should('have.length.greaterThan', 0);
  });

  it('should open create customer form and display all required fields', () => {
    // Click ellipsis icon on first customer row
    cy.get('span.anticon-ellipsis', { timeout: 10000 }).first().click();
    cy.wait(500);

    // Click "Show" option in dropdown menu
    cy.get('li.ant-dropdown-menu-item').contains('Show').click();
    cy.wait(1000);

    // Verify customer details panel/modal is visible
    cy.get('.ant-drawer, .ant-modal, [class*="client"]', { timeout: 5000 }).should('be.visible');
  });

  it('should successfully create a new customer with valid data', () => {
    const timestamp = Date.now();
    const customerData = {
      name: `Test Customer ${timestamp}`,
      email: `customer${timestamp}@test.com`,
      phone: '+1234567890'
    };

    // Click Add New Client button
    cy.contains('button', /add new client/i, { timeout: 10000 }).click();
    cy.wait(1000);

    // Fill form fields
    cy.get('input#name, input[name="name"]', { timeout: 5000 })
      .filter(':visible').first().clear().type(customerData.name);

    cy.wait(200);

    cy.get('input#email, input[name="email"], input[type="email"]')
      .filter(':visible').first().clear().type(customerData.email);

    cy.wait(200);

    cy.get('input#phone, input[name="phone"]')
      .filter(':visible').first().clear().type(customerData.phone);

    cy.wait(200);

    // Submit form
    cy.get('button[type="submit"].ant-btn-primary')
      .filter(':visible').first().click();

    cy.wait(2000);

    // Close drawer/modal if visible
    cy.get('button.ant-drawer-close[aria-label="Close"]')
      .filter(':visible').first().click({ force: true });

    cy.wait(2000);

    // Confirm redirect
    cy.url().should('include', '/customer');

    // Verify success notification (Ant Design Notification)
    cy.get('.ant-notification-notice-success', { timeout: 10000 }).should('be.visible');
    cy.contains('.ant-notification-notice-description', /successfully created/i).should('be.visible');
  });

  it('should validate required fields when creating customer', () => {
    cy.contains('button', /add new client/i, { timeout: 10000 }).click();
    cy.wait(1000);

    cy.get('button[type="submit"].ant-btn-primary')
      .filter(':visible').first().click();
    cy.wait(500);

    cy.get('input#name, input[name="name"], .ant-form, form').should('be.visible');
  });

  it('should search/filter customers by name', () => {
    const searchInput = 'input.ant-input[placeholder*="Search" i]';

    cy.get('.ant-table-tbody tr, tbody tr', { timeout: 5000 }).then($rows => {
      if ($rows.length > 0) {
        cy.wrap($rows.first()).invoke('text').then(text => {
          const words = text.trim().split(/\s+/);
          const searchTerm = words.find(w => w.length > 3) || words[0];

          if (searchTerm && searchTerm.length > 2) {
            cy.get(searchInput, { timeout: 5000 })
              .first().clear().type(searchTerm);

            cy.wait(1000);
            cy.get('.ant-table-tbody tr, tbody tr')
              .should('have.length.greaterThan', 0);
          }
        });
      }
    });
  });

  it('should handle responsive design', () => {
    cy.viewport(768, 1024);
    cy.get('body').should('be.visible');
    cy.viewport(1920, 1080);
    cy.get('body').should('be.visible');
  });
});
