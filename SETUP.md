# Local Development Setup Guide

## Overview
This project uses Docker for the database and runs Node.js/React locally.

## Prerequisites
- Docker Desktop (Apple Silicon M1/M2/M3 recommended)
- Node.js & npm

## Quick Start

### 1. Start Docker Database
```bash
cd backend
docker compose up -d
```

### 2. Start Backend
```bash
cd backend
npm run dev
```
- Backend runs on: http://localhost:5000
- Database connected successfully when you see: "Database connected successfully"

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
- Frontend runs on: http://localhost:5173 (or similar)

## Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start MariaDB + Adminer |
| `docker compose down` | Stop containers (data persists) |
| `docker compose down -v` | Stop and DELETE all data |
| `docker ps` | View running containers |

## Accessing the Database

### Via Adminer (Web UI)
1. Open: http://localhost:8080
2. Login:
   - **System**: MySQL
   - **Server**: `db`
   - **Username**: `root`
   - **Password**: `root`
   - **Database**: `procurement_db`

### Via CLI
```bash
docker exec -it procurement_db mysql -u root -proot procurement_db
```

## Environment Variables (backend/.env)

```
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=procurement_db
```

## Troubleshooting

### Port 5000 already in use
- Check if AirPlay Receiver is using it: System Settings → General → AirDrop & Handoff → AirPlay Receiver → Turn off
- Or change PORT in .env to 5001

### Permission denied on nodemon
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Reset database
```bash
docker compose down -v
docker compose up -d
# Re-import SQL:
docker exec -i procurement_db mysql -u root -proot procurement_db < database/whole_sql_schema.sql
```
