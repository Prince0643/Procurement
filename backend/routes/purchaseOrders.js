import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all POs
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT po.*, 
             s.name as supplier_name,
             pr.pr_number,
             e.first_name as created_by_first_name,
             e.last_name as created_by_last_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      JOIN employees e ON po.created_by = e.id
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
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
});

// Get single PO with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [pos] = await db.query(`
      SELECT po.*, 
             s.name as supplier_name, s.contact_person, s.phone, s.email,
             pr.pr_number, pr.notes as pr_notes,
             e.first_name as created_by_first_name,
             e.last_name as created_by_last_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      JOIN employees e ON po.created_by = e.id
      WHERE po.id = ?
    `, [req.params.id]);

    if (pos.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const [items] = await db.query(`
      SELECT poi.*, i.name as item_name, i.unit
      FROM purchase_order_items poi
      JOIN items i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = ?
    `, [req.params.id]);

    res.json({ purchaseOrder: { ...pos[0], items } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch purchase order' });
  }
});

// Create PO (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { purchase_request_id, supplier_id, expected_delivery_date, notes, items } = req.body;
    
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
      'INSERT INTO purchase_orders (po_number, purchase_request_id, supplier_id, created_by, total_amount, expected_delivery_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [poNumber, purchase_request_id, supplier_id, req.user.id, totalAmount, expected_delivery_date, notes]
    );

    const poId = result.insertId;

    // Insert items
    for (const item of items) {
      await db.query(
        'INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [poId, item.item_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    // Update PR status to ordered
    await db.query(
      "UPDATE purchase_requests SET status = 'ordered' WHERE id = ?",
      [purchase_request_id]
    );

    res.status(201).json({ 
      message: 'Purchase order created successfully', 
      poId,
      poNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create purchase order' });
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
