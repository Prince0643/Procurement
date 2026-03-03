# Procurement System - Security & Optimization Review

**Review Date:** February 23, 2026  
**System:** JAJR Procurement Management System  
**Stack:** Node.js/Express (Backend), React/Vite (Frontend), MySQL

---

## Executive Summary

Your procurement system has a **solid foundation** with proper authentication and authorization, but has **critical security gaps** that need immediate attention. The most severe issue is the **complete absence of rate limiting**, making the system vulnerable to brute-force attacks and DoS.

### Risk Assessment: **HIGH**
- **Critical Issues:** 5
- **High Issues:** 4  
- **Medium Issues:** 6
- **Optimization Opportunities:** 8

---

## 1. Critical Security Issues (Fix Immediately)

### 1.1 NO RATE LIMITING - CRITICAL
**Location:** All API endpoints  
**OWASP Category:** API Security Top 10 #4 - Unrestricted Resource Consumption

**Problem:** No rate limiting on any endpoint. Attackers can:
- Brute-force login credentials
- DDoS the API
- Scrape all data
- Exhaust database connections

**Fix:**
```javascript
// Install: npm install express-rate-limit

import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

// Apply in server.js BEFORE routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

---

### 1.2 Hardcoded Backdoor Password - CRITICAL
**Location:** `backend/routes/auth.js:47-48` and `backend/routes/auth.js:201-203`

**Problem:**
```javascript
// Lines 47-48
if (password === 'password123') {
  isMatch = true;
}
```

This creates a universal backdoor. Any account can be accessed with password `password123`.

**Fix:** Remove immediately:
```javascript
// Remove the hardcoded password check entirely
let isMatch = await bcrypt.compare(password, user.password);
```

---

### 1.3 Weak JWT Secret - CRITICAL
**Location:** `backend/.env:8`, `backend/routes/auth.js:10`, `backend/middleware/auth.js:4`

**Problem:**
```
JWT_SECRET=your-secret-key-here-change-in-production
```

Default/weak secret allows attackers to forge JWT tokens.

**Fix:**
```bash
# Generate a strong secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
JWT_SECRET=your_generated_64_char_random_string
```

---

### 1.4 No Security Headers - HIGH
**Location:** `backend/server.js`

**Problem:** Missing security headers (XSS protection, clickjacking protection, etc.)

**Fix:**
```javascript
// Install: npm install helmet
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "/uploads"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

---

### 1.5 No HTTPS Enforcement - HIGH
**Location:** `backend/server.js`

**Problem:** No redirect from HTTP to HTTPS in production.

**Fix:**
```javascript
// Add in server.js, before routes
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 2. Security Issues (Fix Soon)

### 2.1 Path Traversal in File Deletion - HIGH
**Location:** `backend/routes/purchaseOrders.js:525-531`

**Problem:**
```javascript
const filePath = path.resolve(__dirname, '..', relativePath);
```

Path traversal could allow deleting arbitrary files.

**Fix:**
```javascript
import path from 'path';

const uploadsDir = path.resolve(__dirname, '../uploads/receipts');
const filePath = path.resolve(uploadsDir, path.basename(attachment.file_path));

// Verify file is within uploads directory
if (!filePath.startsWith(uploadsDir)) {
  return res.status(400).json({ message: 'Invalid file path' });
}
```

---

### 2.2 No Input Sanitization for XSS - MEDIUM
**Location:** All routes accepting text input

**Problem:** User inputs stored in database may contain XSS payloads.

**Fix:**
```javascript
// Install: npm install xss
import xss from 'xss';

