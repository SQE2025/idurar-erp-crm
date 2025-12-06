# Manual Exploratory Testing Guide
## IDURAR ERP CRM - Hands-On Testing Instructions

**Purpose**: This guide helps testers discover bugs, usability issues, and edge cases through manual, creative exploration of the application.

**Duration**: 2-3 hours for complete coverage  
**Prerequisites**: Application running on http://localhost:3000

---

## 🎯 What is Exploratory Testing?

Unlike scripted tests, exploratory testing is:
- **Investigative**: You actively explore the app looking for problems
- **Creative**: Try unusual inputs, unexpected sequences, rapid clicks
- **User-Focused**: Think like a real user, not a programmer
- **Discovery-Based**: No fixed script - adapt based on what you find

---

## 🔐 Test Session 1: Authentication & Security (30 min)

### Setup
1. Open browser in **incognito mode**: `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)
2. Navigate to: `http://localhost:3000`

### Test Cases

#### TC1.1: Normal Login
**Steps**:
1. Enter email: `admin@demo.com`
2. Enter password: `admin123`
3. Click "Log in"

**Expected**: Redirected to dashboard  
**Notes**: Record actual time to login, observe any lag

---

#### TC1.2: Invalid Credentials
**Try These Inputs**:
```
Email: wrong@email.com | Password: wrongpass     → Should show error
Email: admin@demo.com  | Password: wrong         → Should show error
Email: (empty)         | Password: admin123      → Should prevent submit
Email: admin           | Password: admin123      → Should say "invalid email"
Email: admin@demo.com  | Password: (empty)       → Should prevent submit
```

**Expected**: Clear error messages, no crashes  
**🔍 Look For**: 
- Does error disappear when you fix the input?
- Can you still see the password in browser DevTools?

---

#### TC1.3: SQL Injection Attempts
**Purpose**: Ensure database is protected

**Try These In Login Fields**:
```sql
' OR '1'='1
admin'--
' OR 1=1--
"; DROP TABLE users--
<script>alert('XSS')</script>
```

**Expected**: Login fails gracefully, no SQL error messages shown  
**🚨 RED FLAG**: If you see database errors or get logged in, that's a critical bug!

---

#### TC1.4: Session Management
**Steps**:
1. Login successfully
2. Copy the URL from address bar
3. Logout
4. Paste URL back in address bar
5. Press Enter

**Expected**: Should redirect to login (not show protected page)  
**🔍 Also Try**: 
- Open 2 tabs, login in Tab 1, check Tab 2 (should require login)
- Login, close browser, reopen - are you still logged in?

---

## 📊 Test Session 2: Customer Management (45 min)

### Setup
1. Login as admin
2. Navigate to: **Customer** menu

---

#### TC2.1: Create Basic Customer
**Steps**:
1. Click "Add New Client" button
2. Fill form:
   - Name: `John Test Customer`
   - Email: `john.test@example.com`
   - Phone: `+1234567890`
3. Click "Submit"

**Expected**: Form closes, new customer appears in list  
**⏱️ Time**: Note how long submission takes

---

#### TC2.2: Edge Cases - Special Characters
**Try Creating Customers With**:
```
Name: O'Brien's Company        → Apostrophes
Name: Müller & Söhne GmbH     → Umlauts/accents
Name: 北京公司                  → Chinese characters
Name: <script>alert('XSS')</script> → HTML tags

Email: user+tag@example.com    → Plus sign (valid)
Email: user..name@example.com  → Double dots (invalid)
Email: user@sub.domain.co.uk   → Multiple subdomains

Phone: +1-555-123-4567        → Dashes
Phone: (555) 123-4567         → Parentheses
Phone: 555.123.4567           → Dots
Phone: 12345                  → Too short
Phone: 1234567890123456789    → Too long
```

**🔍 Look For**:
- Does app accept/reject appropriately?
- Are error messages helpful?
- Does special data display correctly in the list?

---

