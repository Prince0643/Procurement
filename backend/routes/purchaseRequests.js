import express from 'express';
import { authenticate, requireProcurement, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getProcurementOfficers, getSuperAdmins } from '../utils/notifications.js';

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

    const year = new Date().getFullYear();
    const firstInitial = String(req.user.first_name || '').charAt(0).toUpperCase();
    const lastName = String(req.user.last_name || '');
    const lastInitial = lastName.charAt(0).toUpperCase();
    const lastLetter = lastName.slice(-1).toUpperCase();
    const initials = `${firstInitial}${lastInitial}${lastLetter}`;

    // Get the last PR number for this engineer in this year
    const [lastPrs] = await conn.query(
      "SELECT pr_number FROM purchase_requests WHERE pr_number LIKE ? ORDER BY pr_number DESC LIMIT 1",
      [`${year}-${initials}-%`]
    );

    let counter = 1;
    if (lastPrs.length > 0) {
      const lastNumber = lastPrs[0].pr_number;
      const match = lastNumber.match(/-(\d{3})$/);
      if (match) {
        counter = parseInt(match[1], 10) + 1;
      }
    }

    const prNumber = `${year}-${initials}-${String(counter).padStart(3, '0')}`;

    const [result] = await conn.query(
      "INSERT INTO purchase_requests (pr_number, requested_by, purpose, remarks, status) VALUES (?, ?, ?, ?, 'Pending')",
      [prNumber, req.user.id, purpose, remarks ?? '']
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

    // Notify procurement officers and Super Admins about new PR
    const procurementOfficers = await getProcurementOfficers();
    for (const officerId of procurementOfficers) {
      await createNotification(
        officerId,
        'New PR Created',
        `Purchase Request ${prNumber} has been created and is pending Super Admin approval`,
        'PR Created',
        prId,
        'purchase_request'
      );
    }

    // Also notify Super Admins for first approval
    const superAdmins = await getSuperAdmins();
    for (const adminId of superAdmins) {
      await createNotification(
        adminId,
        'New PR Pending Approval',
        `Purchase Request ${prNumber} has been created and requires your approval`,
        'PR Created',
        prId,
        'purchase_request'
      );
    }

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

// Approve/Reject PR by Super Admin (First Approval - to Procurement)
router.put('/:id/super-admin-first-approve', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const [prs] = await db.query('SELECT status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    
    const currentStatus = prs[0].status;
    
    if (currentStatus !== 'Pending' && currentStatus !== 'For Super Admin Final Approval') {
      return res.status(400).json({ message: 'Invalid status for this approval step' });
    }
    
    let newStatus;
    if (status === 'approved') {
      newStatus = currentStatus === 'Pending' ? 'For Procurement Review' : 'For Purchase';
    } else {
      newStatus = 'Rejected';
    }
    
    await db.query(
      'UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?',
      [newStatus, req.user.id, remarks, req.params.id]
    );

    // Get PR details for notification
    const [prDetails] = await db.query('SELECT pr_number, requested_by FROM purchase_requests WHERE id = ?', [req.params.id]);
    const pr = prDetails[0];

    if (status === 'approved') {
      if (currentStatus === 'Pending') {
        // First approval - notify procurement
        const procurementOfficers = await getProcurementOfficers();
        for (const officerId of procurementOfficers) {
          await createNotification(
            officerId,
            'PR Approved - Review Required',
            `Purchase Request ${pr.pr_number} has been approved by Super Admin and requires your review`,
            'PR Approved',
            req.params.id,
            'purchase_request'
          );
        }
      } else {
        // Final approval - notify engineer
        await createNotification(
          pr.requested_by,
          'PR Fully Approved',
          `Your Purchase Request ${pr.pr_number} has been fully approved and is ready for purchase`,
          'PR Approved',
          req.params.id,
          'purchase_request'
        );
        
        // Also notify admins who can create POs
        const { getAdmins } = await import('../utils/notifications.js');
        const admins = await getAdmins();
        for (const adminId of admins) {
          await createNotification(
            adminId,
            'PR Ready for PO Creation',
            `Purchase Request ${pr.pr_number} has been approved and is ready for PO creation`,
            'PR Approved',
            req.params.id,
            'purchase_request'
          );
        }
      }
    } else {
      // Rejected - notify engineer
      await createNotification(
        pr.requested_by,
        'PR Rejected',
        `Your Purchase Request ${pr.pr_number} has been rejected${remarks ? ': ' + remarks : ''}`,
        'PR Rejected',
        req.params.id,
        'purchase_request'
      );
    }

    res.json({ message: `Purchase request ${status} successfully`, status: newStatus });
  } catch (error) {
    console.error('Super Admin first approval error:', error);
    res.status(500).json({ message: 'Failed to update purchase request' });
  }
});

// Approve/Reject PR by Procurement (to Super Admin Final Approval)
router.put('/:id/procurement-approve', authenticate, requireProcurement, async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    
    const [prs] = await db.query('SELECT status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    
    const currentStatus = prs[0].status;
    
    if (currentStatus !== 'For Procurement Review') {
      return res.status(400).json({ message: 'Purchase request not ready for Procurement approval' });
    }
    
    let newStatus;
    if (status === 'approved') {
      newStatus = 'For Super Admin Final Approval';
    } else {
      newStatus = 'Rejected';
    }
    
    await db.query(
      'UPDATE purchase_requests SET status = ?, rejection_reason = ? WHERE id = ?',
      [newStatus, status === 'rejected' ? rejection_reason : null, req.params.id]
    );

    // Get PR details for notification
    const [prDetails] = await db.query('SELECT pr_number, requested_by FROM purchase_requests WHERE id = ?', [req.params.id]);
    const pr = prDetails[0];

    if (status === 'approved') {
      // Procurement approved - notify Super Admin for final approval
      const superAdmins = await getSuperAdmins();
      for (const adminId of superAdmins) {
        await createNotification(
          adminId,
          'PR Pending Final Approval',
          `Purchase Request ${pr.pr_number} has been reviewed by Procurement and requires your final approval`,
          'PR Approved',
          req.params.id,
          'purchase_request'
        );
      }
    } else {
      // Rejected - notify engineer and Super Admin
      await createNotification(
        pr.requested_by,
        'PR Rejected by Procurement',
        `Your Purchase Request ${pr.pr_number} has been rejected by Procurement${rejection_reason ? ': ' + rejection_reason : ''}`,
        'PR Rejected',
        req.params.id,
        'purchase_request'
      );
    }

    res.json({ message: `Purchase request ${status} successfully`, status: newStatus });
  } catch (error) {
    console.error('Procurement approval error:', error);
    res.status(500).json({ message: 'Failed to update purchase request' });
  }
});

// Legacy endpoint - remove requireSuperAdmin restriction for backward compatibility
router.put('/:id/approve', authenticate, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
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
