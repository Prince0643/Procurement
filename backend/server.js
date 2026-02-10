import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import prRoutes from './routes/purchaseRequests.js';
import poRoutes from './routes/purchaseOrders.js';
import supplierRoutes from './routes/suppliers.js';
import categoryRoutes from './routes/categories.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import employeeRoutes from './routes/employees.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://procurement.xandree.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/employees', employeeRoutes);

// Error handling middleware
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