#### TC2.3: Boundary Testing
**Test Maximum Lengths**:
```
Name: [Type 500 characters]     → Should limit or warn
Email: [Type 300 characters]@test.com → Should validate
Phone: [Type 50 digits]         → Should limit

Name: [Leave empty]             → Should show required error
```

**🔍 Check**:
- Can you type more than reasonable limit?
- Does form warn you before submission?

---

#### TC2.4: Duplicate Detection
**Steps**:
1. Create customer: `duplicate@test.com`
2. Try creating another with **same email**

**Expected**: System should prevent or warn about duplicate  
**🚨 If**: System allows duplicates, that may be a bug

---

#### TC2.5: Search & Filter
**Steps**:
1. Create 3-4 test customers with distinct names
2. Use search box:
   ```
   Search: "Test"        → Should show all "Test" customers
   Search: "xyz999"      → Should show "No results"
   Search: "John"        → Should show customers named John
   ```
3. Try searching partial email, phone number

**🔍 Look For**:
- Is search case-sensitive? (try "TEST" vs "test")
- Does search update as you type or only on Enter?
- Can you search by any field or only name?

---

#### TC2.6: Edit Customer
**Steps**:
1. Click on existing customer to edit
2. Change name to: `Updated Name`
3. Save

**Expected**: Name updates in list  
**🔍 Also Try**:
- Change email to existing email of another customer (should prevent)
- Clear required field and save (should show error)
- Edit, then cancel (should not save changes)

---

#### TC2.7: Delete Customer
**Steps**:
1. Select a customer
2. Click delete icon/button
3. Confirm deletion

**Expected**: Customer removed from list  
**🔍 Try**:
- Delete customer that has invoices (should warn or prevent)
- Delete and immediately click "Back" button (should customer still be deleted?)

---

## 💰 Test Session 3: Invoice Management (60 min)

### Setup
1. Login as admin
2. Navigate to: **Invoice** menu
3. Click "Add New Invoice"

---

#### TC3.1: Complete Invoice Creation
**Steps**:
1. Select client from dropdown
2. Invoice number: `INV-001`
3. Add item:
   - Item name: `Consulting Services`
   - Description: `Web development`
   - Quantity: `2`
   - Price: `100`
4. Select tax rate: `5%`
5. Click "Save"

**Expected**: 
- Subtotal: `200`
- Tax: `10`
- Total: `210`
- Invoice appears in list

**⏱️ Time**: Note calculation speed and save time

---

#### TC3.2: Calculation Edge Cases
**Test These Scenarios**:

**Scenario A: Zero Values**
```
Quantity: 0 | Price: 100 → Total should be 0
Quantity: 5 | Price: 0   → Total should be 0
```

**Scenario B: Decimal Values**
```
Quantity: 2.5 | Price: 99.99  → Should calculate correctly
Quantity: 1   | Price: 10.005 → How does it round?
```

**Scenario C: Large Numbers**
```
Quantity: 999999 | Price: 999999 → Should it allow? Calculate correctly?
```

**Scenario D: Negative Numbers**
```
Quantity: -5 | Price: 100    → Should prevent or allow (for refunds)?
Price: -50                    → Should prevent or warn
```

**🔍 Look For**:
- Are calculations instant or delayed?
- Does tax calculate correctly with decimals?
- Any rounding errors?

---

#### TC3.3: Multiple Line Items
**Steps**:
1. Add 5 different items to invoice
2. Mix quantities: 1, 2.5, 10, 100, 1000
3. Mix prices: 0.99, 10.00, 99.99, 500.00

**Expected**: Each line calculates, grand total correct  
**🔍 Try**:
- Add 20+ line items (does UI handle it?)
- Delete middle item (does total recalculate?)
- Reorder items (drag-drop if available)

---

#### TC3.4: Invoice Status Workflow
**Test Status Transitions**:
```
Draft → Pending → Sent → Paid → Complete
       ↓
     Cancelled
```

**For Each Status**:
1. Create invoice
2. Change to status
3. Check what actions are available

