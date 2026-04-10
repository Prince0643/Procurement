# Docker (VPS) Setup — Procurement System

This repo includes a production-focused Docker Compose stack:
- MariaDB (container)
- Backend API (Node/Express + Socket.IO)
- Frontend (static build served by Nginx)

It is designed to be reverse-proxied by **host Nginx** with SSL:
- Frontend: `https://procurement.xandree.com/`
- API: `https://procurement-api.xandree.com/` (serves `/api`, `/socket.io`, `/uploads`)

## 1) Configure env

On your VPS, copy and edit:

```bash
mkdir -p /opt/procurement
cp deploy/.env.prod.example /opt/procurement/.env.prod
vim /opt/procurement/.env.prod
```

## 2) Start containers

From the repo folder:

```bash
docker compose --env-file /opt/procurement/.env.prod up -d --build
```

The stack includes a one-shot `db_migrate` service that applies required production migrations
(including `payment_terms_code` fields) before backend startup.

Optional Adminer:

```bash
docker compose --env-file /opt/procurement/.env.prod --profile adminer up -d
```

## 3) Host Nginx

Copy the provided configs and adapt SSL paths as needed:
- `deploy/nginx-procurement.conf`
- `deploy/nginx-procurement-api.conf`

Reload Nginx after changes.

## 4) Verify

```bash
curl http://127.0.0.1:5000/api/health
```

Then verify in browser:
- `https://procurement.xandree.com/`
- `https://procurement-api.xandree.com/api/health`

## Notes
- DB data persists in Docker volume `db_data`.
- Uploads persist in Docker volume `backend_uploads`.
- The schema is imported automatically only on first DB initialization. If you delete the DB volume, it will re-import.
- To rerun migrations manually:
  ```bash
  docker compose --env-file /opt/procurement/.env.prod run --rm db_migrate
  ```
