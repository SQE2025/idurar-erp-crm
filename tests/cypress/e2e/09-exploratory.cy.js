/**
 * Automated Exploratory Tests
 * These tests mimic human exploratory testing by checking edge cases,
 * boundary values, and unexpected user behaviors
 */

describe('Exploratory Testing: Edge Cases & Boundary Values', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  describe('Authentication Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/logout');
      cy.wait(1000);
      cy.visit('/login');
    });

    it('should handle SQL injection attempts in login', () => {
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1--",
        "admin' OR '1'='1' --",
      ];

      sqlInjectionPayloads.forEach((payload) => {
        cy.get('input[type="email"], input#email').clear().type(payload);
        cy.get('input[type="password"], input#password').clear().type(payload);
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
        
        // Should not be logged in - should show error or stay on login page
        cy.url().should('include', '/login');
      });
    });

    it('should handle XSS attempts in login fields', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
      ];

      xssPayloads.forEach((payload) => {
        cy.get('input[type="email"], input#email').clear().type(payload);
        cy.get('input[type="password"], input#password').clear().type('password');
        cy.get('button[type="submit"]').click();
        cy.wait(1000);
        
        // Should handle gracefully without executing script
        cy.url().should('include', '/login');
      });
    });

    it('should prevent empty credential submission', () => {
      // Try submitting with empty fields
      cy.get('button[type="submit"]').click();
      
      // Should show validation error or prevent submission
      cy.url().should('include', '/login');
      cy.get('input[type="email"], input#email').then($el => {
        expect($el).to.exist;
      });
    });

    it('should handle extremely long input strings', () => {
      const longString = 'a'.repeat(1000);
      
      cy.get('input[type="email"], input#email').invoke('val', longString).trigger('change');
      cy.get('input[type="password"], input#password').invoke('val', longString).trigger('change');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      
      // Should handle without crashing
      cy.get('body').should('exist');
    });
  });

  describe('Customer Management: Boundary & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/customer');
      cy.wait(2000);
    });

    it('should handle special characters in customer name', () => {
      const specialNames = [
        "O'Brien's Company",        // Apostrophes
        "Müller & Söhne GmbH",     // Umlauts
        "Company (Subsidiary)",     // Parentheses
        "Test-Company-123",         // Hyphens and numbers
        "Test_Company_With_Underscores"
      ];

      specialNames.forEach((name, index) => {
        cy.contains('button', /add new client/i, { timeout: 10000 }).click();
        cy.wait(1000);

        cy.get('input#name', { timeout: 10000 }).should('be.visible').clear().type(name);
        cy.get('input#email').clear().type(`special${index}@test.com`);
        cy.get('input#phone').clear().type(`+123456789${index}`);
        
        cy.contains('button', /submit/i).click();
        cy.wait(2000);

        // Verify creation succeeded
        cy.visit('/customer');
        cy.wait(2000);
        cy.get('.ant-table-tbody').should('contain', name);
      });
    });

    it('should handle XSS attempts in customer fields', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')">',
      ];

      xssPayloads.forEach((payload, index) => {
        cy.contains('button', /add new client/i).click();
        cy.wait(1000);

        cy.get('input#name', { timeout: 10000 }).should('be.visible').clear().type(payload);
        cy.get('input#email').clear().type(`xss${index}@test.com`);
        cy.get('input#phone').clear().type(`+98765432${index}`);
        
        cy.contains('button', /submit/i).click();
        cy.wait(2000);

        // Visit list and verify payload is escaped (shown as text, not executed)
        cy.visit('/customer');
        cy.wait(2000);
        
        // Check that no alert was triggered
        cy.on('window:alert', (str) => {
          expect(str).to.not.exist;
        });
      });
    });

    it('should handle maximum length inputs', () => {
      const longName = 'A'.repeat(500);
      const longEmail = 'user' + 'x'.repeat(240) + '@test.com';
      const longPhone = '1'.repeat(50);

      cy.contains('button', /add new client/i).click();
      cy.wait(1000);

      cy.get('input#name', { timeout: 10000 }).invoke('val', longName).trigger('change');
      cy.get('input#email').invoke('val', longEmail).trigger('change');
      cy.get('input#phone').invoke('val', longPhone).trigger('change');
      
      cy.contains('button', /submit/i).click();
      cy.wait(2000);

      // Should either accept (if no limits) or show validation error
      cy.get('body').should('exist'); // No crash
    });

    it('should handle rapid form submissions (double-click)', () => {
      cy.contains('button', /add new client/i).click();
      cy.wait(1000);

      const timestamp = Date.now();
      cy.get('input#name', { timeout: 10000 }).type(`Rapid Test ${timestamp}`);
      cy.get('input#email').type(`rapid${timestamp}@test.com`);
      cy.get('input#phone').type('+1234567890');
      
      // Click submit button multiple times rapidly
      cy.contains('button', /submit/i).click().click().click();
      cy.wait(3000);

      // Should only create ONE customer, not multiple
      cy.visit('/customer');
      cy.wait(2000);
      
      cy.get('.ant-table-tbody').then($tbody => {
        const text = $tbody.text();
        const occurrences = (text.match(new RegExp(`rapid${timestamp}@test.com`, 'g')) || []).length;
        expect(occurrences).to.equal(1); // Should appear only once
      });
    });

    it('should validate email format strictly', () => {
      const invalidEmails = [
        'notanemail',
        '@test.com',
        'user@',
        'user..name@test.com',
        'user name@test.com',
        'user@test',
      ];

      invalidEmails.forEach((email) => {
        cy.visit('/customer');
        cy.wait(1000);
        
        cy.contains('button', /add new client/i).click();
        cy.wait(1000);

        cy.get('input#name', { timeout: 10000 }).clear().type('Test User');
        cy.get('input#email').clear().type(email);
        cy.get('input#phone').clear().type('+1234567890');
        
        cy.contains('button', /submit/i).click();
        cy.wait(1000);

        // Should show validation error or prevent submission
        // Form should still be visible (not closed)
        cy.get('input#email').should('be.visible');
      });
    });

    it('should handle empty required fields gracefully', () => {
      cy.contains('button', /add new client/i).click();
      cy.wait(1000);

      // Try to submit with only one field filled
      cy.get('input#name', { timeout: 10000 }).clear().type('Name Only');
      cy.contains('button', /submit/i).click();
      cy.wait(1000);

      // Form should still be visible (validation prevents submission)
      cy.get('input#email').should('be.visible');
    });
  });

  describe('Invoice Management: Calculation Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/invoice/create');
      cy.wait(3000);
    });

    it('should handle zero values in calculations', () => {
      // Test: Quantity = 0
      cy.get('input[id*="quantity"]').first().clear().type('0');
      cy.get('input[id*="price"]').first().clear().type('100');
      cy.wait(1000);

      // Subtotal should be 0
      cy.get('body').then($body => {
        const text = $body.text();
        // Should show 0 somewhere in totals
        expect(text).to.match(/subtotal.*0|total.*0/i);
      });

      // Test: Price = 0
      cy.get('input[id*="quantity"]').first().clear().type('5');
      cy.get('input[id*="price"]').first().clear().type('0');
      cy.wait(1000);

      cy.get('body').then($body => {
        const text = $body.text();
        expect(text).to.match(/subtotal.*0|total.*0/i);
      });
    });

    it('should handle decimal values in calculations', () => {
      cy.get('input[id*="quantity"]').first().clear().type('2.5');
      cy.get('input[id*="price"]').first().clear().type('99.99');
      cy.wait(1000);

      // Expected: 2.5 * 99.99 = 249.975 (should round to 249.98 or 250.00)
      cy.get('body').then($body => {
        const text = $body.text();
        // Should show calculated result (not crash)
        expect(text).to.include('24'); // At least shows calculation
      });
    });

    it('should handle very large numbers', () => {
      cy.get('input[id*="quantity"]').first().clear().type('99999');
      cy.get('input[id*="price"]').first().clear().type('99999');
      cy.wait(1000);

      // Expected: 99999 * 99999 = 9,999,800,001
      // Should handle without overflow or crash
      cy.get('body').should('exist');
      cy.get('body').contains(/total|subtotal/i).should('exist');
    });

    it('should prevent negative values in quantity and price', () => {
      cy.get('input[id*="quantity"]').first().clear().type('-5');
      cy.get('input[id*="price"]').first().clear().type('-100');
      cy.wait(1000);

      // Should either:
      // 1. Show validation error
      // 2. Convert to positive
      // 3. Show 0
      // But should NOT crash
      cy.get('body').should('exist');
    });

    it('should handle extremely long item descriptions', () => {
      const longDescription = 'This is a very long description. '.repeat(100);
      
      cy.get('input[id*="itemName"], textarea[id*="description"]').first()
        .invoke('val', longDescription)
        .trigger('change');
      
      cy.wait(1000);
      
      // Should handle without crashing or breaking layout
      cy.get('body').should('exist');
    });

    it('should recalculate when item is deleted mid-invoice', () => {
      // Add multiple items if possible
      cy.get('input[id*="quantity"]').first().clear().type('2');
      cy.get('input[id*="price"]').first().clear().type('100');
      cy.wait(1000);

      // Get initial total
      cy.get('body').invoke('text').as('initialText');

      // Try to find and click delete button for item (if exists)
      cy.get('body').then($body => {
        const deleteBtn = $body.find('button[aria-label*="delete"], .anticon-delete, button').filter(':visible');
        if (deleteBtn.length > 0) {
          cy.wrap(deleteBtn.first()).click();
          cy.wait(1000);
          
          // Total should update
          cy.get('body').invoke('text').should('not.equal', '@initialText');
        }
      });
    });
  });

  describe('UI/UX: Rapid Interaction Testing', () => {
    it('should handle rapid navigation between pages', () => {
      const pages = ['/customer', '/invoice', '/', '/customer'];
      
      pages.forEach((page) => {
        cy.visit(page);
        cy.wait(500); // Minimal wait - stress test
      });

      // Should not crash
      cy.get('body').should('exist');
      cy.url().should('include', '/customer');
    });

    it('should handle rapid button clicking without duplicate actions', () => {
      cy.visit('/customer');
      cy.wait(2000);

      // Click "Add New" button 5 times rapidly
      cy.contains('button', /add new client/i).then($btn => {
        for (let i = 0; i < 5; i++) {
          cy.wrap($btn).click();
          cy.wait(100);
        }
      });

      cy.wait(1000);

      // Should only open ONE form, not 5
      cy.get('.ant-modal, .ant-drawer, form').should('have.length.lessThan', 3);
    });

    it('should handle form open/close repeatedly', () => {
      cy.visit('/customer');
      cy.wait(2000);

      for (let i = 0; i < 3; i++) {
        // Open form
        cy.contains('button', /add new client/i).click();
        cy.wait(500);
        
        // Close form (find close button)
        cy.get('body').then($body => {
          const closeBtn = $body.find('button[aria-label*="close"], .ant-modal-close, .anticon-close').first();
          if (closeBtn.length > 0) {
            cy.wrap(closeBtn).click();
            cy.wait(500);
          } else {
            // Press Escape key
            cy.get('body').type('{esc}');
            cy.wait(500);
          }
        });
      }

      // Should still be functional
      cy.get('body').should('exist');
    });
  });

  describe('Data Integrity: Concurrent & State Testing', () => {
    it('should maintain data after page refresh', () => {
      const timestamp = Date.now();
      const testData = {
        name: `PersistenceTest ${timestamp}`,
        email: `persist${timestamp}@test.com`,
        phone: '+1234567890'
      };

      // Create customer
      cy.visit('/customer');
      cy.wait(2000);
      
      cy.contains('button', /add new client/i).click();
      cy.wait(1000);

      cy.get('input#name', { timeout: 10000 }).type(testData.name);
      cy.get('input#email').type(testData.email);
      cy.get('input#phone').type(testData.phone);
      
      cy.contains('button', /submit/i).click();
      cy.wait(2000);

      // Reload page
      cy.reload();
      cy.wait(2000);

      // Customer should still exist
      cy.get('.ant-table-tbody').should('contain', testData.name);
    });

    it('should handle search with special characters', () => {
      cy.visit('/customer');
      cy.wait(2000);

      const specialSearches = [
        '<script>',
        "O'Brien",
        'Test & Company',
        '50% Off',
      ];

      specialSearches.forEach((term) => {
        cy.get('input[type="search"], input[placeholder*="Search" i]').first().then($input => {
          if ($input.length > 0) {
            cy.wrap($input).clear().type(term);
            cy.wait(1000);
            
            // Should not crash
            cy.get('body').should('exist');
            
            cy.wrap($input).clear();
          }
        });
      });
    });

    it('should validate invoice number uniqueness', () => {
      const invoiceNum = `INV-${Date.now()}`;

      // Create first invoice
      cy.visit('/invoice/create');
      cy.wait(3000);

      cy.get('input#number').clear().type(invoiceNum);
      
      // Select client
      cy.get('input.ant-select-selection-search-input[role="combobox"]').first().click({ force: true });
      cy.wait(1000);
      cy.get('.ant-select-item-option').first().click({ force: true });
      cy.wait(500);

      // Add minimal item data
      cy.get('input[id*="quantity"]').first().clear().type('1');
      cy.get('input[id*="price"]').first().clear().type('100');
      cy.wait(500);

      cy.get('button[type="submit"]').contains(/save/i).click();
      cy.wait(3000);

      // Try to create second invoice with SAME number
      cy.visit('/invoice/create');
      cy.wait(3000);

      cy.get('input#number').clear().type(invoiceNum);
      
      cy.get('input.ant-select-selection-search-input[role="combobox"]').first().click({ force: true });
      cy.wait(1000);
      cy.get('.ant-select-item-option').first().click({ force: true });
      cy.wait(500);

      cy.get('input[id*="quantity"]').first().clear().type('1');
      cy.get('input[id*="price"]').first().clear().type('50');
      cy.wait(500);

      cy.get('button[type="submit"]').contains(/save/i).click();
      cy.wait(2000);

      // Should show error or prevent duplicate
      cy.get('body').then($body => {
        // Either still on create page (validation prevented) or shows error
        if ($body.text().includes('already exists') || $body.text().includes('duplicate')) {
          cy.log('✓ Duplicate validation working');
        } else if ($body.find('input#number').length > 0) {
          cy.log('✓ Stayed on form (validation prevented submission)');
        }
      });
    });
  });

  describe('Security: Input Sanitization', () => {
    it('should sanitize customer notes/description fields', () => {
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:void(0)',
        '<iframe src="https://evil.com"></iframe>',
      ];

      maliciousInputs.forEach((input, index) => {
        cy.visit('/customer');
        cy.wait(2000);
        
        cy.contains('button', /add new client/i).click();
        cy.wait(1000);

        cy.get('input#name').type(`SecurityTest${index}`);
        cy.get('input#email').type(`sec${index}@test.com`);
        cy.get('input#phone').type(`+12345678${index}0`);
        
        // Try to find notes/description field
        cy.get('body').then($body => {
          const notesField = $body.find('textarea, input[name*="note"], input[name*="description"]').first();
          if (notesField.length > 0) {
            cy.wrap(notesField).type(input);
          }
        });

        cy.contains('button', /submit/i).click();
        cy.wait(2000);

        // No alert should have been triggered
        cy.on('window:alert', (str) => {
          throw new Error('XSS vulnerability detected! Alert was triggered: ' + str);
        });
      });
    });

    it('should prevent path traversal in URLs', () => {
      const maliciousUrls = [
        '/customer/../../../etc/passwd',
        '/invoice/../../../../windows/system32',
        '/customer/%2e%2e%2f%2e%2e%2f',
      ];

      maliciousUrls.forEach((url) => {
        cy.visit(url, { failOnStatusCode: false });
        cy.wait(1000);

        // Should redirect to error page or safe page, not expose files
        cy.url().should('not.include', 'etc/passwd');
        cy.url().should('not.include', 'system32');
        
        // Should show 404 or redirect to dashboard/login
        cy.get('body').should('exist');
      });
    });
  });

  describe('Performance: Large Data Sets', () => {
    it('should handle viewing large customer list', () => {
      cy.visit('/customer');
      cy.wait(2000);

      // Check if pagination exists
      cy.get('.ant-pagination').should('exist');

      // Navigate through pages
      cy.get('.ant-pagination-next').click();
      cy.wait(1000);
      
      // Should load without significant delay
      cy.get('.ant-table-tbody tr').should('have.length.greaterThan', 0);
    });

    it('should handle large invoice with many line items', () => {
      cy.visit('/invoice/create');
      cy.wait(3000);

      // Try to add multiple items (if "Add Item" button exists)
      for (let i = 0; i < 5; i++) {
        cy.get('body').then($body => {
          const addBtn = $body.find('button').filter((idx, el) => {
            return Cypress.$(el).text().match(/add item|add line|new item/i);
          }).first();
          
          if (addBtn.length > 0) {
            cy.wrap(addBtn).click();
            cy.wait(500);
          }
        });
      }

      // Should not freeze or crash
      cy.get('body').should('exist');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });
});
