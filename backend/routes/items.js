import express from 'express';
import { authenticate, requireAdmin, requireEngineer } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all items with category info
router.get('/', authenticate, async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT i.*, c.category_name, c.description as category_description
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'Active'
      ORDER BY i.item_name
    `);
    res.json({ items });
  } catch (error) {
    console.error('Fetch items error:', error);
    res.status(500).json({ message: 'Failed to fetch items: ' + error.message });
  }
});

// Get single item
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT i.*, c.category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ? AND i.status = 'Active'
    `, [req.params.id]);

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item: items[0] });
  } catch (error) {
    console.error('Fetch item error:', error);
    res.status(500).json({ message: 'Failed to fetch item: ' + error.message });
  }
});

// Create item (engineers and admins can create)
router.post('/', authenticate, requireEngineer, async (req, res) => {
  try {
    const { item_code, item_name, description, category_id, unit } = req.body;

    const [result] = await db.query(
      'INSERT INTO items (item_code, item_name, description, category_id, unit) VALUES (?, ?, ?, ?, ?)',
      [item_code, item_name, description, category_id, unit]
    );

    res.status(201).json({ 
      message: 'Item created successfully', 
      itemId: result.insertId 
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Failed to create item: ' + error.message });
  }
});

// Update item (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { item_name, description, category_id, unit } = req.body;
    
    await db.query(
      'UPDATE items SET item_name = ?, description = ?, category_id = ?, unit = ? WHERE id = ?',
      [item_name, description, category_id, unit, req.params.id]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item: ' + error.message });
  }
});

// Delete item (admin only - soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query("UPDATE items SET status = 'Inactive' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item: ' + error.message });
  }
});

export default router;
