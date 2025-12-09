# Test Plan - IDURAR ERP CRM
**Project Name:** IDURAR ERP CRM  
**Document Version:** 1.3  
**Date:** 2025-12-07  

---

## 1. Test Objective
The primary objective of this test plan is to define the testing strategy for the **IDURAR ERP CRM** application to ensure it meets functional requirements and performs reliably in both development and production environments.

**Specific Goals:**
*   **Verify Functionality:** Ensure all core modules (Customer, Invoice, Quote, Tax, etc.) work as expected according to business requirements.
*   **Validate Integrations:** Confirm that the Frontend (React), Backend (Express/Node.js), and Database (MongoDB) communicate correctly.
*   **Ensure Stability:** Detect and fix bugs through rigorous White-box and Black-box testing.
*   **Automate Regression:** Maintain a suite of automated tests to prevent regressions during CI/CD deployments.

---

## 2. Test Scope

### 2.1 Functional Testing (Black-Box)
Focuses on validating the application's external behavior against user expectations without inspecting internal code.
*   **Authentication:** Login, Logout, Session management.
*   **Customer Management:** Create, Read, Update, Delete (CRUD), Search/Filter customers, Pagination.
*   **Invoice Management:** Creation with items & tax calculation, Status updates, PDF generation.
*   **Quote Management:** Creation, Conversion to Invoice.
*   **Tax Management:** Enabling/disabling taxes, verifying percentage calculations.
*   **Payment Management:** Recording payments against invoices.
*   **Settings:** App configuration, backup/restore.

### 2.2 Non-Functional Testing
*   **Performance Testing:** Load times for dashboard and data tables.
*   **Security Testing:** Authentication token validation, Route protection, SQL Injection/XSS prevention (Exploratory).
*   **Compatibility Testing:** Responsive design verification (Mobile/Tablet views).

### 2.3 Unit Testing (White-Box)
Focuses on individual components and functions within the Backend source code.
*   **Controllers:** Testing request processing and response handling for Auth, Client, Invoice, Payment, and Quote.
*   **Helpers:** Validating utility functions (calculations, formatting).

### 2.4 Integration Testing (White-Box/Gray-Box)
Focuses on the interaction between modules and external services.
*   **API Endpoints:** Testing HTTP status codes (200, 400, 401, 404, 500) and JSON payloads via `supertest`.
*   **Database Integration:** Verifying Mongoose models correctly save and retrieve data from MongoDB.

---

## 3. Test Techniques

### 3.1 Manual Testing
**Phase:** Exploratory & Staging Verification.
*   Used for UI/UX evaluation.
*   Ad-hoc testing of edge cases not covered by automation.
*   Visual verification of notifications and layout glitches.

### 3.2 Automated Testing
**Phase:** Development & CI/CD Pipeline.
*   **Unit/Integration Tests:** Running `jest` on the backend to verify logic integrity.
*   **E2E (End-to-End) Tests:** Running `cypress` to simulate real user journeys in a browser environment.

---

## 4. Test Tools and Frameworks

| Category | Tool | Purpose |
| :--- | :--- | :--- |
| **Backend Testing** | **Jest** | Unit testing framework for Node.js. |
| **API Testing** | **Supertest** | HTTP assertions for Express routes. |
| **UI / E2E Testing** | **Cypress** | Browser-based functional testing. |
| **CI/CD** | **GitHub Actions** | Automated execution of tests on push/PR. |
| **Deployment** | **Railway** | Hosting environment for Staging/Production. |
| **Monitoring** | **Sentry, New Relic** | Real-time error tracking and performance monitoring. |

---

## 5. Test Environment

| Environment | Description | Configuration |
| :--- | :--- | :--- |
| **Development** | Local Developer Machine | Dockerized MongoDB, Local Node.js server (Port 8888), Vite Frontend (Port 3000). |
| **Test (CI)** | GitHub Actions Runner | Ubuntu-latest container, ephemeral MongoDB service. |
| **Staging** | Railway Environment | Clones production config, connects to Staging DB. |
| **Production** | Railway Live Server | Live DB, Production secrets, Manual Approval required for deploy. |

---

## 6. Test Cases

### 6.1 Authentication (UI - Cypress)