**🔍 Questions**:
- Can you pay a "Draft" invoice? (should not allow)
- Can you edit a "Paid" invoice? (may be read-only)
- Can you delete a "Sent" invoice? (should confirm)

---

#### TC3.5: Date Validation
**Try These Dates**:
```
Invoice Date: Tomorrow's date     → Should allow or warn?
Due Date: Yesterday               → Should warn "overdue already"
Due Date: Before Invoice Date     → Should prevent

Invoice Date: 01/01/2000         → Very old date
Due Date: 12/31/2099             → Very future date
```

**🔍 Check**:
- Can you manually type invalid dates?
- Does calendar picker prevent bad dates?

---

#### TC3.6: Invoice Number Validation
**Try Creating Invoices With**:
```
Number: (empty)                  → Should auto-generate or require?
Number: INV-001                  → Create first
Number: INV-001                  → Try duplicate (should prevent)

Number: INVOICE-@#$%^           → Special chars
Number: 99999999999999999       → Very long number
Number: <script>alert()</script> → Script tags
```

**Expected**: System handles gracefully

---

#### TC3.7: Tax Edge Cases
**Try**:
1. Create invoice without selecting tax → Should default to 0% or require?
2. Create invoice with 100% tax → Total doubles
3. Create invoice with 0% tax → Should allow
4. Change tax rate mid-invoice → Should recalculate

---

#### TC3.8: Client Relationship
**Steps**:
1. Create invoice for Client A
2. Delete Client A
3. View invoice

**Expected**: Invoice still shows (with archived client) or warns  
**🚨 Critical**: Should not crash or show "undefined"

---

## 🔧 Test Session 4: UI/UX Stress Testing (30 min)

### TC4.1: Rapid Clicking
**Test**:
1. Click "Add New Client" button **10 times rapidly**
2. Click "Submit" button **5 times in 1 second**
3. Open/close forms rapidly

**🔍 Look For**:
- Multiple forms opening?
- Multiple submissions?
- UI freezing?

---

### TC4.2: Browser Compatibility
**Repeat Key Tests In**:
- Chrome (latest)
- Firefox (latest)
- Edge
- Safari (if on Mac)

**🔍 Note**:
- Layout differences
- Button click responsiveness
- Form validation behavior

---

### TC4.3: Mobile Responsiveness
**Steps**:
1. Open Chrome DevTools: `F12`
2. Click "Toggle device toolbar" (phone icon)
3. Test on:
   - iPhone SE (375x667)
   - iPad (768x1024)
   - Galaxy S20 (360x800)

**🔍 Check**:
- Can you reach all buttons?
- Is text readable without zooming?
- Do forms fit on screen?
- Are tables scrollable?

---

### TC4.4: Performance Testing
**Test**:
1. Create 50 customers (use bulk import if available, or script)
2. Create 100 invoices
3. Navigate to customer list
4. Scroll through list

**🔍 Measure**:
- Page load time
- Scroll smoothness
- Search response time
- Any memory leaks? (Check DevTools → Performance)

---

### TC4.5: Network Interruption
**Steps**:
1. Start creating an invoice
2. Fill half the form
3. Disconnect internet (WiFi off or unplug cable)
4. Try to save
5. Reconnect internet

**Expected**: Graceful error, option to retry  
**🔍 Questions**:
- Is data lost?
- Does form auto-save?
- Is error message helpful?

---

### TC4.6: Session Timeout
**Steps**:
1. Login
2. Leave browser idle for 30 minutes
3. Try to create customer

**Expected**: Session expired message, redirect to login  
**🚨 Red Flag**: If action succeeds without re-login (security issue)

---

## 🔒 Test Session 5: Security & Data Validation (30 min)

