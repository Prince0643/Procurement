import express from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all order numbers with their project info
router.get('/', authenticate, async (req, res) => {
  try {
    // Get distinct order numbers from the 4 source tables with their project info
    // Using COLLATE to ensure consistent collation across all UNION operations
    const query = `
      SELECT DISTINCT 
        COALESCE(pr.order_number, sr.order_number, cr.order_number, rmb.order_number) as order_number,
        COALESCE(pr.project, sr.project, cr.project, rmb.project) as project,
        COALESCE(pr.project_address, sr.project_address, cr.project_address, rmb.project_address) as project_address
      FROM (
        SELECT 
          order_number COLLATE utf8mb4_unicode_ci as order_number,
          project COLLATE utf8mb4_unicode_ci as project,
          project_address COLLATE utf8mb4_unicode_ci as project_address
        FROM purchase_requests 
        WHERE order_number IS NOT NULL AND order_number != ''
        UNION
        SELECT 
          order_number COLLATE utf8mb4_unicode_ci,
          project COLLATE utf8mb4_unicode_ci,
          project_address COLLATE utf8mb4_unicode_ci
        FROM service_requests 
        WHERE order_number IS NOT NULL AND order_number != ''
        UNION
        SELECT 
          order_number COLLATE utf8mb4_unicode_ci,
          project COLLATE utf8mb4_unicode_ci,
          project_address COLLATE utf8mb4_unicode_ci
        FROM cash_requests 
        WHERE order_number IS NOT NULL AND order_number != ''
        UNION
        SELECT 
          order_number COLLATE utf8mb4_unicode_ci,
          project COLLATE utf8mb4_unicode_ci,
          project_address COLLATE utf8mb4_unicode_ci
        FROM reimbursements 
        WHERE order_number IS NOT NULL AND order_number != ''
      ) as combined
      LEFT JOIN purchase_requests pr ON pr.order_number = combined.order_number COLLATE utf8mb4_unicode_ci AND pr.project = combined.project COLLATE utf8mb4_unicode_ci
      LEFT JOIN service_requests sr ON sr.order_number = combined.order_number COLLATE utf8mb4_unicode_ci AND sr.project = combined.project COLLATE utf8mb4_unicode_ci
      LEFT JOIN cash_requests cr ON cr.order_number = combined.order_number COLLATE utf8mb4_unicode_ci AND cr.project = combined.project COLLATE utf8mb4_unicode_ci
      LEFT JOIN reimbursements rmb ON rmb.order_number = combined.order_number COLLATE utf8mb4_unicode_ci AND rmb.project = combined.project COLLATE utf8mb4_unicode_ci
      ORDER BY order_number DESC
    `;
    
    const [orderNumbers] = await db.query(query);
    res.json(orderNumbers);
  } catch (error) {
    console.error('Error fetching order numbers:', error);
    res.status(500).json({ message: 'Failed to fetch order numbers' });
  }
});

