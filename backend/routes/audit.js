import express from 'express';
import db from '../config/database.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 50, 1);
    const offset = (page - 1) * limit;

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM system_audit_logs');
    const total = countResult[0].total;

    const [logs] = await db.query(`
      SELECT 
        l.id, l.action, l.entity_type, l.entity_id, l.details, l.created_at,
        u.first_name, u.last_name, u.employee_no
      FROM system_audit_logs l
      LEFT JOIN employees u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
});

export default router;