// Sanitize inputs before storing
const sanitizedPurpose = xss(req.body.purpose);
```

Or add a middleware:
```javascript
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      }
    }
  };
  if (req.body) sanitize(req.body);
  next();
};
```

---

### 2.3 No CSRF Protection - MEDIUM
**Location:** All state-changing endpoints

**Problem:** No CSRF tokens for form submissions.

**Fix:** Since you use JWT in headers (not cookies), you're already protected. But if you switch to cookie-based auth:
```javascript
// Install: npm install csurf
import csurf from 'csurf';
app.use(csurf({ cookie: true }));
```

---

### 2.4 Plaintext Password Fallback - MEDIUM
**Location:** `backend/routes/auth.js:50-60`

**Problem:** System allows plaintext password comparison as fallback.

**Fix:** Remove plaintext comparison, force bcrypt only:
```javascript
// Remove this block:
if (!isMatch) {
  isMatch = password === user.password;  // DELETE THIS
}
```

---

### 2.5 Missing Request Size Limits - MEDIUM
**Location:** `backend/server.js`

**Problem:** JSON body parser has no size limit.

**Fix:**
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 3. What's Working Well

**Good Security Practices Found:**
- ✅ Parameterized queries (SQL injection prevented)
- ✅ Password hashing with bcrypt (when not bypassed)
- ✅ JWT-based authentication with expiration
- ✅ Role-based authorization (RBAC)
- ✅ Input validation with express-validator
- ✅ File upload type restrictions
- ✅ Transaction handling for database operations
- ✅ CORS properly configured

---

## 4. Optimization Opportunities

### 4.1 Database Performance - HIGH PRIORITY

**Missing Indexes:**
```sql
-- Add these indexes for common queries
ALTER TABLE purchase_requests ADD INDEX idx_status (status);
ALTER TABLE purchase_requests ADD INDEX idx_requested_by (requested_by);
ALTER TABLE purchase_requests ADD INDEX idx_created_at (created_at);
ALTER TABLE purchase_orders ADD INDEX idx_status (status);
ALTER TABLE notifications ADD INDEX idx_user_id (user_id, is_read);
```

---

### 4.2 Add Caching - MEDIUM PRIORITY

**Implement Redis caching:**
```javascript
// Install: npm install ioredis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache expensive queries
const cacheMiddleware = (duration = 300) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  res.sendResponse = res.json;
  res.json = (body) => {
    redis.setex(key, duration, JSON.stringify(body));
    res.sendResponse(body);
  };
  next();
};
```

---

### 4.3 Frontend Bundle Size - MEDIUM PRIORITY

**Problem:** `App.jsx` is 353KB - needs code splitting.

**Fix:**
```javascript
// Use React.lazy for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PurchaseRequests = React.lazy(() => import('./pages/PurchaseRequests'));

// Add loading states
<Suspense fallback={<Loading />}>
  <Routes>...</Routes>
</Suspense>
```

---

### 4.4 Add Request Compression - MEDIUM PRIORITY

```javascript
// Install: npm install compression
import compression from 'compression';
app.use(compression());
```

---

### 4.5 Implement Proper Logging - MEDIUM PRIORITY

Replace `console.log` with structured logging:
```javascript
// Install: npm install winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use: logger.info('User logged in', { userId: 123 });
```

---

### 4.6 Add Database Connection Pool Monitoring - LOW PRIORITY

```javascript
// Monitor connection pool in database.js
pool.on('acquire', (connection) => {
  console.log('Connection %d acquired', connection.threadId);
});

pool.on('enqueue', () => {
  console.log('Waiting for available connection slot');
});
```

---

## 5. Action Plan (Priority Order)

### Week 1: Critical Security
1. [ ] Install and configure `express-rate-limit`
2. [ ] Remove hardcoded `password123` backdoor
3. [ ] Generate and deploy strong JWT_SECRET
4. [ ] Install and configure `helmet`
5. [ ] Add HTTPS redirect for production

### Week 2: Security Hardening
6. [ ] Fix path traversal vulnerability in file deletion
7. [ ] Add XSS sanitization middleware
8. [ ] Remove plaintext password fallback
9. [ ] Add request size limits
10. [ ] Security audit and penetration testing

### Week 3: Performance
11. [ ] Add database indexes
12. [ ] Implement Redis caching for reports
13. [ ] Add response compression
14. [ ] Set up structured logging with Winston

### Week 4: Frontend & Monitoring
15. [ ] Code split App.jsx into smaller components
16. [ ] Add database connection pool monitoring
17. [ ] Set up error tracking (Sentry)
18. [ ] Add API response time monitoring

---

## 6. Dependencies to Install

```bash
# Security
cd backend && npm install express-rate-limit helmet xss compression

# Performance & Caching
npm install ioredis

# Logging
npm install winston

# Monitoring (optional)
npm install @sentry/node
```

---

## 7. Environment Variables to Add

```bash
# Add to backend/.env
JWT_SECRET=<generate-64-char-random-string>
NODE_ENV=production
REDIS_URL=redis://localhost:6379

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# File uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## 8. Files Modified

Based on this review, you'll need to modify:

| File | Changes |
|------|---------|
| `backend/server.js` | Add rate limiting, helmet, compression, HTTPS redirect |
| `backend/routes/auth.js` | Remove backdoor password, remove plaintext fallback |
| `backend/middleware/auth.js` | No changes needed (working well) |
| `backend/routes/purchaseOrders.js` | Fix path traversal vulnerability |
| `backend/.env` | Update JWT_SECRET, add new env vars |
| `backend/package.json` | Add new dependencies |
| Database | Add indexes |
| Frontend | Code split App.jsx |

---

## Summary

**Immediate Actions Required:**
1. Fix the `password123` backdoor - **CRITICAL**
2. Implement rate limiting - **CRITICAL**  
3. Change JWT_SECRET - **CRITICAL**
4. Add security headers - **HIGH**

Your authentication and authorization logic is solid. The main issues are around rate limiting, hardcoded credentials, and missing security headers. Address the critical items first, then move on to optimizations.

**Estimated effort:** 1-2 weeks for security fixes, 2-3 weeks for full optimization.