### TC5.1: XSS (Cross-Site Scripting) Attempts
**Inject In All Text Fields**:
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
javascript:alert('XSS')
<iframe src="https://malicious.com"></iframe>
```

**Expected**: Text displayed as plain text, NOT executed  
**🔍 Check**: View customer/invoice details - does script run?

---

### TC5.2: File Upload Vulnerabilities
**If App Has File Upload**:
```
Try uploading:
- .exe file          → Should reject
- 5GB file           → Should limit size
- file.php           → Should reject
- image.jpg.exe      → Should check real type
- Empty file (0 KB)  → Should handle
```

---

### TC5.3: URL Manipulation
**Try Accessing**:
```
http://localhost:3000/customer/999999    → Non-existent ID
http://localhost:3000/customer/abc       → Invalid format
http://localhost:3000/admin              → Unauthorized page
http://localhost:3000/../../../etc/passwd → Path traversal
```

**Expected**: 404 or redirect to error page, NOT crash

---

### TC5.4: Role-Based Access (If Applicable)
**If Multiple User Roles Exist**:
1. Login as "viewer" role
2. Try to create/edit/delete

**Expected**: UI hides buttons OR API rejects with 403 Forbidden

---

## 📋 Test Session 6: Data Integrity (20 min)

### TC6.1: Concurrent Edits
**Steps**:
1. Open 2 browser windows
2. Login to both as admin
3. Edit same customer in both
4. Save in Window 1
5. Save in Window 2

**Expected**: Last save wins OR conflict warning shown  
**🔍 Check**: Is data corrupted? Any error?

---

### TC6.2: Database Persistence
**Steps**:
1. Create 5 test customers
2. Restart backend server
3. Refresh page

**Expected**: All 5 customers still exist

---

### TC6.3: Backup & Export
**Test**:
1. Export customer list to CSV/Excel
2. Open file
3. Check data accuracy

**🔍 Verify**:
- All columns exported?
- Special characters preserved?
- Date formats correct?

---

## 🎨 Usability Observations

**While Testing, Note**:

✅ **Positive Findings**:
- What works smoothly?
- Intuitive features
- Helpful error messages
- Fast performance

❌ **Issues Found**:
- Confusing UI elements
- Slow operations
- Unclear error messages
- Missing features
- Bugs/crashes

---

## 📝 Bug Reporting Template

**When You Find a Bug, Record**:

```markdown
### Bug #: [Auto-increment number]

**Title**: [Short description]

**Severity**: 
- 🔴 Critical (crashes, data loss, security)
- 🟠 High (feature broken, major UI issue)
- 🟡 Medium (workaround exists)
- 🟢 Low (cosmetic, minor)

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 

**Actual Result**: 

**Browser/OS**: Chrome 120 / Windows 11

**Screenshot**: [Attach if helpful]

**Additional Notes**:
```

---

## 🎯 Success Criteria

**Exploratory Test Session is Complete When**:
- ✅ All 6 test sessions completed
- ✅ At least 10 edge cases tried
- ✅ 5+ bugs found and documented (or confirm zero bugs)
- ✅ Usability notes recorded

**Estimated Total Time**: 3-4 hours

---

## 💡 Pro Tips for Exploratory Testing

1. **Think Like a Hacker**: Try to break things
2. **Think Like a User**: Try confusing workflows
3. **Think Like a Child**: Click everything rapidly
4. **Think Like a Perfectionist**: Check every detail
5. **Be Creative**: Combine inputs in weird ways
6. **Be Methodical**: Document what you test
7. **Be Curious**: Ask "What if I...?"

---

## 📊 Deliverable: Exploratory Test Report

**After Testing, Create Report With**:

1. **Executive Summary**:
   - Total time spent: X hours
   - Areas tested: Authentication, Customers, Invoices, UI, Security, Data
   - Bugs found: X critical, X high, X medium, X low

2. **Detailed Findings**:
   - List of bugs with full details
   - List of usability improvements
   - List of positive observations

3. **Recommendations**:
   - Priority fixes
   - Nice-to-have improvements
   - Additional testing needed

4. **Appendix**:
   - Screenshots
   - Test data used
   - Environment details

---

**Happy Exploring! 🔍**

*Remember: The goal is to find issues before users do!*
