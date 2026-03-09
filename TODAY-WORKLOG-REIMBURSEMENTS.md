# Worklog - Procurement System Updates (Session Summary)

## Goal
Implement and stabilize reimbursement attachments (upload + preview) and configure the reimbursement approval workflow (Procurement -> Super Admin) including surfacing reimbursements in the Super Admin Approvals page. Also included minor UI/navigation updates touched during the session.

## Issues Encountered
### 1) Attachment preview failing
- Symptoms:
  - Image preview not rendering.
  - Network error similar to:
    - `net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)`
  - 404s when the browser requested the wrong path (e.g. with `/api` or `/backend` prefixes).

### 2) Attachment file paths not environment-safe
- Previously, attachment records were being stored with absolute URLs such as `http://localhost:5000/...`.
- This breaks when deploying because:
  - Frontend base URL differs (e.g. `https://procurement.xandree.com/`).
  - Backend API base URL differs (e.g. `https://procurement-api.xandree.com/`).

## Fixes Implemented

## A) Backend - Serve uploads with proper CORS headers
**File:** `backend/server.js`
- Updated static file serving for `/uploads` to include CORS headers so that the browser can load images across origins.

Result:
- Image requests to `/uploads/...` no longer get blocked by the browser’s cross-origin restrictions.

## B) Backend - Store attachment `file_path` as a relative path
**File:** `backend/routes/reimbursements.js`
- Updated attachment insert and response to store and return:
  - `/uploads/reimbursements/<filename>`
- Instead of storing absolute URLs.

Why:
- Keeps database records environment-agnostic.
- Frontend can dynamically build the full URL at runtime.

## C) Frontend - Attachment preview URL handling
**File:** `frontend/src/components/reimbursements/ReimbursementsManagement.jsx`
- Image preview modal was updated so that:
  - If `file_path` is already a full URL (`startsWith('http')`), use it directly.
  - Otherwise, prefix it with the runtime base URL.
- Added `crossOrigin="anonymous"` to the `<img />` for safer cross-origin loading.

## D) Approval workflow (Procurement -> Super Admin)
### Workflow
1. **Create reimbursement**
   - Initial status: `For Procurement Review`
2. **Procurement approves**
   - Status: `For Super Admin Final Approval`
3. **Super Admin approves**
   - Status: `For Purchase`
4. **Create Payment Order from reimbursement**
   - Status: `Payment Order Created`
5. **Rejected**
   - Status: `Rejected`

**File:** `backend/routes/reimbursements.js`
- Super Admin approval sets status to `'For Purchase'` instead of `'Approved'`
- This allows reimbursements to flow into the Payment Order creation process

## E) Super Admin Approvals page - Add Reimbursements Tab & Filter Update
**File:** `frontend/src/components/approvals/Approvals.jsx`

**Changes:**
- Added `reimbursementService` integration to fetch reimbursements
- Added **Reimbursements** top-level tab with sub-tabs:
  - **Pending**: `'For Procurement Review'` and `'For Super Admin Final Approval'`
  - **On Hold**: `'On Hold'`
  - **Approved**: `'For Purchase'` and `'Paid'`
- Updated filter logic for **Approved** tab to show `'For Purchase'` status (instead of `'Approved'`)
- Added approval handler using `reimbursementService.approve(id, status, rejectionReason)`

## F) Navigation access update
**File:** `frontend/src/config/navigation.js`
- Updated the Reimbursements navigation item to include the `procurement` role so procurement users can access the module from the sidebar.

## G) Purchase Requests UI update
**File:** `frontend/src/components/purchase-requests/PurchaseRequests.jsx`
- Added display of Payment Type (debt/non-debt) in the expanded PR view (desktop + mobile expanded view).

## Recommended Follow-ups
- Restrict actions in Approvals UI:
  - Procurement should only approve items in `For Procurement Review`.
  - Super Admin should only approve items in `For Super Admin Final Approval`.
- Add a better rejection UX (modal instead of `prompt`).
- Ensure the production environment uses the correct API base URL configuration.

## H) Cash Request as Payment Request Source
**Files:**
- `frontend/src/components/PaymentRequests.jsx`
- `backend/routes/paymentRequests.js`

**Changes:**
- Added **Cash Request** as third Source Type option in Payment Request creation modal
- Cash Request filter: `status = 'Approved'` AND `cr_type = 'payment_request'`
- Auto-populates payee, project, address, order number, amount from selected Cash Request
- Backend validates:
  - Cash Request exists
  - Status is 'Approved'
  - cr_type is 'payment_request'
- Updates Cash Request status to 'Payment Request Created' after payment request creation

## I) Bug Fix - Cash Request Items Table Error
**File:** `backend/routes/cashRequests.js`

**Issue:**
- Error: `Table 'procurement_db.cash_request_items' doesn't exist`
- The code was trying to query a `cash_request_items` table that doesn't exist

**Fix:**
- Removed the query to `cash_request_items` table
- Cash Requests store item data directly in the `cash_requests` table (quantity, unit, amount, purpose are columns)
- Return empty items array since line items are stored in the main table

## J) Cash Request as Payment Order Source
**Files:**
- `frontend/src/components/PaymentOrders.jsx`
- `backend/routes/paymentOrders.js`
- `backend/database/alter_payment_orders_add_cash_request.sql`

**Changes:**
- Added **Cash Request** as second Source Type option in Payment Order creation modal
- Cash Request filter: `status = 'Approved'` AND `cr_type = 'payment_order'`
- Auto-populates payee, project, address, order number, amount from selected Cash Request
- Backend validates:
  - Cash Request exists
  - Status is 'Approved'
  - cr_type is 'payment_order'
- Updates Cash Request status to 'Payment Order Created' after payment order creation
- Added `cash_request_id` column to `payment_orders` table (SQL file created)

## K) Reimbursement as Payment Order Source
**Files:**
- `frontend/src/components/PaymentOrders.jsx`
- `backend/routes/paymentOrders.js`
- `backend/database/alter_payment_orders_add_reimbursement.sql`

**Changes:**
- Added **Reimbursement** as third Source Type option in Payment Order creation modal
- Reimbursement filter: `status = 'For Purchase'`
- Payee field shows as text input (not supplier dropdown) for reimbursement source
- Auto-populates payee (from `payee` field, fallback to employee name), project, project address, order number, amount from selected Reimbursement
- Backend validates:
  - Reimbursement exists
  - Status is 'For Purchase'
- Updates Reimbursement status to 'Payment Order Created' after payment order creation
- Added `reimbursement_id` column to `payment_orders` table (SQL file created)
- Fixed field name: uses `amount` (not `total_amount`)

## Files Touched (Summary)
- `backend/server.js`
- `backend/routes/reimbursements.js`
- `backend/routes/paymentRequests.js`
- `backend/routes/paymentOrders.js`
- `frontend/src/components/reimbursements/ReimbursementsManagement.jsx`
- `frontend/src/components/approvals/Approvals.jsx`
- `frontend/src/components/PaymentRequests.jsx`
- `frontend/src/components/PaymentOrders.jsx`
- `frontend/src/services/reimbursements.js` (used by the above)
- `frontend/src/services/cashRequests.js` (used by the above)
- `frontend/src/config/navigation.js`
- `frontend/src/components/purchase-requests/PurchaseRequests.jsx`