// Get dashboard data for a specific order number
router.get('/dashboard/:orderNumber', authenticate, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { project } = req.query;

    // Build the WHERE clause
    let whereClause = 'WHERE order_number = ?';
    const params = [orderNumber];
    
    if (project && project !== 'all') {
      whereClause += ' AND project = ?';
      params.push(project);
    }

    // Get Purchase Requests data
    const [purchaseRequests] = await db.query(
      `SELECT 
        id, pr_number, purpose, project, project_address, 
        total_amount, status, created_at, approved_at
      FROM purchase_requests 
      ${whereClause} AND total_amount > 0
      ORDER BY created_at DESC`,
      params
    );

    // Get Service Requests data
    const [serviceRequests] = await db.query(
      `SELECT 
        id, sr_number, purpose, description, service_type, project, project_address,
        amount, status, created_at, approved_at
      FROM service_requests 
      ${whereClause} AND amount > 0
      ORDER BY created_at DESC`,
      params
    );

    // Get Cash Requests data
    const [cashRequests] = await db.query(
      `SELECT 
        id, cr_number, purpose, description, cr_type, project, project_address,
        amount, status, created_at, approved_at
      FROM cash_requests 
      ${whereClause} AND amount > 0
      ORDER BY created_at DESC`,
      params
    );

    // Get Reimbursements data
    const [reimbursements] = await db.query(
      `SELECT 
        id, rmb_number, purpose, payee, project, project_address,
        amount, status, created_at, approved_at
      FROM reimbursements 
      ${whereClause} AND amount > 0
      ORDER BY created_at DESC`,
      params
    );

    // Calculate totals
    const prTotal = purchaseRequests.reduce((sum, pr) => sum + parseFloat(pr.total_amount || 0), 0);
    const srTotal = serviceRequests.reduce((sum, sr) => sum + parseFloat(sr.amount || 0), 0);
    const crTotal = cashRequests.reduce((sum, cr) => sum + parseFloat(cr.amount || 0), 0);
    const rmbTotal = reimbursements.reduce((sum, rmb) => sum + parseFloat(rmb.amount || 0), 0);

    const totalActualCost = prTotal + srTotal + crTotal + rmbTotal;

    // Get unique projects for this order number
    const projectsQuery = `
      SELECT DISTINCT project COLLATE utf8mb4_unicode_ci as project, project_address COLLATE utf8mb4_unicode_ci as project_address
      FROM (
        SELECT project COLLATE utf8mb4_unicode_ci as project, project_address COLLATE utf8mb4_unicode_ci as project_address 
        FROM purchase_requests 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND project IS NOT NULL
        UNION
        SELECT project COLLATE utf8mb4_unicode_ci, project_address COLLATE utf8mb4_unicode_ci 
        FROM service_requests 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND project IS NOT NULL
        UNION
        SELECT project COLLATE utf8mb4_unicode_ci, project_address COLLATE utf8mb4_unicode_ci 
        FROM cash_requests 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND project IS NOT NULL
        UNION
        SELECT project COLLATE utf8mb4_unicode_ci, project_address COLLATE utf8mb4_unicode_ci 
        FROM reimbursements 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND project IS NOT NULL
      ) as projects
    `;
    const [projects] = await db.query(projectsQuery, [orderNumber, orderNumber, orderNumber, orderNumber]);

    res.json({
      orderNumber,
      project: project || 'All Projects',
      projects,
      summary: {
        totalActualCost,
        purchaseRequests: {
          count: purchaseRequests.length,
          total: prTotal
        },
        serviceRequests: {
          count: serviceRequests.length,
          total: srTotal
        },
        cashRequests: {
          count: cashRequests.length,
          total: crTotal
        },
        reimbursements: {
          count: reimbursements.length,
          total: rmbTotal
        }
      },
      pieChartData: [
        { name: 'Purchase Requests', value: prTotal, count: purchaseRequests.length },
        { name: 'Service Requests', value: srTotal, count: serviceRequests.length },
        { name: 'Cash Requests', value: crTotal, count: cashRequests.length },
        { name: 'Reimbursements', value: rmbTotal, count: reimbursements.length }
      ],
      details: {
        purchaseRequests,
        serviceRequests,
        cashRequests,
        reimbursements
      }
    });
  } catch (error) {
    console.error('Error fetching order number dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get cost breakdown by project for an order number
router.get('/project-breakdown/:orderNumber', authenticate, async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const query = `
      SELECT 
        project COLLATE utf8mb4_unicode_ci as project,
        SUM(pr_total) as purchase_requests,
        SUM(sr_total) as service_requests,
        SUM(cr_total) as cash_requests,
        SUM(rmb_total) as reimbursements,
        SUM(pr_total + sr_total + cr_total + rmb_total) as total_cost
      FROM (
        SELECT 
          project COLLATE utf8mb4_unicode_ci as project,
          COALESCE(total_amount, 0) as pr_total,
          0 as sr_total,
          0 as cr_total,
          0 as rmb_total
        FROM purchase_requests 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND total_amount > 0
        UNION ALL
        SELECT 
          project COLLATE utf8mb4_unicode_ci,
          0 as pr_total,
          COALESCE(amount, 0) as sr_total,
          0 as cr_total,
          0 as rmb_total
        FROM service_requests 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND amount > 0
        UNION ALL
        SELECT 
          project COLLATE utf8mb4_unicode_ci,
          0 as pr_total,
          0 as sr_total,
          COALESCE(amount, 0) as cr_total,
          0 as rmb_total
        FROM cash_requests 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND amount > 0
        UNION ALL
        SELECT 
          project COLLATE utf8mb4_unicode_ci,
          0 as pr_total,
          0 as sr_total,
          0 as cr_total,
          COALESCE(amount, 0) as rmb_total
        FROM reimbursements 
        WHERE order_number = ? COLLATE utf8mb4_unicode_ci AND amount > 0
      ) as combined
      WHERE project IS NOT NULL
      GROUP BY project
      ORDER BY total_cost DESC
    `;

    const [breakdown] = await db.query(query, [orderNumber, orderNumber, orderNumber, orderNumber]);
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching project breakdown:', error);
    res.status(500).json({ message: 'Failed to fetch project breakdown' });
  }
});

export default router;
