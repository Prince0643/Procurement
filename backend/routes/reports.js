import express from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Dashboard stats (super admin only)
router.get('/dashboard', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    // PR stats
    const [prStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'ordered' THEN 1 ELSE 0 END) as ordered,
        SUM(CASE WHEN status = 'partially_received' THEN 1 ELSE 0 END) as partially_received,
        SUM(CASE WHEN status = 'fully_received' THEN 1 ELSE 0 END) as fully_received
      FROM purchase_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // PO stats
    const [poStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(total_amount) as total_value,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
      FROM purchase_orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Top items requested
    const [topItems] = await db.query(`
      SELECT i.name, SUM(pri.quantity) as total_quantity
      FROM purchase_request_items pri
      JOIN items i ON pri.item_id = i.id
      JOIN purchase_requests pr ON pri.purchase_request_id = pr.id
      WHERE pr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY i.id
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

    // Department spending
    const [deptSpending] = await db.query(`
      SELECT 
        e.department,
        COUNT(pr.id) as request_count,
        SUM(pr.total_amount) as total_amount
      FROM purchase_requests pr
      JOIN employees e ON pr.requested_by = e.id
      WHERE pr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY e.department
      ORDER BY total_amount DESC
    `);

    res.json({
      purchaseRequests: prStats[0],
      purchaseOrders: poStats[0],
      topItems,
      departmentSpending: deptSpending
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Monthly spending report (super admin only)
router.get('/monthly-spending', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const [monthlyData] = await db.query(`
      SELECT 
        MONTH(created_at) as month,
        COUNT(*) as po_count,
        SUM(total_amount) as total_amount
      FROM purchase_orders
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      ORDER BY month
    `, [year]);

    res.json({ year, monthlyData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch monthly spending report' });
  }
});

// Supplier performance report (super admin only)
router.get('/supplier-performance', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [supplierData] = await db.query(`
      SELECT 
        s.name as supplier_name,
        COUNT(po.id) as order_count,
        SUM(po.total_amount) as total_amount,
        AVG(CASE WHEN po.status = 'delivered' THEN 1 ELSE 0 END) * 100 as fulfillment_rate
      FROM suppliers s
      JOIN purchase_orders po ON s.id = po.supplier_id
      WHERE po.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY s.id
      ORDER BY order_count DESC
    `);

    res.json({ suppliers: supplierData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch supplier performance report' });
  }
});

// Spending by Category (super admin only)
router.get('/spending-by-category', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [categoryData] = await db.query(`
      SELECT 
        c.category_name,
        COUNT(DISTINCT pr.id) as pr_count,
        SUM(pri.total_price) as total_amount
      FROM categories c
      JOIN items i ON i.category_id = c.id
      JOIN purchase_request_items pri ON pri.item_id = i.id
      JOIN purchase_requests pr ON pri.purchase_request_id = pr.id
      WHERE pr.status IN ('For Purchase', 'PO Created', 'Completed')
      GROUP BY c.id, c.category_name
      ORDER BY total_amount DESC
    `);

    res.json({ categories: categoryData });
  } catch (error) {
    console.error('Failed to fetch spending by category:', error);
    res.status(500).json({ message: 'Failed to fetch spending by category' });
  }
});

// Top Suppliers by spending (super admin only)
router.get('/top-suppliers', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [supplierData] = await db.query(`
      SELECT 
        s.supplier_name,
        COUNT(po.id) as order_count,
        SUM(po.total_amount) as total_amount
      FROM suppliers s
      JOIN purchase_orders po ON s.id = po.supplier_id
      WHERE po.status IN ('Ordered', 'Delivered')
      GROUP BY s.id, s.supplier_name
      ORDER BY total_amount DESC
      LIMIT 10
    `);

    res.json({ suppliers: supplierData });
  } catch (error) {
    console.error('Failed to fetch top suppliers:', error);
    res.status(500).json({ message: 'Failed to fetch top suppliers' });
  }
});

// PR Status Overview (super admin only)
router.get('/pr-status-overview', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [statusData] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM purchase_requests
      GROUP BY status
    `);

    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM purchase_requests');
    const total = totalResult[0].total;

    res.json({ 
      statusData,
      total
    });
  } catch (error) {
    console.error('Failed to fetch PR status overview:', error);
    res.status(500).json({ message: 'Failed to fetch PR status overview' });
  }
});

export default router;
