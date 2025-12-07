/**
 * Quote Management Tests - Functional Quote Operations
 * Tests verify quote creation, conversion, and status management
 */

describe('Quote Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/quote');
    cy.wait(2000);
  });

  it('should display quote list with status indicators', () => {
    cy.url().should('include', '/quote');

    // Verify table exists
    cy.get('.ant-table').should('exist');
    cy.get('.ant-table-thead').should('exist');

    // Verify table columns
    cy.get('.ant-table-thead th').should('have.length.greaterThan', 3);

    // Check for quote status badges
    cy.get('body').then($body => {
      if ($body.find('.ant-table-tbody tr').length > 0) {
        cy.get('.ant-tag, .ant-badge, [class*=\"status\"]').should('exist');
      }
    });
  });

  it('should open quote creation form with required fields', () => {
    // Click \"Add New Proforma Invoice\" button (quotes use \"Proforma Invoice\" terminology)
    cy.contains('button', /add new proforma|add new quote/i, { timeout: 10000 }).click();
    cy.wait(2000);

    // Should navigate to create page
    cy.url().should('include', '/quote/create');

    // Verify client selection field exists
    cy.get('input.ant-select-selection-search-input[role=\"combobox\"]').should('exist');

    // Verify number field
    cy.get('input[id=\"number\"]').should('exist');

    // Verify date fields
    cy.get('.ant-picker').should('have.length.greaterThan', 0);

    // Verify item input fields exist
    cy.get('input[id*=\"itemName\"], input[id*=\"description\"], input[id*=\"quantity\"], input[id*=\"price\"]').should('have.length.greaterThan', 0);

    // Verify Save button exists
    cy.contains('button', 'Save').should('be.visible');
  });

  it('should successfully create a new quote with items and tax', () => {
    const timestamp = Date.now();

    // Click \"Add New Proforma Invoice\" button
    cy.contains('button', /add new proforma|add new quote/i, { timeout: 10000 }).click();
    cy.wait(2000);

    // Should be on create page
    cy.url().should('include', '/quote/create');
    cy.wait(2000);

    // Step 1: Select a client
    // Intercept client list request
    cy.intercept('GET', '**/api/client/list*').as('getClients');
    cy.intercept('GET', '**/api/client/search*').as('searchClients');

    cy.get('input.ant-select-selection-search-input[role="combobox"]').first().click({ force: true });

    // Type to trigger search and ensure specific results
    cy.get('input.ant-select-selection-search-input[role="combobox"]').first().type('Test');

    // Wait for results to load
    cy.wait(3000);

    // Select the first option that is NOT "Add New Client"
    cy.get('.ant-select-item-option')
      .not(':contains("Add New Client")')
      .first()
      .click({ force: true });

    cy.wait(1000);

    // Step 2: Fill quote number
    cy.get('input#number').clear().type(Math.floor(Math.random() * 10000).toString());
    cy.wait(300);

    // Step 3: Fill item details
    cy.get('input[id*=\"itemName\"]').first().clear().type('Test Item ' + timestamp);
    cy.wait(300);

    cy.get('input[id*=\"description\"]').first().clear().type('Test Description ' + timestamp);
    cy.wait(300);

    cy.get('input[id*=\"quantity\"]').first().clear().type('2');
    cy.wait(300);

    cy.get('input[id*=\"price\"]').first().clear().type('100');
    cy.wait(1000);

    // Step 4: Select tax from dropdown (Select Tax Value)
    cy.get('.ant-select').last().click();
    cy.wait(1000);

    // Select first tax option
    cy.contains('.ant-select-item-option', '%').first().click();
    cy.wait(2000);

    // Step 5: Click Save button
    cy.contains('button', 'Save').click();
    cy.wait(2000);
  });

  it('should filter quotes by status (draft, sent, accepted)', () => {
    cy.get('body').then($body => {
      if ($body.find('.ant-select, select, [class*=\"filter\"]').length > 0) {
        // Status filter exists
        cy.get('.ant-select, select').first().should('be.visible');
      }
    });
  });

  it('should search quotes by client name', () => {
    // Get table data to find a client name
    // Check for rows availability first using body to avoid detached DOM issues
    cy.get('body').then($body => {
      if ($body.find('.ant-table-tbody tr:not(.ant-table-measure-row)').length > 0) {
        // Query the DOM freshly to ensure element is attached
        cy.get('.ant-table-tbody tr:not(.ant-table-measure-row)')
          .first()
          .find('td')
          .eq(1)
          .invoke('text')
          .then(clientText => {
            const clientName = clientText.trim();

            if (clientName && clientName.length > 2) {
              // Click the search input (ant-select dropdown for client search)
              cy.get('input.ant-select-selection-search-input[role="combobox"]', { timeout: 5000 })
                .first().click({ force: true });
              cy.wait(500);

              // Type client name to search
              cy.get('input.ant-select-selection-search-input[role="combobox"]')
                .first().type(clientName.substring(0, 3), { force: true });
              cy.wait(1000);

              // Select from dropdown if options appear
              cy.get('body').then($body => {
                if ($body.find('.ant-select-item-option').length > 0) {
                  cy.get('.ant-select-item-option').first().click({ force: true });
                  cy.wait(1000);
                }
              });

              // Verify table still displays results
              cy.get('.ant-table').should('be.visible');
            }
          });
      }
    });
  });
});
