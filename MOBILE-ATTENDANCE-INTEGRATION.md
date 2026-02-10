# Mobile Attendance App Integration Guide

## Overview
This document outlines how your mobile attendance app will connect to **both** systems:
- **Old PHP API** - Continues handling all attendance functionality
- **New Procurement System (Node.js)** - Handles procurement-related features

Your mobile app will be extended to support procurement features while keeping existing attendance features connected to the old system.

## Integration Architecture

```
                         ┌─────────────────────┐
                         │    Mobile App       │
                         │  (Attendance +      │
                         │   Procurement)      │
                         └─────────────────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 │                 ▼
┌─────────────────────┐             │    ┌─────────────────────┐
│   PHP API (Old)     │             │    │  Procurement System │
│   Attendance System │◄────────────│    │    (Node.js)        │
│                     │  Attendance │    │                     │
│  - Check-in/out     │  Endpoints  │    │  - Purchase Requests│
│  - Attendance logs  │             │    │  - Purchase Orders  │
│  - Employee verify  │             │    │  - Items/Suppliers  │
└─────────────────────┘             │    │  - Approvals        │
                                    │    │  - Notifications    │
                                    │    └─────────────────────┘
                                               ▲
                                               │
                                        Procurement
                                        API Endpoints
```

## What Stays on Old System (PHP API)

Your mobile app **continues using** the existing PHP API for:

| Feature | PHP API Endpoint | Status |
|---------|-----------------|--------|
| Employee Check-in | `POST /api/attendance/check-in` | ✅ Keep |
| Employee Check-out | `POST /api/attendance/check-out` | ✅ Keep |
| Attendance History | `GET /api/attendance/{employee_id}` | ✅ Keep |
| Employee Verification | `GET /api/employees/verify/{code}` | ✅ Keep |
| Attendance Summary | `GET /api/attendance/summary` | ✅ Keep |
| Location/Geofencing | Existing endpoints | ✅ Keep |

## New Procurement API Endpoints (Node.js)

Your mobile app will **add new calls** to the Procurement System for:

### Engineer Role Endpoints

#### Browse Items
```
GET /api/items
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "item_code": "ITM001",
      "item_name": "Laptop Dell XPS 15",
      "description": "15.6 inch business laptop",
      "category_name": "IT Equipment",
      "unit": "pc"
    }
  ]
}
```

#### Create Purchase Request
```
POST /api/purchase-requests
Headers: Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "purpose": "IT equipment for new engineer",
  "remarks": "Urgent - starting next week",
  "items": [
    {
      "item_id": 1,
      "quantity": 2,
      "remarks": "For development team"
    },
    {
      "item_id": 5,
      "quantity": 1,
      "remarks": "Backup unit"
    }
  ]
}
```

#### View My Purchase Requests
```
GET /api/purchase-requests/my-requests
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "pr_number": "PR-2026-0015",
      "purpose": "IT equipment for new engineer",
      "status": "For Procurement Review",
      "created_at": "2026-02-10T08:30:00Z",
      "item_count": 2,
      "total_estimated": 150000.00
    }
  ]
}
```

#### View PR Details
```
GET /api/purchase-requests/{id}
Headers: Authorization: Bearer {token}
```

#### Mark Items as Received
```
PUT /api/purchase-requests/{id}/receive
Headers: Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "purchase_request_item_id": 23,
      "received": true
    },
    {
      "purchase_request_item_id": 24,
      "received": true
    }
  ]
}
```

### Notifications Endpoint

#### Get My Notifications
```
GET /api/notifications
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "PR Approved",
      "message": "Your PR #PR-2026-0015 has been approved by Super Admin",
      "type": "PR Approved",
      "is_read": false,
      "created_at": "2026-02-10T09:00:00Z"
    }
  ],
  "unread_count": 3
}
```

#### Mark Notification as Read
```
PUT /api/notifications/{id}/read
Headers: Authorization: Bearer {token}
```

### Authentication for Procurement API

Your mobile app needs to authenticate with the Procurement System using JWT tokens.

#### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "john.doe@company.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employee_code": "EMP001",
    "first_name": "John",
    "last_name": "Doe",
    "position": "Engineer",
    "email": "john.doe@company.com"
  }
}
```

**Token Usage:**
```
Authorization: Bearer {jwt_token}
```

## Mobile App Implementation

### Environment Configuration

Create a config file in your mobile app:

```javascript
// config/api.config.js
export const API_CONFIG = {
  // Old Attendance System (PHP)
  attendance: {
    baseURL: 'https://attendance.yourcompany.com/api',
    apiKey: 'your-attendance-api-key',
    timeout: 30000
  },
  
  // New Procurement System (Node.js)
  procurement: {
    baseURL: 'https://procurement.yourcompany.com/api',
    timeout: 30000
  }
};
```

### Service Layer Pattern

Create separate services for each API:

```javascript
// services/attendanceService.js
import { API_CONFIG } from '../config/api.config.js';

class AttendanceService {
  constructor() {
    this.baseURL = API_CONFIG.attendance.baseURL;
    this.apiKey = API_CONFIG.attendance.apiKey;
  }

  async checkIn(employeeCode, locationData) {
    const response = await fetch(`${this.baseURL}/attendance/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        employee_code: employeeCode,
        location: locationData.name,
        latitude: locationData.lat,
        longitude: locationData.lng,
        timestamp: new Date().toISOString()
      })
    });
    return await response.json();
  }

  async getAttendanceHistory(employeeCode, startDate, endDate) {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    const response = await fetch(
      `${this.baseURL}/attendance/${employeeCode}?${params}`,
      { headers: { 'X-API-Key': this.apiKey } }
    );
    return await response.json();
  }
}

export const attendanceService = new AttendanceService();
```

```javascript
// services/procurementService.js
import { API_CONFIG } from '../config/api.config.js';

class ProcurementService {
  constructor() {
    this.baseURL = API_CONFIG.procurement.baseURL;
    this.token = localStorage.getItem('procurement_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('procurement_token', token);
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) this.setToken(data.token);
    return data;
  }

  async getItems() {
    const response = await fetch(`${this.baseURL}/items`, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }

  async createPurchaseRequest(purpose, items, remarks = '') {
    const response = await fetch(`${this.baseURL}/purchase-requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ purpose, items, remarks })
    });
    return await response.json();
  }

  async getMyPurchaseRequests() {
    const response = await fetch(`${this.baseURL}/purchase-requests/my-requests`, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }
}

export const procurementService = new ProcurementService();
```

## API Endpoint Mapping

### Existing Attendance API (PHP) - KEEP USING

| Feature | Method | Endpoint | Auth |
|---------|--------|----------|------|
| Check In | POST | `/api/attendance/check-in` | API Key |
| Check Out | POST | `/api/attendance/check-out` | API Key |
| Daily Report | GET | `/api/attendance/daily/{date}` | API Key |
| Monthly Report | GET | `/api/attendance/monthly/{month}` | API Key |

### New Procurement API (Node.js) - ADD TO APP

| Feature | Method | Endpoint | Auth |
|---------|--------|----------|------|
| Login | POST | `/api/auth/login` | None |
| Browse Items | GET | `/api/items` | JWT |
| Create PR | POST | `/api/purchase-requests` | JWT |
| My PRs | GET | `/api/purchase-requests/my-requests` | JWT |
| Notifications | GET | `/api/notifications` | JWT |

## Deployment Checklist

- [ ] Add procurement API config to environment files
- [ ] Create `procurementService.js` service layer
- [ ] Add JWT token storage mechanism
- [ ] Create new UI screens for procurement features
- [ ] Handle network errors for both APIs independently

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Errors | Add mobile app domain to CORS whitelist in both backends |
| Auth Conflicts | Old API uses `X-API-Key`, New API uses `Authorization: Bearer` - keep separate! |
| Employee Not Found | Ensure `employee_code` matches in both systems |

## Next Steps

1. Provide your mobile app tech stack (React Native, Flutter, etc.)
2. Share existing PHP API base URL and auth method
3. Confirm procurement system base URL
4. Test single endpoint from mobile app
5. Add procurement UI screens to mobile app

---

**Document Version**: 1.1
**Created**: February 2026
**Last Updated**: February 2026
