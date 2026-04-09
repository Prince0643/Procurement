# Deploy Update Runbook (Docker + Host Nginx)

This runbook updates the Procurement System on the VPS where:
- Frontend: `https://procurement.xandree.com`
- API: `https://procurement-api.xandree.com`
- Docker Compose stack runs MariaDB + backend + frontend
- Host Nginx terminates SSL and proxies to Docker ports on localhost

## Variables (edit only if your paths differ)

```bash
REPO_DIR=/var/www/procurement_system
ENV_FILE=/opt/procurement/.env.prod

FRONTEND_URL=https://procurement.xandree.com
API_URL=https://procurement-api.xandree.com

# Local API bind (VPS localhost -> Docker backend)
API_LOCAL=http://127.0.0.1:5050

COMPOSE="docker compose --env-file $ENV_FILE"
```

## 0) Pre-flight checks

```bash
cd "$REPO_DIR" || exit 1

# Confirm env file exists
test -f "$ENV_FILE" && echo "OK: env file exists" || (echo "Missing $ENV_FILE" && exit 1)

# Confirm docker is running
docker ps >/dev/null

# Confirm current services state
$COMPOSE ps
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

## 1) Pull latest code

```bash
cd "$REPO_DIR" || exit 1
git fetch --all --prune
git status
git pull
```

## 2) Rebuild + restart containers

```bash
cd "$REPO_DIR" || exit 1

# Standard update (keeps volumes)
$COMPOSE up -d --build

# If ports/config changed and containers need recreation:
# $COMPOSE up -d --build --force-recreate
docker compose --env-file /opt/procurement/.env.prod up -d --build
```

## 2.1) Frontend-only rebuild (when UI changes)

Use this when only the React UI changed (faster than rebuilding everything).

```bash
cd "$REPO_DIR" || exit 1

# Force a fresh frontend build (avoid stale cached layers)
$COMPOSE build --no-cache frontend

# IMPORTANT: `build` only creates a new image; it does NOT update the running container.
# Recreate the running frontend container to pick up the new image:
$COMPOSE up -d --force-recreate frontend
```

## 2.2) Verify the deployed frontend is the latest build (quick check)

This is useful when production seems to be missing new UI (e.g., search/filters not showing).

```bash
# Fetch index.html (bust caches)
INDEX_HTML=$(curl -fsSL -H "Cache-Control: no-cache" "$FRONTEND_URL/?v=$(date +%s)")

# Extract the main JS asset (Vite typically emits /assets/index-*.js)
ASSET_PATH=$(echo "$INDEX_HTML" | grep -oE '/assets/index-[^"]+\.js' | head -n 1)
echo "Asset: $ASSET_PATH"

# The PR page is code-split, so verify the PR chunk (not only index-*.js)
INDEX_JS=$(curl -fsSL -H "Cache-Control: no-cache" "$FRONTEND_URL$ASSET_PATH")
PR_CHUNK=$(echo "$INDEX_JS" | tr ',' '\n' | grep -oE 'assets/PurchaseRequests-[^"]+\.js' | head -n 1)
echo "PR chunk: $PR_CHUNK"

# Confirm the PR chunk contains expected UI strings (use -q to avoid dumping large JS)
curl -fsSL -H "Cache-Control: no-cache" "$FRONTEND_URL/$PR_CHUNK" | grep -qF "Search PR number, project, requester, supplier" \
  && echo "OK: PR filters/search present in deployed PR chunk"
```

## 3) Health checks

```bash
# Local (VPS)
curl -fsS "$API_LOCAL/api/health" && echo

# Public
curl -fsS "$API_URL/api/health" && echo
curl -I "$FRONTEND_URL" | head -n 5
```

## 4) Logs (debug)

```bash
cd "$REPO_DIR" || exit 1

# Backend logs
$COMPOSE logs -f --tail=200 backend

# DB logs
# $COMPOSE logs -f --tail=200 db

# Frontend logs (usually quiet; Nginx)
# $COMPOSE logs -f --tail=200 frontend
```

## 5) Rollback (fast)

```bash
cd "$REPO_DIR" || exit 1

# See recent commits
git log -n 20 --oneline

# Roll back to a known-good commit
# Replace <GOOD_COMMIT_SHA>
git reset --hard <GOOD_COMMIT_SHA>

# Rebuild/recreate services to match rollback
$COMPOSE up -d --build --force-recreate

# Re-run health checks
curl -fsS "$API_URL/api/health" && echo
```

## 6) Database backup (recommended before risky changes)

This backs up the DB from the MariaDB container to a file on the VPS.

```bash
set -a
. "$ENV_FILE"
set +a

mkdir -p "$REPO_DIR/backups"
TS=$(date +"%Y%m%d_%H%M%S")

# Uses MYSQL_ROOT_PASSWORD from env file
docker exec -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" procurement_db \
  mysqldump -u root --databases procurement_db > "$REPO_DIR/backups/procurement_db_$TS.sql"

ls -lh "$REPO_DIR/backups/procurement_db_$TS.sql"
```

## 7) Database restore (dangerous)

Restores from a backup file into the running DB container.

```bash
set -a
. "$ENV_FILE"
set +a

# Replace with your backup filename
BACKUP_FILE="$REPO_DIR/backups/procurement_db_<TS>.sql"

test -f "$BACKUP_FILE" || (echo "Missing $BACKUP_FILE" && exit 1)

cat "$BACKUP_FILE" | docker exec -i -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" procurement_db \
  mysql -u root
```

## 8) Apply SQL patch/migration manually

The init SQL only runs on first DB volume creation. Apply patches like `dbschema/*.sql` manually:

```bash
set -a
. "$ENV_FILE"
set +a

cd "$REPO_DIR" || exit 1

# Replace <PATH_TO_SQL>
SQL_FILE="<PATH_TO_SQL>"
test -f "$SQL_FILE" || (echo "Missing $SQL_FILE" && exit 1)

cat "$SQL_FILE" | docker exec -i -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" procurement_db \
  mysql -u root procurement_db
```

## 9) Uploads backup (attachments)

Uploads persist in Docker volume `backend_uploads`. Quick backup using tar:

```bash
mkdir -p "$REPO_DIR/backups"
TS=$(date +"%Y%m%d_%H%M%S")

docker run --rm \
  -v procurement_system_backend_uploads:/data:ro \
  -v "$REPO_DIR/backups:/backup" \
  alpine sh -lc "tar -czf /backup/backend_uploads_$TS.tgz -C /data ."

ls -lh "$REPO_DIR/backups/backend_uploads_$TS.tgz"
```

## 10) Nginx reload (after config changes)

```bash
nginx -t && systemctl reload nginx
```

## Common failures

### 502 Bad Gateway after stopping PM2
- Nginx is still proxying to the old PM2 port.
- Fix: update `/etc/nginx/sites-available/procurement-api` upstream to the Docker port (e.g. `127.0.0.1:5050`) and reload Nginx.

### “port already allocated” on `docker compose up`
- The host port is already in use (maybe an old PM2 service).
- Fix: change the host bind port in `docker-compose.yml` or stop the conflicting service.

## Notes: What to run locally vs on the VPS

Local (your laptop):

```bash
git add -A
git commit -m "..."
git push
```

VPS (server):

```bash
cd /var/www/procurement_system
git pull
docker compose --env-file /opt/procurement/.env.prod up -d --build
```