**1. Test Scenario: Should display login form with all elements.**
*   **Steps:**
    *   Navigate to `/login`.
    *   Inspect the page for email input field.
    *   Inspect the page for password input field.
    *   Inspect the page for submit button.
*   **Expected Result:** Login form inputs and submit button are visible.

**2. Test Scenario: Should login successfully with valid credentials.**
*   **Steps:**
    *   Navigate to `/login`.
    *   Enter valid email `admin@admin.com`.
    *   Enter valid password `admin123`.
    *   Click Submit button.
*   **Expected Result:** URL changes to dashboard, and login page is no longer visible.

**3. Test Scenario: Should reject invalid credentials.**
*   **Steps:**
    *   Navigate to `/login`.
    *   Enter invalid email.
    *   Enter invalid password.
    *   Click Submit button.
*   **Expected Result:** User remains on the login page (URL includes `/login`).

**4. Test Scenario: Should validate required fields and email format.**
*   **Steps:**
    *   Navigate to `/login`.
    *   Attempt to submit empty form.
    *   Attempt to submit invalid email string (e.g. `notanemail`).
*   **Expected Result:** Validation errors prevent submission, and user remains on login page.

**5. Test Scenario: Should navigate to forgot password.**
*   **Steps:**
    *   Navigate to `/login`.
    *   Click "Forgot Password" link.
*   **Expected Result:** URL redirects to `/forget` or password recovery page.

**6. Test Scenario: Should logout and redirect to login page.**
*   **Steps:**
    *   Login as administrator.
    *   Click User menu/profile dropdown.
    *   Click "Logout".
*   **Expected Result:** User is logged out and redirected to `/login`.

### 6.2 Dashboard (UI - Cypress)

**7. Test Scenario: Should display dashboard with summary statistics cards.**
*   **Steps:**
    *   Login and navigate to Dashboard.
    *   Check for presence of statistic cards (e.g., Total Revenue, Total Customers).
*   **Expected Result:** Statistic cards are visible and contain numerical data.

**8. Test Scenario: Should display recent invoices or transactions table.**
*   **Steps:**
    *   Login and navigate to Dashboard.
    *   Check for "Recent Activity" or "Recent Invoices" table.
*   **Expected Result:** A table displaying recent records is visible.

**9. Test Scenario: Should display navigation menu with all core modules.**
*   **Steps:**
    *   Login and navigate to Dashboard.
    *   Inspect sidebar navigation.
*   **Expected Result:** Navigation links for Dashboard, Customer, Invoice, Quote, etc., are present.

**10. Test Scenario: Should navigate between modules successfully.**
*   **Steps:**
    *   Click "Customer" link.
    *   Click "Invoice" link.
    *   Click "Dashboard" link.
*   **Expected Result:** URL updates to corresponding routes (`/customer`, `/invoice`, `/`) and pages load correctly.

**11. Test Scenario: Should display user profile and logout option.**
*   **Steps:**
    *   Locate User Avatar/Profile in header.
*   **Expected Result:** Profile element is visible and interactive.

### 6.3 Customer Management (UI - Cypress)

**12. Test Scenario: Should display customer list page with data table.**
*   **Steps:**
    *   Navigate to `/customer`.
*   **Expected Result:** A data table with customer columns (Name, Email, etc.) is displayed.

**13. Test Scenario: Should open create customer form and display all required fields.**
*   **Steps:**
    *   Navigate to `/customer`.
    *   Click "Add New Client".
*   **Expected Result:** A create form (drawer/modal) opens with fields for Name, Email, Phone, etc.

**14. Test Scenario: Should successfully create a new customer with valid data.**
*   **Steps:**
    *   Open "Add New Client" form.
    *   Enter valid Name, Email, and Phone.
    *   Click Submit.
*   **Expected Result:** Success notification appears, and the new customer is listed in the table.

**15. Test Scenario: Should validate required fields when creating customer.**
*   **Steps:**
    *   Open "Add New Client" form.
    *   Leave required fields empty.
    *   Click Submit.
*   **Expected Result:** Form does not submit, and validation errors are shown.

**16. Test Scenario: Should search/filter customers by name.**
*   **Steps:**
    *   Navigate to `/customer`.
    *   Enter a name in the search bar.
*   **Expected Result:** Table updates to show only matching customer records.

