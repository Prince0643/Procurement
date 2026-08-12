# Procurement System Flowchart

## 1. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROCUREMENT SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   ENGINEER   │      │ PROCUREMENT  │      │    ADMIN     │      │ SUPER ADMIN  │
│   (Requester)│      │   (Reviewer) │      │(PO Creator)  │      │  (Approver)  │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │                     │
       │  1. Create PR       │                     │                     │
       │────────────────────>│                     │                     │
       │                     │                     │                     │
       │                     │  2. First Review    │                     │
       │                     │────────────────────>│                     │
       │                     │                     │                     │
       │                     │                     │  3. Proc Review     │
       │                     │<────────────────────│                     │
       │                     │                     │                     │
       │                     │  4. Second Review   │                     │
       │                     │────────────────────>│                     │
       │                     │                     │                     │
       │                     │                     │  5. Create PO       │
       │                     │                     │─────┐               │
       │                     │                     │     │               │
       │                     │                     │<────┘               │
       │                     │                     │                     │
       │                     │                     │  6. Final Approval  │
       │                     │                     │────────────────────>│
       │                     │                     │                     │
       │  7. Receive Items   │                     │                     │
       │<───────────────────────────────────────────────────────────────-│
       │                     │                     │                     │
       ▼                     ▼                     ▼                     ▼
```

---

## 2. PURCHASE REQUEST (PR) APPROVAL FLOW

```
┌─────────────────┐
│  Engineer       │
│  Creates PR     │
│  Status: PENDING│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Super Admin     │ NO  │  Send Rejection │
│ First Review    │────>│  to Engineer    │
│ Approve?        │     │  Status: REJECTED
└────────┬────────┘     └─────────────────┘
     YES │
         │
         ▼
┌─────────────────┐
│ Status: FOR     │
│ PROCUREMENT     │
│ REVIEW          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Procurement     │ NO  │  Send Rejection │
│ Reviews PR      │────>│  to Engineer    │
│ Approve?        │     │  (with reason)  │
└────────┬────────┘     │  Status: REJECTED
     YES │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Status: FOR     │
│ SUPER ADMIN     │
│ FINAL APPROVAL  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Super Admin     │ NO  │  Send Rejection │
│ Second Review   │────>│  to Engineer    │
│ Approve?        │     │  Status: REJECTED
└────────┬────────┘     └─────────────────┘
     YES │
         │
         ▼
┌─────────────────┐
│ Status: FOR     │
│ PURCHASE        │
│ Notify Admin    │
└─────────────────┘
```

---

## 2.1 PURCHASE REQUEST - UNACCREDITED SUPPLIER FLOW (THE CURRENT BUG)

```text
┌─────────────────┐
│ Engineer        │
│ Creates PR      │
│ (Unaccredited   │
│  Supplier)      │
└────────┬────────┘
         │
         │ BUG 1: System assigns Joylene & Daniel as reviewers 
         │ (status: 'pending') even though PR is not ready for them yet.
         ▼
┌─────────────────┐
│ Status: PENDING │
│ ACCREDITATION   │
│ REVIEW          │
└────────┬────────┘
         │
         │ Super Admin goes to Suppliers tab
         │ and accredits the supplier
         ▼
┌─────────────────┐
│ Status updates  │
│ to FOR ENGINEER │
│ REVIEW          │
└────────┬────────┘
         │
         │ BUG 2: System tries to assign Joylene & Daniel AGAIN.
         │ Database throws "Duplicate Entry" error and ignores it.
         ▼
┌─────────────────┐
│ Joylene & Daniel│
│ click "For      │
│ Reviews" tab    │
└────────┬────────┘
         │
         │ BUG 3: Backend sends the PR to the Frontend, BUT the 
         │ Frontend expects a clean state and fails to render the row
         │ because the reviewers were attached during the previous status.
         ▼
┌─────────────────┐
│ Frontend shows: │
│ "0 Requests"    │
└─────────────────┘
```

---

## 3. PURCHASE ORDER (PO) FLOW

```
┌─────────────────┐
│  PR Approved    │
│  (For Purchase) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin Creates  │
│  Purchase Order │
│  Status: DRAFT  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin Places   │
│  Order (Real    │
│  World Action)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Status: ORDERED│
│  Notify Super   │
│  Admin          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Super Admin     │ NO  │  Notify Admin   │
│ Final Approval  │────>│  Status:        │
│ Approve?        │     │  CANCELLED      │
└────────┬────────┘     └─────────────────┘
       YES │
         │
         ▼
┌─────────────────┐
│ Status:         │
│ CONFIRMED       │
│ Notify Engineer │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Engineer        │
│ Receives Items  │
│ Marks as        │
│ RECEIVED        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ All Items       │ YES ┌─────────────────┐
│ Received?       │────>│ Status:         │
└─────────────────┘     │ COMPLETED       │
       NO               └─────────────────┘
        │
        ▼
