## 2026-04-10

### Completed
- Extended payment schedule support from Purchase Requests to:
  - Service Requests
  - Cash Requests
  - Reimbursements
- Added backend validation and lifecycle enforcement for all 3 modules:
  - `payment_schedules` input normalization/validation
  - At least one schedule required before submit/approval
  - Schedules returned in detail endpoints
  - Schedule summary fields in list endpoints (`payment_schedule_count`, `next_payment_date`)
- Updated reminder job to process schedules for:
  - PR, SR, CR, and Reimbursements
  - D-3, D-1, and D-day reminders
  - Per-module dedupe logs
- Added deploy-ready SQL patch for non-PR schedule tables/logs:
  - `backend/database/2026-04-10_non_pr_payment_schedules_patch.sql`
- Updated frontend create flows and preview modals:
  - Service Requests form + preview
  - Cash Requests (main page) form + preview
  - Reimbursements form + preview
  - Added payment schedule row UI (date, amount, note) and client-side validation
- Kept `payment_terms_note` as optional narrative text; schedules are the required structured input.

### Verification
- Backend syntax checks passed:
  - `serviceRequests.js`
  - `cashRequests.js`
  - `reimbursements.js`
  - `paymentScheduleReminders.js`
- Frontend build passed:
  - `npm --prefix frontend run build`

### Notes
- SQL was delivered as a new patch file (no direct rewrite of the canonical schema dump).
- Reminder worker was made tolerant of missing schedule tables (`ER_NO_SUCH_TABLE`) to avoid crashes before migration is applied.

### Addendum (Additional Work Done Today)
- Reimbursements realtime refresh improvements:
  - Added global `reimbursements:changed` event emissions in reimbursement service after create/update/submit/approve/receive/attachment changes/delete.
  - Added listeners in Reimbursements page, Approvals page, Payment Orders page, and Layout pending-count refresh path.
- Reimbursements role update:
  - Allowed `procurement` users to submit reimbursements (not only engineers) under existing draft/requester constraints.
- Fixed PR preview modal loading issue:
  - Restored `purchaseRequestService.getById(...)` in frontend service to support preview/detail fetch.
- Production export failure fix (Excel templates):
  - Added `backend/templates/` and copied all `.xlsx` export templates there.
  - Added shared resolver utility `backend/utils/excelTemplatePath.js`.
  - Updated export routes (PR/PO/SR/CR/RMB/Payment Request/Payment Order/DV) to load templates from backend-internal path.
- Purchase Requests parity with SR "View all":
  - Added engineer-only `View all` toggle in PR list using `view=all` URL param behavior.
- Order Numbers UX cleanup:
  - Removed Actions/eye column in detailed breakdown tables.
  - Made table rows directly clickable to open preview modals.
  - Added keyboard accessibility (`Enter`/`Space`) for row preview.
- Dashboard Recent Activity scoping + limit:
  - Switched dashboard fetch to scoped paginated list endpoints instead of force-fetching all PRs.
  - Added `purchaseOrderService.list({ page, pageSize })`.
  - Updated Recent Activity to show top 5 overall records.
  - Updated PR/PO dashboard labels and counters to reflect "recent shown" vs total.
- Deployment/runbook support:
  - Added/updated production command documentation and gitignore behavior for local-only deployment notes.
  - Assisted with Docker+Nginx troubleshooting steps during production reset and rebuild.

### Additional Verification
- Multiple frontend production builds passed after UI/service changes:
  - `npm --prefix frontend run build`
- Backend syntax checks passed for updated export route set and shared template resolver.

### Addendum (Mobile UX Optimization Work)
- Optimized mobile layout for Service Requests page:
  - Responsive header/filter controls and mobile-friendly pagination behavior.
  - Added dedicated mobile card list view while preserving desktop layout.
  - Updated Create Service Request modal for mobile form usability.
- Optimized mobile layout for Reimbursements page:
  - Added dedicated mobile card list view and improved compact action placement.
  - Updated Create Reimbursement modal for stacked mobile fields and schedule rows.
- Optimized preview modals for mobile across request modules:
  - Service Request preview modal
  - Reimbursement preview modal
  - Purchase Request preview modal
  - Purchase Order preview modal
  - Payment Request preview modal
  - Payment Order preview modal
  - Payment Order Approval preview modal
  - Cash Request preview modal
  - Disbursement Voucher preview modal
- Mobile preview improvements included:
  - Responsive modal shell spacing/sizing (`p-2 sm:p-4`, responsive max-height).
  - Mobile-friendly header/footer actions (stack/wrap full-width buttons on small screens).
  - Mobile summary/detail blocks for dense table-like previews.
  - Horizontal scroll containment for wide table sections where needed.

### Mobile UX Verification
- Frontend production build passed after all mobile page + preview modal updates:
  - `npm --prefix frontend run build`