**17. Test Scenario: Should handle responsive design.**
*   **Steps:**
    *   Resize viewport to mobile and tablet dimensions.
*   **Expected Result:** Layout adjusts correctly without breaking the UI.

### 6.4 Invoice Management (UI - Cypress)

**18. Test Scenario: Should display invoice list page with table and status indicators.**
*   **Steps:**
    *   Navigate to `/invoice`.
*   **Expected Result:** Invoice table is displayed with Status columns (Draft, Pending, Paid).

**19. Test Scenario: Should open invoice creation form with all required fields.**
*   **Steps:**
    *   Navigate to `/invoice/create`.
*   **Expected Result:** Invoice form loads with Client Select, Date Picker, Item list, and Calculation fields.

**20. Test Scenario: Should add invoice line items and calculate totals correctly.**
*   **Steps:**
    *   Navigate to `/invoice/create`.
    *   Add an item with Quantity = 2 and Price = 100.
*   **Expected Result:** Total is calculated as 200 (plus tax if applicable).

**21. Test Scenario: Should calculate tax correctly on invoice total.**
*   **Steps:**
    *   Navigate to `/invoice/create`.
    *   Add item worth 100.
    *   Select Tax Rate (e.g., 10%).
*   **Expected Result:** Tax Total shows 10, Grand Total shows 110.

**22. Test Scenario: Should validate required fields when creating invoice.**
*   **Steps:**
    *   Navigate to `/invoice/create`.
    *   Attempt to submit without selecting a Client or adding items.
*   **Expected Result:** Submission is blocked by validation.

**23. Test Scenario: Should successfully create a complete invoice.**
*   **Steps:**
    *   Select Client from dropdown.
    *   Add valid line items.
    *   Select Tax.
    *   Click Save/Submit.
*   **Expected Result:** Invoice is saved, and user is redirected to the invoice list or detail view.

**24. Test Scenario: Should search/filter invoices by number or client.**
*   **Steps:**
    *   Navigate to `/invoice`.
    *   Type Invoice Number or Client Name in search.
*   **Expected Result:** Table filters to show relevant invoices.

### 6.5 Quote Management (UI - Cypress)

**25. Test Scenario: Should display quote list with status indicators.**
*   **Steps:**
    *   Navigate to `/quote`.
*   **Expected Result:** Quote table displays with status tags (Draft, Sent).

**26. Test Scenario: Should open quote creation form with required fields.**
*   **Steps:**
    *   Click "Add New Quote".
*   **Expected Result:** Quote form opens with similar fields to attributes of Invoice.

**27. Test Scenario: Should successfully create a new quote with items and tax.**
*   **Steps:**
    *   Select Client.
    *   Add Items and Tax.
    *   Click Save.
*   **Expected Result:** Quote is successfully created.

**28. Test Scenario: Should filter quotes by status.**
*   **Steps:**
    *   Use Filter dropdown to select "Draft" or "Sent".
*   **Expected Result:** List updates to show only quotes with the selected status.

**29. Test Scenario: Should search quotes by client name.**
*   **Steps:**
    *   Enter Client Name in search input.
*   **Expected Result:** Table shows quotes for that client.

### 6.6 Tax Management (UI - Cypress)

**30. Test Scenario: Should display tax list page with table.**
*   **Steps:**
    *   Navigate to `/taxes`.
*   **Expected Result:** List of configured tax rates is displayed.

**31. Test Scenario: Should open add new tax form with required fields.**
*   **Steps:**
    *   Click "Add New Tax".
*   **Expected Result:** Drawer opens with Tax Name and Percentage fields.

**32. Test Scenario: Should create a new tax rate successfully.**
*   **Steps:**
    *   Enter Tax Name and Percentage (e.g., 15%).
    *   Click Submit.
*   **Expected Result:** Success notification appears; new tax is listed.

**33. Test Scenario: Should validate required fields in tax form.**
*   **Steps:**
    *   Attempt to submit empty tax form.
*   **Expected Result:** Validation error occurs.

**34. Test Scenario: Should edit existing tax rate.**
*   **Steps:**
    *   Click "Edit" on a tax row.
    *   Change Percentage.
    *   Save.
*   **Expected Result:** Tax rate is updated in the list.

