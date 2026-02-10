import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getSuperAdmins } from '../utils/notifications.js';

const router = express.Router();

// Get all POs
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT po.*, 
             s.supplier_name as supplier_name,
             pr.pr_number,
             e.first_name as prepared_by_first_name,
             e.last_name as prepared_by_last_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      LEFT JOIN employees e ON po.prepared_by = e.id
    `;
    
    const params = [];
    
    if (req.user.role === 'engineer') {
      query += ' WHERE pr.requested_by = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY po.created_at DESC';
    
    const [pos] = await db.query(query, params);
    res.json({ purchaseOrders: pos });
  } catch (error) {
    console.error('Failed to fetch purchase orders', error);
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
});

// Get single PO with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [pos] = await db.query(`
      SELECT po.*, 
             s.supplier_name as supplier_name, s.contact_person, s.phone, s.email,
             pr.pr_number, pr.remarks as pr_remarks,
             e.first_name as prepared_by_first_name,
             e.last_name as prepared_by_last_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      LEFT JOIN employees e ON po.prepared_by = e.id
      WHERE po.id = ?
    `, [req.params.id]);

    if (pos.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const [items] = await db.query(`
      SELECT poi.*, i.item_name as item_name, i.unit
      FROM purchase_order_items poi
      JOIN items i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = ?
    `, [req.params.id]);

    res.json({ purchaseOrder: { ...pos[0], items } });
  } catch (error) {
    console.error('Failed to fetch purchase order', error);
    res.status(500).json({ message: 'Failed to fetch purchase order' });
  }
});

// Create PO (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { purchase_request_id, supplier_id, expected_delivery_date, items } = req.body;
    
    // Generate PO number (PO-YYYY-XXXX format)
    const year = new Date().getFullYear();
    const [countResult] = await db.query(
      "SELECT COUNT(*) as count FROM purchase_orders WHERE po_number LIKE ?",
      [`PO-${year}-%`]
    );
    const poNumber = `PO-${year}-${String(countResult[0].count + 1).padStart(4, '0')}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create PO
    const [result] = await db.query(
      'INSERT INTO purchase_orders (po_number, purchase_request_id, supplier_id, prepared_by, total_amount, po_date, expected_delivery_date, status) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)',
      [poNumber, purchase_request_id, supplier_id, req.user.id, totalAmount, expected_delivery_date, 'Draft']
    );

    const poId = result.insertId;

    // Insert items
    for (const item of items) {
      await db.query(
        'INSERT INTO purchase_order_items (purchase_order_id, purchase_request_item_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
        [poId, item.purchase_request_item_id, item.item_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    // Update PR status to 'PO Created' so admin knows a PO was created for this PR
    await db.query(
      "UPDATE purchase_requests SET status = 'PO Created' WHERE id = ?",
      [purchase_request_id]
    );

    // Notify Super Admins that a new PO needs approval
    const superAdmins = await getSuperAdmins();
    for (const adminId of superAdmins) {
      await createNotification(
        adminId,
        'New PO Pending Approval',
        `Purchase Order ${poNumber} has been created and requires your approval`,
        'PO Created',
        poId,
        'purchase_order'
      );
    }

    res.status(201).json({ 
      message: 'Purchase order created successfully', 
      poId,
      poNumber
    });
  } catch (error) {
    console.error('Failed to create purchase order', error);
    res.status(500).json({ message: 'Failed to create purchase order' });
  }
});

// Approve/Reject PO (super admin only)
router.put('/:id/super-admin-approve', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'

    const [pos] = await db.query('SELECT status FROM purchase_orders WHERE id = ?', [req.params.id]);
    if (pos.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const currentStatus = pos[0].status;
    if (currentStatus !== 'Draft') {
      return res.status(400).json({ message: 'Purchase order not ready for Super Admin approval' });
    }

    const newStatus = status === 'approved' ? 'Ordered' : 'Cancelled';

    await db.query(
      'UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, req.params.id]
    );

    // If PO is approved (Ordered), update the related PR to Completed
    if (status === 'approved') {
      const [po] = await db.query('SELECT purchase_request_id FROM purchase_orders WHERE id = ?', [req.params.id]);
      if (po.length > 0) {
        await db.query(
          "UPDATE purchase_requests SET status = 'Completed' WHERE id = ?",
          [po[0].purchase_request_id]
        );
        
        // Get PR details to notify engineer
        const [pr] = await db.query('SELECT pr_number, requested_by FROM purchase_requests WHERE id = ?', [po[0].purchase_request_id]);
        if (pr.length > 0) {
          await createNotification(
            pr[0].requested_by,
            'PO Approved - Order Placed',
            `Your Purchase Order has been approved and placed. Related PR: ${pr[0].pr_number}`,
            'PO Created',
            req.params.id,
            'purchase_order'
          );
        }
      }
    }

    res.json({ message: `Purchase order ${status} successfully`, status: newStatus });
  } catch (error) {
    console.error('Failed to approve purchase order', error);
    res.status(500).json({ message: 'Failed to approve purchase order' });
  }
});

// Update PO status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    
    await db.query(
      'UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'Purchase order status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update purchase order status' });
  }
});

export default router;
