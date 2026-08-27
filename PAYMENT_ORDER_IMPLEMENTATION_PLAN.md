# Payment Order Flow Implementation Plan

## Objective

Align the payment order workflow with the agreed business rules for the non-debt path:

- Payment Order is for non-debt transactions
- Purchase Order remains the debt flow
- Admin review gate is required before Super Admin approval
- One Super Admin approval is enough
- Keep current status names as-is unless product later requests a rename
- No separate `FOR ADMIN REVIEW` status is required in the database enum unless the UI demands it

## Business Rules to Implement

### 1) Payment Order Origin

- Payment Order is created from non-debt sources such as service requests, cash requests, and reimbursements
- The source document is not a purchase request
- The approval flow is structurally the same as the PO flow, but tied to a different source type

### 2) Submission and Review

- Admin creates Payment Order
- Payment Order starts in `Draft`
- When submitted, it moves to `Pending Approval`
- Payment Order must pass an admin-only review gate before final Super Admin approval
- If rejected, it returns to the creator for revision
- On resubmission, admin review records are reset and admins must review again from scratch

### 3) Super Admin Approval

- One Super Admin approval is enough
- If approved, the Payment Order becomes `Approved`
- If held, the Payment Order becomes `On Hold`
- `On Hold` remains a recoverable paused state, not a dead state

### 4) Completion and Settlement

- Payment Order should follow the same settlement lifecycle as other financial documents
- The final approval is the last decision gate before disbursement or DV creation depending on downstream process

## Key Findings from Current Codebase

The current implementation already shows the same pattern as the PO flow:

- Payment Order creation and status updates are handled in [backend/routes/paymentOrders.js](backend/routes/paymentOrders.js#L96-L315)
- The route already includes status values such as `Draft`, `Pending`, `For Admin Approval`, `For Super Admin Final Approval`, `Approved`, `On Hold`, and `Rejected`
- The flow is currently structured around admin and Super Admin stages, which matches the agreed business rule set
- The main missing piece is the formal admin review reset and re-review behavior when a payment order is rejected and resubmitted

## Proposed Implementation Sequence

### Phase 1 — Confirm final status model

Use the same naming convention as the PO flow:

- `Draft`
- `Pending Approval`
- `Approved`
- `On Hold`
- `Rejected`

Keep the current status model intact unless product decides to rename to more user-friendly labels later.

### Phase 2 — Add dedicated admin review tracking

Implement a review table for Payment Orders:

- `payment_order_admin_reviews`
  - `id`
  - `payment_order_id`
  - `reviewer_id`
  - `decision` (`approved` | `rejected`)
  - `comment`
  - `reviewed_at`
  - `created_at`

This keeps the workflow auditable without polluting the enum with a fake state like `FOR ADMIN REVIEW`.

### Phase 3 — Admin review gate

Implementation steps:

1. When a Payment Order is submitted, initialize admin review tracking
2. Restrict review access to admin-role users only
3. Record each admin decision and reason
4. If rejected, return the Payment Order to the creator for revision
5. When resubmitted, clear previous review records and require a fresh admin review cycle

### Phase 4 — Super Admin approval flow

Implementation steps:

1. One Super Admin approval is enough
2. Allow `approved` or `hold` decisions
3. Approved → `Approved`
4. Held → `On Hold`
5. Keep the final decision path simple and consistent with the PO flow

### Phase 5 — Downstream lifecycle

After Super Admin final approval:

- continue to downstream disbursement or settlement processing
- maintain ledger and document status consistency with the related source record

## Recommended Scope for This Sprint

We should implement the minimal version that matches the agreed rules without overbuilding:

1. Keep the current status names
2. Add admin review tracking and reset behavior
3. Keep one Super Admin approval requirement
4. Do not add a separate `FOR ADMIN REVIEW` DB enum unless UI requires it
5. Keep the workflow parallel to the PO flow for consistency

## Final Decision Summary

The payment order flow should mirror the PO flow, but for non-debt sources:

- Debt path: Purchase Order
- Non-debt path: Payment Order
- Same approval pattern: admin review → Super Admin approval
- Same rule: one Super Admin approval is enough

## Relevant Files

- [backend/routes/paymentOrders.js](backend/routes/paymentOrders.js#L96-L315)
- [backend/routes/paymentRequests.js](backend/routes/paymentRequests.js#L490-L581)
- [backend/routes/serviceRequests.js](backend/routes/serviceRequests.js#L547-L667)
- [backend/routes/cashRequests.js](backend/routes/cashRequests.js#L527-L679)