**35. Test Scenario: Should delete a tax rate.**
*   **Steps:**
    *   Click "Delete" on a tax row.
    *   Confirm deletion.
*   **Expected Result:** Tax rate is removed from the list.

### 6.7 Payment Management (UI - Cypress)

**36. Test Scenario: Should display payment list page with table.**
*   **Steps:**
    *   Navigate to `/payment`.
*   **Expected Result:** Table of recorded payments is visible.

**37. Test Scenario: Should search payments by client name.**
*   **Steps:**
    *   Enter client name in search.
*   **Expected Result:** Table filters payments by client.

**38. Test Scenario: Should display payment details.**
*   **Steps:**
    *   Click "Show" on a payment record.
*   **Expected Result:** Detailed view of the payment is shown.

**39. Test Scenario: Should edit payment details.**
*   **Steps:**
    *   Click "Edit" on a payment record.
    *   Modify Amount or Description.
    *   Save.
*   **Expected Result:** Payment record is updated.

**40. Test Scenario: Should delete a payment.**
*   **Steps:**
    *   Click "Delete" on a payment record.
    *   Confirm.
*   **Expected Result:** Payment is removed.

**41. Test Scenario: Should navigate through pagination.**
*   **Steps:**
    *   Click "Next Page" in pagination controls.
*   **Expected Result:** Next set of records is loaded.

### 6.8 Settings (UI - Cypress)

**42. Test Scenario: Should access settings page and display tab structure.**
*   **Steps:**
    *   Navigate to `/settings`.
*   **Expected Result:** Tabs for General, Company, Currency, and Finance settings are visible.

**43. Test Scenario: Should display and interact with General Settings.**
*   **Steps:**
    *   Click "General Settings".
    *   Inspect Email and Date Format fields.
*   **Expected Result:** Fields are visible and editable.

**44. Test Scenario: Should allow updating email in General Settings.**
*   **Steps:**
    *   Change email value.
    *   Save.
*   **Expected Result:** New email is saved.

**45. Test Scenario: Should display Company Settings tab.**
*   **Steps:**
    *   Click "Company Settings".
*   **Expected Result:** Company Name, Address, and Phone fields are visible.

**46. Test Scenario: Should verify Save button functionality.**
*   **Steps:**
    *   Click Save.
*   **Expected Result:** Button is clickable and triggers save action.

**47. Test Scenario: Should switch between different settings tabs.**
*   **Steps:**
    *   Click through all available tabs.
*   **Expected Result:** Tab content updates accordingly.

**48. Test Scenario: Should verify Date Format dropdown.**
*   **Steps:**
    *   Click Date Format dropdown.
*   **Expected Result:** List of date formats corresponds to expectation.

**49. Test Scenario: Should update finance settings.**
*   **Steps:**
    *   Change Invoice Prefix or Numbering.
    *   Save.
*   **Expected Result:** Finance settings are updated.

### 6.9 Payment Mode (UI - Cypress)

**50. Test Scenario: Should display payment mode list.**
*   **Steps:**
    *   Navigate to `/payment/mode`.
*   **Expected Result:** List of payment modes is displayed.

**51. Test Scenario: Create new payment mode.**
*   **Steps:**
    *   Click "Add Payment Mode".
    *   Enter Name (e.g., Stripe) and Description.
    *   Save.
*   **Expected Result:** New payment mode is added.

**52. Test Scenario: Edit payment mode.**
*   **Steps:**
    *   Click "Edit" on a mode.
    *   Update Description.
    *   Save.
*   **Expected Result:** Payment mode is updated.

**53. Test Scenario: Delete payment mode.**
*   **Steps:**
    *   Click "Delete".
    *   Confirm.
*   **Expected Result:** Payment mode is removed.

### 6.10 Exploratory & Smoke Tests (UI - Cypress)

**54. Test Scenario: Search for vulnerability (XSS)**
*   **Steps:**
    *   Inject script tags into input fields.
*   **Expected Result:** Application sanitizes input and prevents script execution.

**55. Test Scenario: Smoke Test - Critical Path**
*   **Steps:**
    *   Login -> Create Customer -> Create Invoice -> Logout.
*   **Expected Result:** Full flow completes without errors.

---

### 6.11 Backend Unit Tests (Jest - api.test.js)

