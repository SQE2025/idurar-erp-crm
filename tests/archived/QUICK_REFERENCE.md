# Quick Reference Guide - Test Suite
## IDURAR ERP CRM - Cypress Tests

---

## Test Files Overview

| # | File | Tests | Focus Area |
|---|------|-------|------------|
| 1 | `smoke.cy.js` | 25+ | Quick verification of critical features |
| 2 | `01-authentication.cy.js` | 40+ | Login, logout, security, validation |
| 3 | `02-dashboard.cy.js` | 45+ | Dashboard display, navigation, statistics |
| 4 | `03-customer.cy.js` | 60+ | Customer CRUD, search, pagination |
| 5 | `04-invoice.cy.js` | 70+ | Invoice management, PDF, payments |
| 6 | `05-quote.cy.js` | 65+ | Quote management, conversion |
| 7 | `06-payment.cy.js` | 60+ | Payment recording, modes, reconciliation |
| 8 | `07-settings.cy.js` | 55+ | Settings, tax, profile configuration |

**Total: 420+ test cases**

---

## Running Tests

### Run All Tests
```bash
cd e:\Uni_Stuff\SQE\Project\idurar-erp-crm\tests
npx cypress run
```

### Run Smoke Tests Only (Fast)
```bash
npx cypress run --spec "cypress/e2e/smoke.cy.js"
```

### Run Specific Module
```bash
# Authentication tests
npx cypress run --spec "cypress/e2e/01-authentication.cy.js"

# Customer tests
npx cypress run --spec "cypress/e2e/03-customer.cy.js"

# Invoice tests
npx cypress run --spec "cypress/e2e/04-invoice.cy.js"
```

### Open Cypress UI (Interactive)
```bash
npx cypress open
```

---

## Test Execution Order

### Recommended Execution Sequence:

1. **Smoke Tests** (5-10 min)
   - Quick verification
   - Critical path check
   
2. **Authentication Tests** (10-15 min)
   - Login/logout
   - Security validation
   
3. **Dashboard Tests** (15-20 min)
   - Navigation
   - Statistics display
   
4. **Module Tests** (30-45 min each)
   - Customer management
   - Invoice management
   - Quote management
   - Payment management
   
5. **Settings Tests** (20-30 min)
   - Configuration
   - Profile management

**Total Execution Time: ~3-4 hours for all tests**

---

## Test Coverage by Module

### Authentication Module
- ✅ Login page load
- ✅ Valid/invalid credentials
- ✅ Form validation
- ✅ Password visibility toggle
- ✅ Session management
- ✅ Logout functionality
- ✅ Responsive design
- ✅ Accessibility
- ✅ Security

### Dashboard Module
- ✅ Dashboard load
- ✅ Statistics cards
- ✅ Navigation menu
- ✅ Quick actions
- ✅ Data display
- ✅ Performance
- ✅ Error handling

### Customer Module
- ✅ List display
- ✅ Create customer
- ✅ View details
- ✅ Update customer
- ✅ Delete customer
- ✅ Search & filter
- ✅ Pagination
- ✅ Sorting
- ✅ Bulk actions

### Invoice Module
- ✅ List display
- ✅ Create invoice
- ✅ View details
- ✅ Update invoice
- ✅ Delete invoice
- ✅ PDF generation
- ✅ Record payment
- ✅ Send email
- ✅ Status management
- ✅ Calculations

### Quote Module
- ✅ List display
- ✅ Create quote
- ✅ View details
- ✅ Update quote
- ✅ Delete quote
- ✅ Convert to invoice
- ✅ PDF generation
- ✅ Expiry management

### Payment Module
- ✅ List display
- ✅ View details
- ✅ Update payment
- ✅ Payment modes
- ✅ Search & filter
- ✅ Invoice linking
- ✅ Receipt generation

### Settings Module
- ✅ Company settings
- ✅ Tax management
- ✅ Payment modes
- ✅ User profile
- ✅ Logo upload
- ✅ Currency settings

---

## CI/CD Integration

### GitHub Actions Pipeline

Tests run automatically on:
- ✅ Push to master branch
- ✅ Push to develop branch
- ✅ Pull requests
- ✅ Manual trigger

### Pipeline Stages

