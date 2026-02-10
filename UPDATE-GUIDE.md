# Procurement System - Update & Maintenance Guide

This guide covers how to update the frontend, backend, and database on your Hostinger KVM2 VPS after the initial deployment.

---

## Table of Contents
1. [Quick Update (Frontend + Backend Only)](#quick-update)
2. [Full Update Guide](#full-update-guide)
3. [Database Schema Updates](#database-schema-updates)
4. [Rollback Procedures](#rollback-procedures)
5. [Troubleshooting](#troubleshooting)

---

## Quick Update (Frontend + Backend Only)

Use this when you've only changed code (not database schema):

```bash
# SSH into your VPS
ssh root@srv1313830

# Go to project directory
cd /var/www/procurement_system

# Pull latest code
git pull origin main

# Update and restart backend
cd /var/www/procurement_system/backend
npm install
pm2 restart procurement-api

# Update and rebuild frontend
cd /var/www/procurement_system/frontend
npm install
npm run build

# Verify backend is running
pm2 status

# Test API
curl -i http://127.0.0.1:5000/api/health
```

---

## Full Update Guide

### Step 1: SSH into VPS
```bash
ssh root@srv1313830
```

### Step 2: Navigate to Project
```bash
cd /var/www/procurement_system
```

### Step 3: Check Current Status (Before Update)
```bash
# Check PM2 status
pm2 status

# Check git status
git status

# Check last commit
git log --oneline -3
```

### Step 4: Backup (Optional but Recommended)
```bash
# Create a backup branch
git branch backup-$(date +%Y%m%d)

# Backup database (if making DB changes)
mysqldump -u procurement_app -p procurement_db > /root/procurement_db_backup_$(date +%F).sql
```

### Step 5: Pull Latest Code
```bash
# Stash any local changes (if any)
git stash

# Pull from GitHub
git pull origin main

# Check what changed
git log --oneline -5
```

---

## Backend Update

### Step 6: Update Backend Dependencies
```bash
cd /var/www/procurement_system/backend
npm install
```

### Step 7: Update Backend Environment (if needed)
```bash
# Check if .env.example changed
git diff HEAD~1 .env.example

# If new env vars were added, update your .env
nano .env
```

### Step 8: Restart Backend
```bash
# Restart with PM2
pm2 restart procurement-api

# Or stop and start fresh
pm2 stop procurement-api
pm2 start server.js --name procurement-api

# Verify it's running
pm2 status
pm2 logs procurement-api --lines 20
```

### Step 9: Test Backend Locally
```bash
# Test health endpoint
curl -i http://127.0.0.1:5000/api/health

# Test login (replace with real credentials)
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_no":"ENG-2026-0001","password":"jajrconstruction"}'
```

---

## Frontend Update

### Step 10: Update Frontend Dependencies
```bash
cd /var/www/procurement_system/frontend
npm install
```

### Step 11: Update Frontend Environment (if needed)
```bash
# Check if .env.production needs updates
git diff HEAD~1 .env.production

# Update if needed
nano .env.production
```

### Step 12: Rebuild Frontend
```bash
# Clean old build (optional)
rm -rf dist

# Build for production
npm run build

# Verify dist folder exists and has files
ls -la dist/
```

### Step 13: Test Frontend in Browser
- Open: `https://procurement.xandree.com`
- Check login works
- Check no console errors

---

## Database Schema Updates

⚠️ **WARNING:** Always backup database before schema changes!

### Option A: Using SQL Migration Files

```bash
# Backup first
mysqldump -u procurement_app -p procurement_db > /root/procurement_db_backup_$(date +%F).sql

# Apply migration (example: adding a new table)
mysql -u procurement_app -p procurement_db < /var/www/procurement_system/dbschema/migrations/001_add_new_table.sql
```

### Option B: Using Full Schema Dump (Nuclear Option)

⚠️ **WARNING:** This deletes ALL data and recreates from scratch!

```bash
# Backup current data
mysqldump -u procurement_app -p procurement_db > /root/procurement_db_backup_$(date +%F).sql

# Disable foreign key checks and reimport
cd /var/www/procurement_system
mysql -u procurement_app -p -e "SET FOREIGN_KEY_CHECKS = 0;"
mysql -u procurement_app -p procurement_db < dbschema/procurement_db.sql
mysql -u procurement_app -p -e "SET FOREIGN_KEY_CHECKS = 1;"
```

### Option C: Manual Schema Changes

```bash
# Log into MySQL
mysql -u procurement_app -p procurement_db

# Inside MySQL, run your ALTER statements
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
ALTER TABLE purchase_requests ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium';

# Exit
EXIT;
```

### Verify Database After Changes
```bash
mysql -u procurement_app -p procurement_db -e "SHOW TABLES;"
mysql -u procurement_app -p procurement_db -e "DESCRIBE employees;"
```

---

## Complete Update Script (Copy-Paste Ready)

Save this as `/root/update-procurement.sh`:

```bash
#!/bin/bash
set -e

echo "=== Procurement System Update Script ==="
echo "Started at: $(date)"

# Backup database
echo "[1/8] Backing up database..."
mysqldump -u procurement_app -p'YOUR_DB_PASSWORD' procurement_db > /root/procurement_db_backup_$(date +%F).sql

# Update code
echo "[2/8] Pulling latest code..."
cd /var/www/procurement_system
git pull origin main

# Update backend
echo "[3/8] Updating backend..."
cd /var/www/procurement_system/backend
npm install

# Update frontend
echo "[4/8] Updating frontend..."
cd /var/www/procurement_system/frontend
npm install
npm run build

# Restart backend
echo "[5/8] Restarting backend..."
pm2 restart procurement-api

# Test backend
echo "[6/8] Testing backend..."
sleep 2
curl -s http://127.0.0.1:5000/api/health | grep -q '"status":"OK"' && echo "Backend OK" || echo "Backend ERROR"

# Reload Nginx
echo "[7/8] Reloading Nginx..."
nginx -t && systemctl reload nginx

# Final status
echo "[8/8] Final status check..."
pm2 status
echo "Update completed at: $(date)"
echo "Frontend: https://procurement.xandree.com"
echo "API: https://procurement-api.xandree.com"
```

Make it executable and run:
```bash
chmod +x /root/update-procurement.sh
/root/update-procurement.sh
```

---

## Rollback Procedures

### Rollback Code
```bash
cd /var/www/procurement_system

# View recent commits
git log --oneline -10

# Revert to previous commit
git reset --hard HEAD~1

# Or checkout specific commit
git checkout abc1234

# Then restart services
cd backend && pm2 restart procurement-api
cd ../frontend && npm run build
```

### Rollback Database
```bash
# Restore from backup
mysql -u procurement_app -p procurement_db < /root/procurement_db_backup_YYYY-MM-DD.sql

# Restart backend after restore
pm2 restart procurement-api
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs procurement-api --lines 50

# Check if port is already in use
netstat -tlnp | grep 5000

# Kill process on port 5000 if needed
fuser -k 5000/tcp

# Restart
pm2 restart procurement-api
```

### Frontend Shows Old Version
```bash
# Clear browser cache (Ctrl+Shift+R)
# Or force rebuild
cd /var/www/procurement_system/frontend
rm -rf dist node_modules/.vite
npm run build
```

### Database Connection Errors
```bash
# Test DB connection
mysql -u procurement_app -p -e "SELECT 1;"

# Check backend .env
cat /var/www/procurement_system/backend/.env

# Verify MySQL is running
systemctl status mariadb
systemctl restart mariadb
```

### Permission Issues
```bash
# Fix permissions
chown -R www-data:www-data /var/www/procurement_system
chmod -R 755 /var/www/procurement_system
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Check backend status | `pm2 status` |
| View backend logs | `pm2 logs procurement-api --lines 50` |
| Restart backend | `pm2 restart procurement-api` |
| Test API locally | `curl http://127.0.0.1:5000/api/health` |
| Test API via HTTPS | `curl https://procurement-api.xandree.com/api/health` |
| Rebuild frontend | `cd /var/www/procurement_system/frontend && npm run build` |
| Backup database | `mysqldump -u procurement_app -p procurement_db > backup.sql` |
| Reload Nginx | `nginx -t && systemctl reload nginx` |

---

## Important Notes

1. **Always backup database** before major updates
2. **Test on staging first** if possible
3. **Update during low-traffic hours** if system is in use
4. **Keep GitHub repo in sync** with your local development
5. **Monitor PM2 logs** after restart for any errors

---

**Last Updated:** 2026-02-10
**Domains:** procurement.xandree.com, procurement-api.xandree.com
**VPS:** srv1313830 (Hostinger KVM2)
