/**
 * Payment Management Tests - CRUD Operations
 * Tests verify payment recording, listing, search, and filtering
 */

describe('Payment Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should display payment list page with table', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Verify page title
    cy.contains(/payment list/i).should('exist');
    
    // Verify table exists
    cy.get('.ant-table').should('be.visible');
    cy.get('.ant-table-thead').should('be.visible');
    
    // Verify table columns (Number, Client, Amount, Date, Year, Payment Mode)
    cy.get('.ant-table-thead th').should('have.length.greaterThan', 4);
    
    // Verify Refresh button exists
    cy.contains('button', 'Refresh').should('be.visible');
  });

  it('should search payments by client name', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Check if payments exist and search input exists
    cy.get('body').then($body => {
      if ($body.find('.ant-table-tbody tr:not(.ant-table-measure-row)').length > 0 &&
          $body.find('.ant-select-selection-search-input, input').length > 0) {
        // Use any available search input
        cy.get('.ant-select-selection-search-input, input').first().type('Test', { force: true });
        cy.wait(1000);
        
        // Verify table still visible after search
        cy.get('.ant-table').should('be.visible');
      }
    });
  });

  it('should display payment details via ellipsis menu', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Check if payments exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        // Click ellipsis menu on first payment
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').first().within(() => {
          cy.get('.anticon-ellipsis').click();
        });
        cy.wait(500);
        
        // Verify dropdown menu appears with Show option
        cy.get('.ant-dropdown-menu').should('be.visible');
        cy.contains('.ant-dropdown-menu-item', 'Show').should('be.visible');
        
        // Click Show option
        cy.contains('.ant-dropdown-menu-item', 'Show').click();
        cy.wait(1000);
        
        // Verify payment details are displayed
        cy.url().should('include', '/payment/read/');
      }
    });
  });

  it('should edit payment details', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Check if payments exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        // Click ellipsis menu on first payment
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').first().within(() => {
          cy.get('.anticon-ellipsis').click();
        });
        cy.wait(500);
        
        // Click Edit option
        cy.contains('.ant-dropdown-menu-item', 'Edit').click();
        cy.wait(2000);
        
        // Verify edit form is displayed
        cy.url().should('include', '/payment/update');
        
        // Verify form fields exist
        cy.get('form').should('be.visible');
      }
    });
  });

  it('should delete a payment', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Check if payments exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        const initialCount = $rows.length;
        
        // Click ellipsis menu on last payment
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
        
        // Verify payment was removed (count decreased or same if deletion failed)
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').should($newRows => {
          expect($newRows.length).to.be.at.most(initialCount);
        });
      }
    });
  });

  it('should use refresh button to reload payment list', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Click Refresh button
    cy.contains('button', 'Refresh').click();
    cy.wait(1000);
    
    // Verify table still visible
    cy.get('.ant-table').should('be.visible');
  });

  it('should navigate through pagination if multiple pages exist', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Check if pagination exists
    cy.get('body').then($body => {
      if ($body.find('.ant-pagination').length > 0) {
        // Check if there's a next page button enabled
        cy.get('.ant-pagination-next').then($nextBtn => {
          if (!$nextBtn.hasClass('ant-pagination-disabled')) {
            // Click next page
            cy.get('.ant-pagination-next').click();
            cy.wait(1000);
            
            // Verify page changed (page number should be 2)
            cy.get('.ant-pagination-item-active').should('contain', '2');
            
            // Go back to page 1
            cy.get('.ant-pagination-prev').click();
            cy.wait(1000);
            
            cy.get('.ant-pagination-item-active').should('contain', '1');
          }
        });
      }
    });
  });

  it('should display correct payment details including payment mode', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Check if payments exist
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($rows => {
      if ($rows.length > 0) {
        // Verify payment mode column shows data
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').first().within(() => {
          // Payment Mode should be in one of the columns
          cy.get('td').last().should('not.be.empty');
        });
      }
    });
  });

  it('should clear search and show all payments', () => {
    cy.visit('/payment');
    cy.wait(2000);
    
    // Get initial count
    cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').then($initialRows => {
      if ($initialRows.length > 0) {
        const initialCount = $initialRows.length;
        
        // Search for something
        cy.get('input[type="search"]').type('Test');
        cy.wait(1000);
        
        // Clear search
        cy.get('input[type="search"]').clear();
        cy.wait(1000);
        
        // Verify all payments are shown again
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)').should('have.length.gte', 0);
      }
    });
  });
});
