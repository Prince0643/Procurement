# Procurement System - Production Update Guide (Docker Only)

This runbook is the single source of truth for production updates on `srv1313830`.

Architecture:
- Host Nginx (SSL + reverse proxy)
- Docker Compose services:
  - `db` (MariaDB)
  - `db_migrate` (one-shot migrations)
  - `backend` (Node API on container port `5000`)
  - `frontend` (Nginx static site)
  - `adminer` (optional, profile-based)

Domains:
- Frontend: `https://procurement.xandree.com`
- API: `https://procurement-api.xandree.com`

## 1) Standard Update

```bash
ssh root@srv1313830
cd /var/www/procurement_system

# If local changes exist:
git stash push -m "vps-local"

git pull origin main

# Rebuild and restart stack
docker compose --env-file /opt/procurement/.env.prod up -d --build
```

Health checks:
```bash
docker compose --env-file /opt/procurement/.env.prod ps
curl -i http://127.0.0.1:5000/api/health
curl -i https://procurement-api.xandree.com/api/health
```

## 2) Database Migrations

Run migrations explicitly (safe for repeated runs):
```bash
cd /var/www/procurement_system
docker compose --env-file /opt/procurement/.env.prod run --rm db_migrate
```

Check migration logs:
```bash
docker compose --env-file /opt/procurement/.env.prod logs --no-color db_migrate
```

Verify payment-terms columns:
```bash
docker exec -i procurement_db mysql -uroot -p'YOUR_ROOT_PASSWORD' procurement_db -e \
"SHOW COLUMNS FROM purchase_requests LIKE 'payment_terms_code';"
```

## 3) Full Restart (Keep Data)

Use this when services are unhealthy:
```bash
cd /var/www/procurement_system
docker compose --env-file /opt/procurement/.env.prod down
docker compose --env-file /opt/procurement/.env.prod up -d db
docker compose --env-file /opt/procurement/.env.prod run --rm db_migrate
docker compose --env-file /opt/procurement/.env.prod up -d backend frontend
```

Do not run this unless you intend to wipe DB data:
```bash
docker compose down -v
```

## 4) Logs and Debug Commands

```bash
docker compose --env-file /opt/procurement/.env.prod logs --tail=100 backend
docker compose --env-file /opt/procurement/.env.prod logs --tail=100 db
docker compose --env-file /opt/procurement/.env.prod logs --tail=100 db_migrate
docker compose --env-file /opt/procurement/.env.prod logs --tail=100 frontend
```

Confirm backend listening:
```bash
ss -ltnp | grep 5000
```

Confirm containers:
```bash
docker ps | grep -E "procurement_(db|backend|frontend|db_migrate|adminer)"
```

## 5) Adminer (Optional, SSH Tunnel)

Start Adminer:
```bash
cd /var/www/procurement_system
docker compose --env-file /opt/procurement/.env.prod up -d db adminer
```

On local machine:
```bash
ssh -N -L 18082:127.0.0.1:8082 root@72.62.254.60
```

Open:
- `http://127.0.0.1:18082`

Adminer login:
- System: `MySQL`
- Server: `db`
- Username: `root` (or app user)
- Password: from `/opt/procurement/.env.prod`
- Database: `procurement_db`

## 6) Required Production Config

Compose env file path:
- `/opt/procurement/.env.prod`

Must include:
```env
MYSQL_ROOT_PASSWORD=...
MYSQL_USER=procurement_app
MYSQL_PASSWORD=...
JWT_SECRET=...
VITE_API_URL=https://procurement-api.xandree.com/api
CORS_ALLOWED_ORIGINS=https://procurement.xandree.com
```

Backend DB config in Docker Compose must remain:
- `DB_HOST=db`
- `DB_PORT=3306`
- `DB_NAME=procurement_db`

## 7) Nginx Upstream Expectations

Host Nginx API site must proxy to:
- `http://127.0.0.1:5000` for `/api/`
- `http://127.0.0.1:5000` for `/socket.io/`
- `http://127.0.0.1:5000/uploads/` for uploads

After Nginx changes:
```bash
nginx -t && systemctl reload nginx
```

## 8) Common Failure Patterns

`502 Bad Gateway` on API:
- Backend container not running or failed to start.
- Check `docker compose ... ps` and backend logs.

`db_migrate` exits with error:
- Read migration logs and run migration manually.
- Keep backend available by starting `backend` after schema fix.

`Unknown column payment_terms_code`:
- Migration not applied to current DB volume.
- Run `db_migrate` and verify with `SHOW COLUMNS`.

`git pull` blocked by local edits:
```bash
git stash push -m "vps-local"
git pull origin main
git stash pop
```

---

Last Updated: 2026-04-10  
Mode: Docker production only (no PM2 runbook)
