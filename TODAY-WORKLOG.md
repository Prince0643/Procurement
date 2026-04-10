# Today Worklog

Date: 2026-04-09

## Completed
- Reviewed `dbschema/procurement_db.sql` status enums and fixed validation gaps around `Received` coverage.
- Confirmed and validated starting-process status models for:
  - `purchase_requests`
  - `service_requests`
  - `cash_requests`
  - `reimbursements`
- Verified schema fixes:
  - Removed malformed reimbursements enum string.
  - Removed duplicate `Approved` in `purchase_orders.status`.

## Implemented Status Transition: Service Requests -> Received
- Added backend endpoint: `PUT /service-requests/:id/received`.
- Enforced rules:
  - requester-only action (`requested_by`),
  - allowed source statuses: `PO Created`, `Payment Request Created`, `Payment Order Created`, `Paid`.
- Added frontend service method and UI action (mark as received).
- Updated SR status badges/filters and approvals grouping to include `Received`.

## Implemented Status Transition: Cash Requests -> Received
- Added backend endpoint: `PUT /cash-requests/:id/received`.
- Enforced rules:
  - requester-only action,
  - allowed source statuses: `Payment Request Created`, `Payment Order Created`, `Paid`.
- Added frontend service method and UI action (mark as received) on active route `/cash-requests`.
- Updated status badge/filter handling and approvals cash-request grouping to include `Received`.

## Implemented Status Transition: Reimbursements -> Received
- Added backend endpoint: `PUT /reimbursements/:id/received`.
- Enforced rules:
  - requester-only action,
  - allowed source statuses: `Payment Order Created`, `Paid`.
- Added frontend service method and UI action (mark as received).
- Updated reimbursement status badges and approvals reimbursement grouping to include `Received`.

## Notes
- No new schema columns were added for receive audit fields (`received_by`, `received_at`) for SR/CR/RMB in this pass.
- Implementation follows consistent receive-flow behavior across PR, SR, CR, and reimbursement modules.

## Implemented: Service Request -> Purchase Order Flow Fixes
- Fixed SR-based PO create failure caused by strict PR-linked columns in DB:
  - `purchase_orders.purchase_request_id` set to nullable.
  - `purchase_order_items.purchase_request_item_id` set to nullable.
- Added migration file:
  - `backend/migrations/make_po_pr_links_nullable_for_service_requests.sql`.
- Applied the same nullability updates in schema snapshots:
  - `dbschema/procurement_db.sql`
  - `backend/database/whole_sql_schema.sql`
- Applied migration to live database (`procurement_db`) and verified nullable status via `INFORMATION_SCHEMA`.

## Implemented: Order Number Enforcement from Source Document
- Updated PO backend create flow to derive `order_number` from selected source record (PR/SR), not free-form payload.
- Added backend validation to reject create when source has no order number.
- Updated PO form UI:
  - `Order Number` is required and read-only.
  - Auto-populates from selected PR/SR.
  - Removed optional/manual behavior.

## Implemented: Item Validation + SR Itemless PO Support
- Added frontend and backend item-row validation for PO creation:
  - requires valid `item_id`, `quantity > 0`, `unit_price >= 0` for PR-based line items.
- Resolved SR mismatch (SR has no line items):
  - SR source can now create PO with zero items.
  - PO `total_amount` for SR source defaults to `service_requests.amount`.
  - PO UI hides line-item requirement for SR and shows informational note.

## Implemented: Super Admin Access to Service Requests Module
- Enabled sidebar access for `super_admin` to `/dashboard/service-requests` in:
  - `frontend/src/config/navigation.js`
- Verified route already existed in app routes; no route-level addition required.

## Implemented: Payment Terms in All Preview Modals
- Added `Payment Terms` display (with fallback logic) in preview modals for:
  - payment orders (`POPreviewModal`, `POApprovalPreviewModal`)
  - payment requests, service requests, cash requests, disbursement vouchers, reimbursements
  - purchase requests / purchase orders (existing coverage validated)
- Standardized display fallback order:
  - `payment_terms_note` -> `payment_term` -> `payment_terms_code` -> `-`
- Updated SR/CR/Reimbursement preview display to support multiline terms (`whitespace-pre-wrap`).

## Implemented: Required Multiline Payment Terms on Create (SR/CR/Reimbursement)
- Added required `payment_terms_note` in create forms:
  - `ServiceRequestsManagement`
  - `CashRequests`
  - `ReimbursementsManagement`
- Enforced frontend validation: block submit if payment terms are empty.
- Updated create payloads to send trimmed `payment_terms_note`.
- Backend create routes now validate and persist `payment_terms_note`:
  - `POST /service-requests`
  - `POST /cash-requests`
  - `POST /reimbursements`
- Error message used consistently: `Payment terms are required`.

## Implemented: Schema + Migration Fix for `Unknown column 'payment_terms_note'`
- Added migration:
  - `backend/migrations/add_payment_terms_to_sr_cr_reimbursements.sql`
- Made migration rerunnable/idempotent using `ADD COLUMN IF NOT EXISTS`.
- Applied migration to live local DB (`procurement_db`) and verified column exists in:
  - `service_requests`
  - `cash_requests`
  - `reimbursements`
- Synced schema snapshots:
  - `backend/database/whole_sql_schema.sql`
  - `dbschema/procurement_db.sql`
- Confirmed service request insert no longer fails on `payment_terms_note` (rollback-safe DB insert test passed).
