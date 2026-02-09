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

// Pending approvals count (super admin only)
router.get('/pending-approvals', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) as count FROM purchase_requests WHERE status = 'pending'"
    );
    res.json({ pendingCount: result[0].count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
});

export default router;
