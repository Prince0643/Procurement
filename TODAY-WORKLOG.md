# Work Log - March 25, 2026

- Updated `frontend/src/components/Dashboard.jsx` to improve mobile responsiveness.
- Made dashboard tabs horizontally scrollable on small screens.
- Reworked the Pricing Trends header/filters to wrap into a vertical layout on mobile and ensured selects use full width.
- Tuned Recharts settings for mobile readability (margins, axis sizing, tick sizing, legend font size, dot sizing).

## Approvals Page Mobile Optimization

- Updated `frontend/src/components/approvals/Approvals.jsx` for mobile responsiveness.
- Made main tabs horizontally scrollable on mobile (`overflow-x-auto`).
- Updated all 8 sub-tabs to use `flex-wrap` for better mobile layout.
- Implemented mobile card list views for:
  - Purchase Orders (with expand/collapse details)
  - Purchase Requests (with expand/collapse details)
  - Payment Requests (with expand/collapse details)
- Added `isMobile` state detection and `InfoRow` helper component.
- Desktop tables now use `hidden sm:block` to show only on larger screens.
- Mobile card lists use `sm:hidden` to show only on small screens.
- **Bug Fixes**: Added missing state declarations that were causing runtime errors:
  - `purchaseOrders`, `purchaseRequests`, `paymentRequests`
  - `serviceRequests`, `cashRequests`, `disbursementVouchers`

