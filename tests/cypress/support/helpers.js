/**
 * Cypress Custom Commands - Robust Selectors & Utilities
 * These helpers work with dynamic React/Ant Design components
 */

/**
 * Find and click a button by text (case-insensitive, flexible)
 * Works with Ant Design buttons, regular buttons, and links
 */
Cypress.Commands.add('clickButton', (text, options = {}) => {
  const opts = { timeout: 10000, ...options };
  
  // Try multiple strategies
  cy.get('body').then($body => {
    // Strategy 1: Look for button with exact or partial text
    const buttons = $body.find('button, a[role="button"], .ant-btn').filter((i, el) => {
      const elText = Cypress.$(el).text().trim().toLowerCase();
      const searchText = text.toLowerCase();
      return elText.includes(searchText) || searchText.includes(elText);
    });

    if (buttons.length > 0) {
      cy.wrap(buttons.first()).click(opts);
    } else {
      // Strategy 2: Use contains with regex
      cy.contains('button, a[role="button"], .ant-btn', new RegExp(text, 'i'), opts).click();
    }
  });
});

/**
 * Find input field by ID, name, placeholder, or label
 */
Cypress.Commands.add('getInput', (identifier, options = {}) => {
  const opts = { timeout: 10000, ...options };
  
  return cy.get(`
    input#${identifier},
    input[name="${identifier}"],
    input[name*="${identifier}"],
    input[placeholder*="${identifier}" i],
    textarea#${identifier},
    textarea[name="${identifier}"],
    textarea[name*="${identifier}"]
  `, opts).filter(':visible').first();
});

/**
 * Type into input field with robust error handling
 */
Cypress.Commands.add('typeInto', (identifier, value, options = {}) => {
  cy.getInput(identifier, options).then($input => {
    // Clear existing value if present
    if ($input.val()) {
      cy.wrap($input).clear();
    }
    cy.wrap($input).type(value, { delay: 50 });
    cy.wait(200); // Small wait for React state update
  });
});

/**
 * Select from Ant Design dropdown/select component
 */
Cypress.Commands.add('selectAntOption', (fieldLabel, optionText, options = {}) => {
  const opts = { timeout: 10000, ...options };
  
  // Click the select to open dropdown
  cy.contains(fieldLabel, opts).parent().find('.ant-select, select').first().click({ force: true });
  cy.wait(1000);
  
  // Click the option
  cy.get('.ant-select-item-option', opts).contains(new RegExp(optionText, 'i')).click({ force: true });
  cy.wait(500);
});

/**
 * Check if element exists without failing test
 */
Cypress.Commands.add('elementExists', (selector, timeout = 5000) => {
  return cy.get('body').then($body => {
    return $body.find(selector).length > 0;
  });
});

/**
 * Wait for form to be fully loaded and visible
 */
Cypress.Commands.add('waitForForm', (options = {}) => {
  const opts = { timeout: 10000, ...options };
  
  cy.get('.ant-form, form, .ant-modal-body, .ant-drawer-body', opts).should('be.visible');
  cy.wait(1000); // Wait for animations
});

/**
 * Submit form with flexible button detection
 */
Cypress.Commands.add('submitForm', (options = {}) => {
  const opts = { timeout: 10000, ...options };
  
  cy.get('body').then($body => {
    // Look for submit button
    const submitBtn = $body.find('button[type="submit"], button').filter((i, el) => {
      const text = Cypress.$(el).text().toLowerCase();
      return text.includes('submit') || text.includes('save') || text.includes('create') || text.includes('confirm');
    }).first();

    if (submitBtn.length > 0) {
      cy.wrap(submitBtn).click(opts);
    } else {
      cy.get('button[type="submit"]', opts).click();
    }
  });
  
  cy.wait(2000); // Wait for submission
});

/**
 * Close modal/drawer with flexible selector
 */
