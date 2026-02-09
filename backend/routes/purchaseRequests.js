import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all PRs (filtered by user role)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT pr.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name
      FROM purchase_requests pr
      JOIN employees e ON pr.requested_by = e.id
    `;
    
    const params = [];
    
    // Engineers see only their own PRs
    if (req.user.role === 'engineer') {
      query += ' WHERE pr.requested_by = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY pr.created_at DESC';
    
    const [prs] = await db.query(query, params);
    res.json({ purchaseRequests: prs });
  } catch (error) {
    console.error('Fetch purchase requests error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase requests: ' + error.message });
  }
});

// Get single PR with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [prs] = await db.query(`
      SELECT pr.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM purchase_requests pr
      JOIN employees e ON pr.requested_by = e.id
      LEFT JOIN employees approver ON pr.approved_by = approver.id
      WHERE pr.id = ?
    `, [req.params.id]);

    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];

    // Get items for this PR
    const [items] = await db.query(`
      SELECT pri.*, i.item_name, i.unit, i.item_code
      FROM purchase_request_items pri
      JOIN items i ON pri.item_id = i.id
      WHERE pri.purchase_request_id = ?
    `, [req.params.id]);

    res.json({ purchaseRequest: { ...pr, items } });
  } catch (error) {
    console.error('Fetch purchase request error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase request: ' + error.message });
  }
});

// Create PR (engineer)
router.post('/', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, remarks, items } = req.body;

    if (!purpose || !String(purpose).trim()) {
      return res.status(400).json({ message: 'Purpose is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const prNumber = `PR-${new Date().getFullYear()}-${Date.now()}`;

    const [result] = await conn.query(
      "INSERT INTO purchase_requests (pr_number, purpose, remarks, status) VALUES (?, ?, ?, 'Pending')",
      [prNumber, purpose, remarks ?? '']
    );

    const prId = result.insertId;

    for (const item of items) {
      const itemId = item.item_id ?? item.id;
      const quantity = Number(item.quantity);

      if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('Invalid item payload: each item requires item_id (or id) and quantity > 0');
      }

      const unitPrice = Number(item.unit_price ?? item.estimated_unit_price ?? 0);
      const totalPrice = unitPrice * quantity;

      await conn.query(
        'INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, unit_price, total_price, remarks) VALUES (?, ?, ?, ?, ?, ?)',
        [prId, itemId, quantity, unitPrice, totalPrice, item.remarks ?? item.notes ?? null]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Purchase request created successfully',
      prId,
      pr_number: prNumber
    });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Create purchase request error:', error);
    res.status(500).json({ message: 'Failed to create purchase request: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Approve/Reject PR (super admin only)
router.put('/:id/approve', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { status, remarks } = req.body; // status: 'approved' or 'rejected'
    
    await db.query(
      'UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?',
      [status, req.user.id, remarks, req.params.id]
    );

    res.json({ message: `Purchase request ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update purchase request' });
  }
});

export default router;
