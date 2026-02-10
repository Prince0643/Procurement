import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all suppliers
router.get('/', authenticate, async (req, res) => {
  try {
    const [suppliers] = await db.query(`
      SELECT s.*, COUNT(si.item_id) as items_count
      FROM suppliers s
      LEFT JOIN supplier_items si ON s.id = si.supplier_id
      WHERE s.status = 'Active'
      GROUP BY s.id
      ORDER BY s.supplier_name
    `);
    res.json({ suppliers });
  } catch (error) {
    console.error('Failed to fetch suppliers', error);
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
});

// Get single supplier with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [suppliers] = await db.query(
      'SELECT * FROM suppliers WHERE id = ? AND status = \'Active\'',
      [req.params.id]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const [items] = await db.query(`
      SELECT i.id, i.item_name as name, i.unit, si.price, si.lead_time_days
      FROM items i
      JOIN supplier_items si ON i.id = si.item_id
      WHERE si.supplier_id = ?
    `, [req.params.id]);

    res.json({ supplier: { ...suppliers[0], items } });
  } catch (error) {
    console.error('Failed to fetch supplier', error);
    res.status(500).json({ message: 'Failed to fetch supplier' });
  }
});

// Create supplier (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, tin } = req.body;
    
    // Generate supplier code
    const supplierCode = 'SUP' + Date.now().toString().slice(-6);
    
    const [result] = await db.query(
      'INSERT INTO suppliers (supplier_code, supplier_name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
      [supplierCode, name, contact_person, phone, email, address]
    );

    res.status(201).json({ 
      message: 'Supplier created successfully', 
      supplierId: result.insertId 
    });
  } catch (error) {
    console.error('Failed to create supplier', error);
    res.status(500).json({ message: 'Failed to create supplier' });
  }
});

// Update supplier (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, contact_person, phone, email, address } = req.body;
    
    await db.query(
      'UPDATE suppliers SET supplier_name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, contact_person, phone, email, address, req.params.id]
    );

    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Failed to update supplier', error);
    res.status(500).json({ message: 'Failed to update supplier' });
  }
});

// Delete supplier (admin only - soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query("UPDATE suppliers SET status = 'Inactive' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Failed to delete supplier', error);
    res.status(500).json({ message: 'Failed to delete supplier' });
  }
});

// Add item to supplier (admin only)
router.post('/:id/items', authenticate, requireAdmin, async (req, res) => {
  try {
    const { item_id, price, lead_time_days } = req.body;
    
    await db.query(
      'INSERT INTO supplier_items (supplier_id, item_id, price, lead_time_days) VALUES (?, ?, ?, ?)',
      [req.params.id, item_id, price, lead_time_days]
    );

    res.status(201).json({ message: 'Item added to supplier successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to supplier' });
  }
});

export default router;