┌─────────────────┐
│ Wait for        │
│ remaining items │
└─────────────────┘
```

---

## 4. USER ROLES & PERMISSIONS MATRIX

```
┌────────────────────┬──────────┬─────────────┬───────┬─────────────┐
│      FEATURE       │ Engineer │ Procurement │ Admin │ Super Admin │
├────────────────────┼──────────┼─────────────┼───────┼─────────────┤
│ Browse Items       │    ✓     │      ✓      │   ✓   │      ✓      │
│ Create PR          │    ✓     │      ✗      │   ✗   │      ✗      │
│ Approve PR (1st)   │    ✗     │      ✗      │   ✗   │      ✓      │
│ Approve PR (Proc)  │    ✗     │      ✓      │   ✗   │      ✗      │
│ Approve PR (2nd)   │    ✗     │      ✗      │   ✗   │      ✓      │
│ Create PO          │    ✗     │      ✗      │   ✓   │      ✗      │
│ Approve PO (Final) │    ✗     │      ✗      │   ✗   │      ✓      │
│ Mark Items Received│    ✓     │      ✗      │   ✗   │      ✗      │
│ Manage Items       │    ✗     │      ✓      │   ✓   │      ✗      │
│ Manage Suppliers   │    ✗     │      ✗      │   ✓   │      ✗      │
│ View All PRs/POs   │    ✗     │      ✓      │   ✓   │      ✓      │
│ System Settings    │    ✗     │      ✗      │   ✗   │      ✓      │
└────────────────────┴──────────┴─────────────┴───────┴─────────────┘
```

---

## 5. DATABASE ENTITY RELATIONSHIP (Simplified)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   employees     │       │purchase_requests│       │ purchase_orders │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ employee_no     │       │ pr_number       │       │ po_number       │
│ first_name      │       │ requested_by    │◄──────│ purchase_req_id │
│ last_name       │◄──────│ (FK)            │       │ supplier_id     │
│ role            │       │ status          │       │ prepared_by (FK)│
│ is_active       │       │ approved_by(FK) │◄──────┤ status          │
└─────────────────┘       │ total_amount    │       │ total_amount    │
         │                └─────────────────┘       └─────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   suppliers     │       │purchase_request_│
├─────────────────┤       │    items        │
│ id (PK)         │       ├─────────────────┤
│ supplier_code   │       │ id (PK)         │
│ supplier_name   │       │ pr_id (FK)      │
│ contact_person  │       │ item_id (FK)    │
│ email, phone    │       │ quantity        │
└─────────────────┘       │ unit_price      │
         │                │ status          │
         │                └─────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  supplier_items │       │     items       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ supplier_id(FK) │       │ item_code       │
│ item_id (FK)    │       │ item_name       │
│ price           │       │ category_id(FK) │
│ lead_time_days  │       │ unit            │
│ is_preferred    │       └─────────────────┘
└─────────────────┘
```

---

## 6. NOTIFICATION FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                     TRIGGER EVENTS                          │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PR Created   │ │ PR Approved  │ │ PR Rejected  │ │ PO Created   │
│ ──────────── │ │ ──────────── │ │ ──────────── │ │ ──────────── │
│ To: Super    │ │ To: Next     │ │ To: Engineer │ │ To: Super    │
│ Admin        │ │ Approver     │ │ (reason)     │ │ Admin        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              notifications TABLE (Database)                 │
│  - recipient_id  - title  - message  - type  - is_read      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              SOCKET.IO (Real-time Push)                     │
│                    OR                                       │
│              API Polling (Fallback)                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   USER NOTIFICATION BELL                    │
│              (Frontend Component)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. SERVICE REQUEST (SR) FLOW

```
┌─────────────────┐
│ Engineer        │
│ Creates SR      │
│ Status: PENDING │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Procurement     │ NO  │ Notify Engineer │
│ Reviews SR      │────>│ Status: REJECTED│
│ Approve?        │     │ (with reason)   │
└────────┬────────┘     └─────────────────┘
       YES │
         │
         ▼
┌─────────────────┐
│ Status: FOR     │
│ SUPPLIER QUOTE  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Admin Enters    │
│ Pricing Info    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Super Admin     │ NO  │ Return to Admin │
│ Final Approval  │────>│ for revision    │
│ Approve?        │     │                 │
└────────┬────────┘     └─────────────────┘
       YES │
         │
         ▼
┌─────────────────┐
│ Status:         │
│ APPROVED        │
│ Job Order to    │
│ Supplier        │
└─────────────────┘
```

---

## 8. CASH REQUEST (CR) FLOW

```
┌─────────────────┐
│ Employee        │
│ Creates CR      │
│ Status: PENDING │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Immediate       │ NO  │ Continue to     │
│ Need? (<3 days) │────>│ Normal Approval │
└────────┬────────┘     └────────┬────────┘
     YES │                       │
         │                       ▼
         │           ┌─────────────────┐
         │           │ Department Head │
         │           │ Review          │
         │           │ Approve?        │
         │           └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Immediate       │    │ Super Admin     │
│ Approval Path   │    │ Final Approval  │
│ (Expedited)     │    │                 │
└─────────────────┘    └─────────────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
            ┌─────────────────┐
            │ Finance         │
            │ Releases Cash   │
            │ Status: RELEASED│
            └─────────────────┘
                    │
                    ▼
            ┌─────────────────┐
            │ Employee        │
            │ Acknowledges    │
            │ Receipt         │
            │ Status: CLOSED  │
            └─────────────────┘
```

---

## Color Coding for Drawing (Optional)

| Component | Suggested Color |
|-----------|-----------------|
| User Roles | Blue |
| Status/Decisions | Yellow/Orange |
| Rejection/Error | Red |
| Success/Approval | Green |
| Database Tables | Gray |
| Flow Arrows | Black |
| Notifications | Purple |

---

## Tools to Draw This

1. **draw.io** (diagrams.net) - Free, web-based
2. **Lucidchart** - Professional, paid
3. **Miro** - Collaborative whiteboard
4. **Excalidraw** - Hand-drawn style
5. **Figma** - Design tool with flowchart plugins
6. **Whimsical** - Quick flowcharts
7. **Paper + Pen** - Always works!
