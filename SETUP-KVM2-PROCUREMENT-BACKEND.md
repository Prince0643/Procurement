# Procurement System Setup (Hostinger KVM 2)

This guide explains how to host the Procurement System **on your existing Hostinger KVM 2 VPS** while keeping it isolated from your existing Attendance Monitoring System.

Goal:
- Run both systems on the same VPS
- Use **a separate database** for procurement (recommended)
- Reuse employee data from the attendance system safely

---

## 1) High-level architecture

- **VPS**: Hostinger KVM 2 (same server)
- **Web server**: Nginx or Apache (either is fine)
- **Backend API**: Node.js (Express) for procurement
- **Frontend**: React (Vite) build served as static files (or via Nginx)
- **Database**: MySQL/MariaDB

Recommended separation:
- Attendance system DB: `attendance_db` (existing)
- Procurement system DB: `procurement_db` (new)

---

## 2) Create a separate database for procurement

Log in to MySQL on the VPS:

```sql
-- create procurement database
CREATE DATABASE procurement_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## 3) Create a dedicated DB user for the procurement backend

Create a MySQL user that can only access `procurement_db`:

```sql
-- replace 'strong_password_here' with a strong password
CREATE USER 'procurement_app'@'localhost' IDENTIFIED BY 'strong_password_here';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, CREATE, ALTER, INDEX, REFERENCES
ON procurement_db.* TO 'procurement_app'@'localhost';

FLUSH PRIVILEGES;
```

Notes:
- Keep this user **separate** from whatever the attendance app uses.
- Use `localhost` when the backend runs on the same VPS.

---

## 4) Reusing the `employees` table (your key decision)

You have **two good approaches**. I recommend Option A for most teams.

### Option A (Recommended): Copy/sync employees into procurement_db

You keep `employees` in `attendance_db` as the source of truth, and replicate the minimal employee fields into `procurement_db.employees`.

Pros:
- No cross-database dependencies
- Safer (attendance schema changes won’t immediately break procurement)
- Easier migrations/backups

Cons:
- Requires syncing (manual, cron, or API-based)

How to do it (simple starting point):

1) Create `procurement_db.employees` (structure can be minimal)
2) Sync periodically from `attendance_db.employees`

Example sync (manual):

```sql
-- one-time initial copy (pick columns you need)
CREATE TABLE procurement_db.employees AS
SELECT id, employee_no, first_name, last_name, department, position
FROM attendance_db.employees;
```

Then for ongoing updates, you can:
- Run a scheduled job (cron) that upserts changed rows, or
- Expose an attendance API endpoint the procurement backend calls nightly

If you want, I can propose a clean, low-risk sync strategy once you tell me:
- Which columns exist in your `attendance_db.employees`
- Whether employee IDs are stable

### Option B (Advanced): Reference attendance_db.employees directly

There are two sub-options:

#### B1) Use queries that join across databases (no foreign key)

Your procurement tables store `employee_id` (same ID as attendance), and your queries read employee data like:

```sql
SELECT pr.id, pr.status, e.first_name, e.last_name
FROM procurement_db.purchase_requests pr
JOIN attendance_db.employees e ON e.id = pr.employee_id
WHERE pr.id = 123;
```

Pros:
- No data duplication

Cons:
- Procurement is tightly coupled to attendance DB availability and schema

#### B2) Cross-database foreign key (usually NOT recommended)

MySQL supports FKs only when both tables are InnoDB, but **cross-schema FK management can be fragile operationally** (migrations, permissions, dumps/restores).

If you still want this, you must ensure:
- Both schemas use InnoDB
- The procurement DB user has the needed `REFERENCES` privileges
- Backups/restores are planned carefully

---

## 5) Import procurement schema into procurement_db

You already have SQL schema files in `dbschema/`.

Typical flow:
1) Ensure all `CREATE TABLE ...` statements target the new database (or `USE procurement_db;` at the top).
2) Import in correct dependency order:
   - `categories`, `items`, `suppliers`, `supplier_items`
   - `purchase_requests`, `purchase_request_items`
   - `purchase_orders`, `purchase_order_items`
   - `notifications`, `activity_logs`

Important:
- If you choose **Option A**, create `procurement_db.employees` and reference it.
- If you choose **Option B**, procurement tables can store `employee_id` without an FK.

---

## 6) Backend environment variables (Node/Express)

On the VPS, your procurement backend will need DB credentials.

Example `.env` values:

```bash
NODE_ENV=production
PORT=4000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=procurement_db
DB_USER=procurement_app
DB_PASSWORD=strong_password_here

# if you want to read attendance DB directly (Option B)
ATTENDANCE_DB_NAME=attendance_db
```

Security notes:
- Don’t commit `.env` to git.
- Limit MySQL user privileges to only what is needed.

---

## 7) Hosting on the same VPS (Nginx/Apache)

Recommended URL layout:
- Attendance: `https://yourdomain.com/attendance/` (existing)
- Procurement frontend: `https://yourdomain.com/procurement/`
- Procurement API: `https://yourdomain.com/procurement-api/`

This can be done with:
- Static hosting for the built React frontend
- Reverse proxy from web server to Node/Express API

---

## 8) Process management for the backend

Use a process manager so your API restarts automatically:
- `pm2` (common for Node)
- or `systemd`

Keep logs separated:
- Attendance logs (existing)
- Procurement API logs

---

## 9) Backups

Do backups per database:
- Backup `attendance_db` (existing schedule)
- Backup `procurement_db` (new schedule)

If you use Option B (direct reads), plan restores carefully because procurement depends on attendance.

---

## 10) What I need from you to finalize the “employees” approach

Reply with:
- The name of your attendance database (exact)
- Your `employees` primary key (`id`? `employee_id`?)
- Do you want procurement to work even if the attendance system is down?

Then I’ll tell you exactly which option (A or B) is best for your case and how to implement it cleanly.