```
1. Lint → 2. Build → 3. Test → 4. Staging → 5. Production
                      ↓
              Cypress Tests (420+)
              Screenshots on failure
              Video recordings
```

---

## Test Reports

### Generated Artifacts

After test execution, find:

- **Screenshots:** `tests/cypress/screenshots/`
  - Captured on test failures
  - Organized by test file
  
- **Videos:** `tests/cypress/videos/`
  - Full test run recordings
  - One per spec file
  
- **Reports:** CI/CD pipeline artifacts
  - Test results summary
  - Pass/fail statistics
  - Execution time

---

## Prerequisites

### Before Running Tests

1. **Backend must be running:**
   ```bash
   cd backend
   npm start
   # Runs on http://localhost:8888
   ```

2. **Frontend must be running:**
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Database must be accessible:**
   - MongoDB running (local or Atlas)
   - Default credentials configured

### Environment Setup

```bash
# Install dependencies
cd tests
npm install

# Verify Cypress installation
npx cypress verify
```

---

## Common Issues & Solutions

### Issue: Tests fail with "cy.visit() failed"
**Solution:** Ensure frontend is running on http://localhost:3000

### Issue: Login tests fail
**Solution:** Verify backend is running and database has admin user

### Issue: Tests timeout
**Solution:** Increase timeout in cypress.config.js or use cy.wait()

### Issue: Elements not found
**Solution:** Tests use flexible selectors, but ensure app is fully loaded

---

## Test Credentials

### Default Admin Account
```
Email: admin@admin.com
Password: admin123
```

*Used in all test files for authentication*

---

## Test File Structure

Each test file follows this structure:

```javascript
/**
 * Module Test Suite Header
 * - Test Coverage details
 * - Test Type
 * - Testing Approach
 */

describe('Module Tests', () => {
  beforeEach(() => {
    // Setup before each test
    // Login if needed
  });

  describe('TC-XXX-001: Feature Name', () => {
    it('should test specific functionality', () => {
      // Test implementation
    });
  });
});
```

---

## Key Features of Test Suite

### ✅ Comprehensive Coverage
- 420+ test cases
- All modules covered
- Functional & non-functional testing

### ✅ Well Organized
- Sequential test IDs
- Logical grouping
- Clear naming

### ✅ Maintainable
- Consistent structure
- Flexible selectors
- Easy to extend

### ✅ Professional
- Detailed documentation
- Error handling
- Best practices

---

## Test Execution Matrix

| Test Type | Count | Execution Time | Priority |
|-----------|-------|----------------|----------|
| Smoke Tests | 25+ | 5-10 min | Critical |
| Authentication | 40+ | 10-15 min | Critical |
| Dashboard | 45+ | 15-20 min | High |
| Customer | 60+ | 30-45 min | High |
| Invoice | 70+ | 30-45 min | High |
| Quote | 65+ | 30-45 min | Medium |
| Payment | 60+ | 30-45 min | Medium |
| Settings | 55+ | 20-30 min | Low |

---

## Documentation References

- **Test Plan:** `docs/TEST_PLAN.md`
- **Deployment Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Compliance Analysis:** `docs/CICD_COMPLIANCE_ANALYSIS.md`
- **Project Summary:** `docs/PROJECT_SUMMARY.md`

---

## Quick Commands Cheat Sheet

```bash
# Navigate to test directory
cd e:\Uni_Stuff\SQE\Project\idurar-erp-crm\tests

# Run all tests
npx cypress run

# Run smoke tests
npx cypress run --spec "cypress/e2e/smoke.cy.js"

# Run with specific browser
npx cypress run --browser chrome

# Open Cypress UI
npx cypress open

# Run with video disabled (faster)
npx cypress run --config video=false

# Run specific test file
npx cypress run --spec "cypress/e2e/03-customer.cy.js"

# Run tests matching pattern
npx cypress run --spec "cypress/e2e/*-authentication.cy.js"
```

---

## Contact & Support

For issues or questions:
1. Check test logs in `cypress/screenshots/` and `cypress/videos/`
2. Review test plan: `docs/TEST_PLAN.md`
3. Check CI/CD pipeline logs in GitHub Actions

---

**Last Updated:** December 6, 2025  
**Test Suite Version:** 1.0  
**Total Test Cases:** 420+