**56. Test Scenario: Validate login request structure.**
*   **Steps:**
    *   Mock a login request object.
    *   Check for `email` and `password` properties.
    *   Validate `email` regex.
*   **Expected Result:** Request object passes structural validation.

**57. Test Scenario: Validate successful login response structure.**
*   **Steps:**
    *   Mock a success response.
    *   Check for `success: true`, `result.token`, and `result.user`.
*   **Expected Result:** Response structure matches API spec.

**58. Test Scenario: Validate email format.**
*   **Steps:**
    *   Test against valid emails (`test@test.com`).
    *   Test against invalid emails (`test@`).
*   **Expected Result:** Regex correctly identifies valid and invalid formats.

**59. Test Scenario: Validate password requirements.**
*   **Steps:**
    *   Check password length >= 6.
*   **Expected Result:** Short passwords are flagged as invalid.

**60. Test Scenario: Validate user profile response structure.**
*   **Steps:**
    *   Mock profile response.
    *   Check properties: `_id`, `email`, `role`.
*   **Expected Result:** Structure matches expected schema.

**61. Test Scenario: Validate customer creation request structure.**
*   **Steps:**
    *   Mock customer creation body.
    *   Check for `company`, `email`, `name`.
*   **Expected Result:** Required fields are present.

**62. Test Scenario: Validate invoice creation fields.**
*   **Steps:**
    *   Mock invoice data.
    *   Check `client`, `items`, `total`.
*   **Expected Result:** Data structure conforms to Invoice model.

**63. Test Scenario: Validate invoice calculations.**
*   **Steps:**
    *   Input: `subTotal: 100`, `taxRate: 10`.
    *   Compute: `taxTotal` and `total`.
*   **Expected Result:** `taxTotal` is 10, `total` is 110.

**64. Test Scenario: Validate payment request structure.**
*   **Steps:**
    *   Mock payment data.
    *   Check `invoice` ID and `amount`.
    *   Check `amount` > 0.
*   **Expected Result:** Invalid amounts or missing IDs are rejected.

**65. Test Scenario: Validate number formats.**
*   **Steps:**
    *   Test positive and negative numbers.
*   **Expected Result:** Positive numbers pass validation.

### 6.12 Backend Integration Tests (Jest - api.integration.test.js)

**66. Test Scenario: Validate login endpoint exists.**
*   **Steps:**
    *   Send POST to `/api/login` with credentials.
*   **Expected Result:** Status is one of [200, 401, 400], not 404.

**67. Test Scenario: Return proper error for invalid login.**
*   **Steps:**
    *   Send POST to `/api/login` with wrong password.
*   **Expected Result:** Status is not 200.

**68. Test Scenario: Return response from customer list endpoint.**
*   **Steps:**
    *   Send GET to `/api/client/list`.
*   **Expected Result:** Status is OK (200) or Unauthorized (401), endpoint exists.

**69. Test Scenario: Validate customer creation endpoint.**
*   **Steps:**
    *   Send POST to `/api/client/create` with customer data.
*   **Expected Result:** Response Code verifies endpoint presence (200/201/400).

**70. Test Scenario: Respond to invoice list endpoint.**
*   **Steps:**
    *   Send GET to `/api/invoice/list`.
*   **Expected Result:** Endpoint responds successfully.

**71. Test Scenario: Validate invoice creation endpoint.**
*   **Steps:**
    *   Send POST to `/api/invoice/create`.
*   **Expected Result:** Endpoint processes request.

**72. Test Scenario: Return JSON content type.**
*   **Steps:**
    *   Call any API endpoint.
*   **Expected Result:** Header `Content-Type` contains `json`.

**73. Test Scenario: Return 404 for non-existent endpoints.**
*   **Steps:**
    *   Request `/api/non-existent-route`.
*   **Expected Result:** Status is 404.

---

### 6.13 Controller Logic Tests (Unit)
*Inferred from Controller Unit Tests*

**74. Test Scenario: Helper - Add two numbers.**
*   **Steps:** Input 2 and 3.
*   **Result:** Returns 5.

**75. Test Scenario: Helper - Calculate Tax.**
*   **Steps:** Input Amount 100, Tax 20%.
*   **Result:** Returns 20.

**(End of Test Cases)**
