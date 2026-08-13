# PO Flow Implementation Plan

## Objective

Align the purchase order workflow with the final agreed business rules:

- Keep status names as-is: `Draft`, `Pending Approval`, `Approved`, `On Hold`
- Add an admin-only review gate before Super Admin approval
- One Super Admin approval is enough
- Receiving is tracked per line item
- Do not add a separate `FOR ADMIN REVIEW` status unless the UI truly needs it

## Final Business Rules

### 1) PO Submission and Review

- Admin creates PO
- PO starts in `Draft`
- When submitted, it moves to `Pending Approval`
- Once in `Pending Approval`, the PO must go through the admin review gate
- Admins can approve or reject the PO
- If an admin rejects it, the PO returns to the creator for revision
- On resubmission, all admin review records are reset and admins must review again from scratch
- The review gate is admin-only

### 2) Super Admin Approval

- One Super Admin approval is enough
- If approved, the PO becomes `Approved`
- If held, the PO becomes `On Hold`
- `On Hold` is a paused state, not a dead state
- The current implementation keeps the status names as-is; no rename is required for this phase

### 3) Receiving and Completion

- Receipt is tracked per line item
- Each line item can be partially received
- Completion is determined when all line items meet expected quantity
- There is no separate `FOR ADMIN REVIEW` status in the actual database model for this phase

## Implementation Decision Summary

We are choosing the minimal and safest version for this codebase:

- Do not invent a new PO status enum just for the admin review gate
- Use a dedicated review table to track admin approval decisions
- Keep the public PO status values stable
- Keep Super Admin approval single-approver

## Critical Findings from Current Codebase

The current implementation does not yet match the intended flow:

- PO approval is currently Super Admin only in [backend/routes/purchaseOrders.js](backend/routes/purchaseOrders.js#L367-L472)
- The system currently sets status to `Approved` or `On Hold` without an intermediate admin review gate
- There is no per-line receive tracking in the existing PO schema
- There is no reset/re-review flow after a rejected PO is resubmitted

## Proposed Implementation Sequence

### Phase 1 — Database model for admin review

Add a dedicated review table:

- `purchase_order_admin_reviews`
  - `id`
  - `purchase_order_id`
  - `reviewer_id`
  - `decision` (`approved` | `rejected`)
  - `comment`
  - `reviewed_at`
  - `created_at`

This is the preferred implementation because it records workflow state without polluting the PO status enum.

### Phase 2 — Admin review gate

Implementation steps:

1. When a PO is submitted, create or initialize the admin review tracking state
2. Allow only admin-role users to review
3. Capture each admin decision with a record
4. If a decision is rejected, return the PO to the creator for edit/resubmission
5. On resubmission, clear prior admin review rows and require a fresh admin review cycle

### Phase 3 — Super Admin approval flow

Implementation steps:

1. Keep one Super Admin approval as sufficient
2. Allow only approval or hold actions
3. Ensure a held PO stays recoverable and editable rather than dead
4. If approved, update the PO to `Approved`

### Phase 4 — Receiving model

Implementation steps:

1. Add `received_quantity` to PO item records or create a dedicated receiving table
2. Track receipt per line item
3. Capture receiving date and remarks
4. Compute completion from total received vs expected quantity

### Phase 5 — Completion logic

Implementation steps:

1. Detect when all PO lines are fully received
2. Update the PO status to `Completed`
3. Update any linked PR or downstream document status if required

## Recommended Scope for This Sprint

We should implement the minimal version that matches the agreed rules without overbuilding:

1. Keep existing status names
2. Add admin review tracking and reset behavior
3. Keep one Super Admin approval requirement
4. Add per-line receipt tracking and completion check
5. Do not add a formal `FOR ADMIN REVIEW` status unless UX later requires it

## Open Decisions That Are Now Resolved

These are now decided:

1. Keep status names as-is (`Approved`, `On Hold`)
2. Use admin-only review gate
3. Build the admin review gate in the PO path now
4. Do not create a separate `FOR ADMIN REVIEW` enum status unless later required by UI

## Execution Plan

The work now breaks down into:

- Database migration for `purchase_order_admin_reviews`
- Backend route updates in [backend/routes/purchaseOrders.js](backend/routes/purchaseOrders.js#L367-L472)
- Resubmission/reset logic after rejection
- Admin approval and rejection flow
- Super Admin final approval logic
- Partial receiving per line item
- Completion check for `Completed` status

## File References

Relevant implementation points:

- [backend/routes/purchaseOrders.js](backend/routes/purchaseOrders.js#L367-L472)
- [backend/routes/purchaseRequests.js](backend/routes/purchaseRequests.js#L1164-L1245)
- [docs/PO_SUPER_ADMIN_FLOW.md](docs/PO_SUPER_ADMIN_FLOW.md#L7-L31)

## Critical Findings from Current Codebase

The current implementation does not yet match the intended flow:

- PO approval is currently Super Admin only in [backend/routes/purchaseOrders.js](backend/routes/purchaseOrders.js#L367-L472)
- The system currently sets status to `Approved` or `On Hold` instead of a separate review/placement flow
- There is no per-line receive tracking in the existing PO schema
- There is no step for admin review re-entry after resubmission in the current PO flow

## Proposed Implementation Sequence

### Phase 1 — Confirm final status model

Decide which status names we will keep for the production flow:

- `Draft`
- `Pending Approval`
- `Approved` / `Confirmed`
- `On Hold`
- `Cancelled`
- `Received`
- `Completed`

Decision needed:

- Keep code naming as-is (`Approved`, `On Hold`), or rename to business-friendly names (`Confirmed`, `Cancelled`)
- Choose whether `Cancelled` is an explicit decision or merely a later admin action

### Phase 2 — Add admin review gating for PO resubmission

Implementation steps:

1. Add review records for PO admin reviewers, if we want explicit re-review tracking
2. When a PO is rejected and resubmitted, reset all admin review status entries
3. Require admins to review again before the PO can move forward
4. Ensure a rejected/admin-returned PO does not silently proceed without a fresh review cycle

### Phase 3 — Super Admin approval flow

Implementation steps:

1. Keep one Super Admin approval as sufficient
2. Allow only approval or hold actions
3. Make sure a held PO remains editable or recoverable, not dead
4. If approved, propagate the result to the related PR or downstream records as required

### Phase 4 — Receiving mode
POl

Implementation steps:

1. Add `received_quantity` and/or a receipt table for PO items
2. Track partial receipt per PO line item
3. Capture receiving date and remarks
4. Compute completion from total received vs expected quantity

### Phase 5 — Completion logic

Implementation steps:

1. Detect when all PO lines are fully received
2. Update PO status to `Completed`
3. Update any linked PR or downstream document status if required

## Recommended Scope for This Sprint

We should implement the minimal version that matches the agreed rules without overbuilding:

1. Use current status model, but explicitly document the flow
2. Add PO admin review reset/re-review behavior
3. Keep one Super Admin approval requirement
4. Add per-line receipt tracking and completion check
5. Leave the formal `FOR ADMIN REVIEW` status out unless there is a hard requirement to expose it in UI

## Open Decisions

Before starting code, we need to decide:

1. Should we keep the current status names or standardize to a cleaner set like `Confirmed` instead of `Approved`?
2. Do we want a formal `Cancelled` status from Super Admin, or should cancellation remain an admin-only later-stage action?
3. Are we building the admin review gate in the PO path now, or only documenting it for the next phase?
4. Should the UI expose “reviewed/resubmitted” state clearly, even if no extra database status is added?

## Suggested Next Discussion

We should decide the final business rule set before coding. Then I can turn this plan into:

- a technical task breakdown
- exact files to change
- API route additions
- database schema changes
- validation steps

## File References

Relevant implementation points:

- [backend/routes/purchaseOrders.js](backend/routes/purchaseOrders.js#L367-L472)
- [backend/routes/purchaseRequests.js](backend/routes/purchaseRequests.js#L1164-L1245)
- [docs/PO_SUPER_ADMIN_FLOW.md](docs/PO_SUPER_ADMIN_FLOW.md#L7-L31)
