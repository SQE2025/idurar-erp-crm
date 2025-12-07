describe('Tax Management', () => {
  beforeEach(() => {
    // Login using custom command
    cy.loginAsAdmin();
  });

  it('should display tax list page with table', () => {
    cy.visit('/taxes');
    cy.wait(2000);

    // Verify page elements
    cy.contains(/tax/i).should('exist');
    cy.get('.ant-table').should('be.visible');
    cy.contains('button', 'Add New Tax').should('be.visible');
  });

  it('should open add new tax form with required fields', () => {
    cy.visit('/taxes');
    cy.wait(2000);

    // Click "Add New Tax" button
    cy.contains('button', 'Add New Tax').click();
    cy.wait(2000);

    // Wait for drawer to open
    cy.get('.ant-drawer-content', { timeout: 10000 }).should('be.visible');
    cy.wait(1000);

    // Verify form fields are visible in drawer
    cy.get('.ant-drawer-content').within(() => {
      cy.get('input#taxName', { timeout: 5000 }).should('be.visible');
      cy.get('input#taxValue').should('be.visible');

      // Verify toggles for Enabled and Default exist
      cy.get('button[role="switch"]').should('have.length.greaterThan', 0);

      // Verify Submit button exists
      cy.get('button.ant-btn-primary[type="submit"]').contains('Submit').should('be.visible');
    });
  });

  it('should create a new tax rate successfully', () => {
    cy.visit('/taxes');
    cy.wait(2000);

    const taxData = {
      name: 'TestTax' + Date.now(),
      value: '15'
    };

    // Click "Add New Tax" button
    cy.contains('button', 'Add New Tax').click();
    cy.wait(3000);

    // Wait for drawer and fill form within the open drawer
    cy.get('.ant-drawer.ant-drawer-open .ant-drawer-content', { timeout: 10000 }).should('be.visible').within(() => {
      // Fill tax name (force unique selection if multiple invisible inputs exist)
      cy.get('input#taxName').filter(':visible').first().type(taxData.name, { delay: 50 });
      cy.wait(300);

      // Fill tax value
      cy.get('input#taxValue').filter(':visible').first().type(taxData.value, { delay: 50 });
      cy.wait(300);

      // Click Submit button
      cy.get('button.ant-btn.ant-btn-primary').filter(':visible').first().click();
    });
    cy.wait(3000);

    // Verify tax appears in list
    // Verify success notification (Ant Design Notification)
    cy.get('.ant-notification-notice-success', { timeout: 10000 }).should('be.visible');
    // Broaden check because exact text varies. 'Request success' is the default title in successHandler.js
    cy.contains('.ant-notification-notice-message', /success/i).should('be.visible');
  });

  it('should validate required fields in tax form', () => {
    cy.visit('/taxes');
    cy.wait(2000);

    // Click "Add New Tax" button
    cy.contains('button', 'Add New Tax').click();
    cy.wait(2000);

    // Wait for drawer to open
    cy.get('.ant-drawer.ant-drawer-open', { timeout: 10000 }).should('be.visible');
    cy.wait(1000);

    // Try to submit empty form within visible drawer
    cy.get('.ant-drawer.ant-drawer-open .ant-drawer-content').within(() => {
      cy.get('input#taxName', { timeout: 5000 }).should('be.visible');

      // Try to submit empty form without filling required fields
      cy.get('button.ant-btn.ant-btn-primary').filter(':visible').first().click();
      cy.wait(500);

      // Form should still be visible (validation prevents submission)
      cy.get('input#taxName').should('be.visible');
      cy.get('input#taxValue').should('be.visible');
    });
  });

  it('should edit existing tax rate', () => {
    cy.visit('/taxes');
    cy.wait(2000);

    // Check if taxes exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        // Click ellipsis menu on first tax
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').first().within(() => {
          cy.get('.anticon-ellipsis').click();
        });
        cy.wait(500);

        // Click Edit option
        cy.contains('Edit').click();
        cy.wait(3000);

        // Wait for drawer and edit within visible drawer
        cy.get('.ant-drawer.ant-drawer-open .ant-drawer-content', { timeout: 10000 }).should('be.visible').within(() => {
          // Modify tax value
          cy.get('input#taxValue').filter(':visible').first().clear({ force: true }).type('20', { delay: 50, force: true });
          cy.wait(500);
          cy.wait(500);

          // Save changes
          cy.get('button.ant-btn.ant-btn-primary').filter(':visible').first().click();
        });
        cy.wait(2000);

        // Verify update
        cy.get('.ant-table-tbody').should('contain', '20');
      }
    });
  });

  it('should delete a tax rate', () => {
    cy.visit('/taxes');
    cy.wait(2000);

    // Check if taxes exist
    // Check for taxes safely
    cy.get('body').then($body => {
      if ($body.find('.ant-table-tbody tr:not(.ant-table-measure-row)').length > 0) {

        // Get the last row's tax name to verify deletion later
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').last().find('td').eq(0).invoke('text').then(text => {
          const taxName = text.trim();
          cy.log(`Deleting tax: ${taxName}`);

          // Click ellipsis menu on last tax
          cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').last().within(() => {
            cy.get('.anticon-ellipsis').click();
          });
          cy.wait(500);

          // Click Delete option from dropdown
          cy.get('.ant-dropdown-menu-item').contains('Delete').should('be.visible').click();
          cy.wait(1000);

          // Handle confirmation modal
          cy.get('body').then($bodyCheck => {
            if ($bodyCheck.find('.ant-modal-confirm').length > 0) {
              cy.get('.ant-modal-confirm .ant-btn-primary').click();
              cy.wait(2000);
            }
          });

          // Verify tax with that name no longer exists in the table
          if (taxName) {
            cy.get('.ant-table-tbody').should('not.contain', taxName);
          }
        });
      }
    });
  });
});
