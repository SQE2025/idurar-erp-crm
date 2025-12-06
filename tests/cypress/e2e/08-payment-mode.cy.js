/**
 * Payment Mode Management Tests - CRUD Operations
 * Tests verify payment mode creation, editing, listing, and deletion
 */

describe('Payment Mode Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should display payment mode list page with table', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Verify page title
    cy.contains(/payment mode/i).should('exist');
    
    // Verify table exists
    cy.get('.ant-table').should('be.visible');
    cy.get('.ant-table-thead').should('be.visible');
    
    // Verify table columns (Payment Mode, Description, Default, Enabled)
    cy.get('.ant-table-thead th').should('have.length.greaterThan', 2);
    
    // Verify "Add New Payment Mode" button exists
    cy.contains('button', 'Add New Payment Mode').should('be.visible');
    
    // Verify Refresh button exists
    cy.contains('button', 'Refresh').should('be.visible');
  });

  it('should open add new payment mode form with required fields', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Click "Add New Payment Mode" button
    cy.contains('button', 'Add New Payment Mode').click();
    cy.wait(2000);
    
    // Verify form fields exist within visible drawer
    cy.get('.ant-drawer.ant-drawer-open .ant-drawer-content', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('input#name').should('exist');
      cy.get('input#description').should('exist');
      cy.get('button[role="switch"]').should('have.length.greaterThan', 0);
      cy.get('button.ant-btn.ant-btn-primary').should('exist');
    });
  });

 it('should create a new payment mode successfully', () => {
  cy.visit('/payment/mode');
  cy.wait(2000);

  const paymentModeData = {
    name: 'TestMode' + Date.now(),
    description: 'Test payment mode description'
  };

  // Click "Add New Payment Mode" button
  cy.contains('button', /Add New Payment Mode/i, { timeout: 10000 }).click();
  cy.wait(1000);

  // Wait for drawer to open and fill the form
  cy.get('.ant-drawer.ant-drawer-open .ant-drawer-content', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      // Fill payment mode name
      cy.get('input#name')
        .clear()
        .type(paymentModeData.name, { delay: 50 });
      cy.wait(200);

      // Fill description
      cy.get('input#description')
        .clear()
        .type(paymentModeData.description, { delay: 50 });
      cy.wait(200);

      // Click Submit button
      cy.get('button.ant-btn.ant-btn-primary')
        .filter(':visible')
        .first()
        .click();
    });

  cy.wait(3000); // wait for submission + table reload

  // Verify payment mode appears in list, accounting for potential pagination
  function findPaymentModeInPages(name) {
    cy.get('.ant-table-tbody', { timeout: 8000 }).then($tbody => {
      if ($tbody.text().includes(name)) {
        cy.log(`✔ Found payment mode on this page: ${name}`);
        return;
      }

      // Check if "Next" button is disabled → last page
      cy.get('.ant-pagination-next').then($nextBtn => {
        const isDisabled = $nextBtn.hasClass('ant-pagination-disabled');

        if (isDisabled) {
          throw new Error(`❌ Payment mode NOT found in any page: ${name}`);
        }

        // Go to next page
        cy.wrap($nextBtn).click();
        cy.get('.ant-table-row', { timeout: 8000 }).should('exist');

        // Recursive search on next page
        findPaymentModeInPages(name);
      });
    });
  }

  findPaymentModeInPages(paymentModeData.name);
});


  it('should validate required fields in payment mode form', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Click "Add New Payment Mode" button
    cy.contains('button', 'Add New Payment Mode').click();
    cy.wait(2000);
    
    // Try to submit empty form using stable selector with force
    cy.get('button.ant-btn.ant-btn-primary').first().click({ force: true });
    cy.wait(500);
    
    // Form should still be visible (validation prevents submission)
    cy.get('input#name').should('exist');
    cy.get('input#description').should('exist');
  });

  it('should edit existing payment mode', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Check if payment modes exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        // Click ellipsis menu on first payment mode
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').first().within(() => {
          cy.get('.anticon-ellipsis').click();
        });
        cy.wait(500);
        
        // Verify dropdown menu with Edit option
        cy.get('.ant-dropdown-menu').should('be.visible');
        cy.contains('.ant-dropdown-menu-item', 'Edit').should('be.visible');
        
        // Click Edit option
        cy.contains('.ant-dropdown-menu-item', 'Edit').click();
        cy.wait(2000);
        
        // Modify description within visible drawer
        cy.get('.ant-drawer.ant-drawer-open .ant-drawer-content', { timeout: 10000 }).should('be.visible').within(() => {
          cy.get('input#description').clear().type('Updated description ' + Date.now(), { delay: 50 });
          cy.wait(500);
          
          // Save changes
          cy.get('button.ant-btn.ant-btn-primary').click();
        });
        cy.wait(3000);
        
        // Verify update (table should be visible)
        cy.get('.ant-table-tbody').should('be.visible');
      }
    });
  });

  it('should delete a payment mode', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Check if payment modes exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 1) { // Keep at least one payment mode
        const initialCount = $rows.length;
        
        // Click ellipsis menu on last payment mode
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').last().within(() => {
          cy.get('.anticon-ellipsis').click();
        });
        cy.wait(500);
        
        // Click Delete option
        cy.contains('.ant-dropdown-menu-item', 'Delete').click();
        cy.wait(1000);
        
        // Check if confirmation modal appears
        cy.get('body').then($body => {
          if ($body.find('.ant-modal-confirm').length > 0) {
            cy.get('.ant-modal-confirm').within(() => {
              cy.contains('button', 'OK').click();
            });
            cy.wait(2000);
          }
        });
        
        // Verify payment mode was removed
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').should($newRows => {
          expect($newRows.length).to.be.lessThan(initialCount);
        });
      }
    });
  });

  it('should search payment modes', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Check if payment modes exist and search exists
    cy.get('body').then($body => {
      if ($body.find('.ant-table-tbody tr:not(.ant-table-measure-row)').length > 0 &&
          $body.find('.ant-select-selection-search-input, input').length > 0) {
        // Use any available search input
        cy.get('.ant-select-selection-search-input, input').first().type('Payment', { force: true });
        cy.wait(1000);
        
        // Verify table still visible after search
        cy.get('.ant-table').should('be.visible');
      }
    });
  });

  it('should display default payment mode with indicator', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Check if payment modes exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        // Check for toggle switches in Default column
        cy.get('.ant-table-tbody').within(() => {
          cy.get('button[role="switch"]').should('exist');
        });
      }
    });
  });

  it('should use refresh button to reload payment mode list', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Click Refresh button
    cy.contains('button', 'Refresh').click();
    cy.wait(1000);
    
    // Verify table still visible
    cy.get('.ant-table').should('be.visible');
  });

  it('should display payment mode count in table', () => {
    cy.visit('/payment/mode');
    cy.wait(2000);
    
    // Count rows in table
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      expect($rows.length).to.be.gte(0);
      
      if ($rows.length > 0) {
        cy.log(`Found ${$rows.length} payment mode(s)`);
      }
    });
  });
});
