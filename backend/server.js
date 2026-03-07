import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import db from './config/database.js';
import { initSocket } from './utils/socket.js';
import sanitizeInput from './middleware/sanitize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import prRoutes from './routes/purchaseRequests.js';
import poRoutes from './routes/purchaseOrders.js';
import serviceRequestRoutes from './routes/serviceRequests.js';
import cashRequestRoutes from './routes/cashRequests.js';
import reimbursementRoutes from './routes/reimbursements.js';
import supplierRoutes from './routes/suppliers.js';
import categoryRoutes from './routes/categories.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import employeeRoutes from './routes/employees.js';
import disbursementVoucherRoutes from './routes/disbursementVouchers.js';
import paymentRequestRoutes from './routes/paymentRequests.js';
import paymentOrdersRoutes from './routes/paymentOrders.js';
import pricingHistoryRoutes from './routes/pricingHistory.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate rate limiting behind Nginx
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = initSocket(httpServer);

// Middleware
const corsOptions = {
  origin: ['https://procurement.xandree.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security headers
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS sanitization middleware
app.use(sanitizeInput);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/purchase-requests', prRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/cash-requests', cashRequestRoutes);
app.use('/api/reimbursements', reimbursementRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/disbursement-vouchers', disbursementVoucherRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);
app.use('/api/payment-orders', paymentOrdersRoutes);
app.use('/api/pricing-history', pricingHistoryRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export { io };