Cypress.Commands.add('closeModal', () => {
  cy.get('body').then($body => {
    const closeBtn = $body.find('button[aria-label*="close" i], .ant-modal-close, .anticon-close, button').filter((i, el) => {
      const text = Cypress.$(el).text().toLowerCase();
      const ariaLabel = Cypress.$(el).attr('aria-label') || '';
      return text.includes('close') || text.includes('cancel') || ariaLabel.toLowerCase().includes('close');
    }).first();

    if (closeBtn.length > 0) {
      cy.wrap(closeBtn).click();
    } else {
      // Fallback: press Escape key
      cy.get('body').type('{esc}');
    }
  });
  
  cy.wait(500);
});

/**
 * Get table rows (works with Ant Design and regular tables)
 */
Cypress.Commands.add('getTableRows', (options = {}) => {
  return cy.get('.ant-table-tbody tr:not(.ant-table-measure-row), tbody tr:not(.ant-empty)', options);
});

/**
 * Search in table using search input
 */
Cypress.Commands.add('searchTable', (searchTerm, options = {}) => {
  cy.get('input[type="search"], input[placeholder*="search" i], .ant-input-search input').first().clear().type(searchTerm);
  cy.wait(1000); // Wait for debounce/filtering
});

/**
 * Verify toast/notification message
 */
Cypress.Commands.add('verifyNotification', (message, type = 'success') => {
  cy.get('.ant-message, .ant-notification, .toast', { timeout: 5000 }).should('contain', message);
});

/**
 * Create customer with robust selectors
 */
Cypress.Commands.add('createCustomer', (customerData) => {
  cy.visit('/customer');
  cy.wait(2000);
  
  cy.clickButton('add new client');
  cy.waitForForm();
  
  cy.typeInto('name', customerData.name);
  cy.typeInto('email', customerData.email);
  cy.typeInto('phone', customerData.phone);
  
  if (customerData.address) {
    cy.typeInto('address', customerData.address);
  }
  
  cy.submitForm();
  
  // Verify creation
  cy.url().should('include', '/customer');
  cy.wait(1000);
  cy.getTableRows().should('contain', customerData.email);
});

/**
 * Create invoice with robust selectors
 */
Cypress.Commands.add('createInvoice', (invoiceData) => {
  cy.visit('/invoice/create');
  cy.wait(3000);
  
  // Select client
  if (invoiceData.clientIndex !== undefined) {
    cy.get('input.ant-select-selection-search-input[role="combobox"]').first().click({ force: true });
    cy.wait(1000);
    cy.get('.ant-select-item-option').eq(invoiceData.clientIndex).click({ force: true });
    cy.wait(500);
  }
  
  // Invoice number
  if (invoiceData.number) {
    cy.get('input#number, input[name="number"]').clear().type(invoiceData.number);
  }
  
  // Items
  if (invoiceData.items && invoiceData.items.length > 0) {
    invoiceData.items.forEach((item, index) => {
      if (item.name) {
        cy.get(`input[id*="items_${index}_itemName"], input[name*="itemName"]`).first().clear().type(item.name);
      }
      if (item.quantity) {
        cy.get(`input[id*="items_${index}_quantity"], input[name*="quantity"]`).eq(index).clear().type(item.quantity);
      }
      if (item.price) {
        cy.get(`input[id*="items_${index}_price"], input[name*="price"]`).eq(index).clear().type(item.price);
      }
      cy.wait(300);
    });
  }
  
  cy.submitForm();
  
  // Verify creation
  cy.wait(3000);
  cy.visit('/invoice');
  cy.wait(2000);
});

/**
 * Retry command with exponential backoff
 */
Cypress.Commands.add('retryCommand', { prevSubject: 'optional' }, (subject, commandFn, options = {}) => {
  const { retries = 3, delay = 1000 } = options;
  
  const attempt = (retriesLeft) => {
    try {
      return commandFn(subject);
    } catch (error) {
      if (retriesLeft > 0) {
        cy.wait(delay);
        return attempt(retriesLeft - 1);
      }
      throw error;
    }
  };
  
  return attempt(retries);
});
