import express from 'express';
import { authenticate, requireItemManagement } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all items with category info
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);
    const offset = (page - 1) * pageSize;
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();

    const whereClauses = ["i.status = 'Active'"];
    const whereParams = [];

    if (search) {
      whereClauses.push('(i.item_name LIKE ? OR i.item_code LIKE ?)');
      const searchPattern = `%${search}%`;
      whereParams.push(searchPattern, searchPattern);
    }

    if (category && category.toLowerCase() !== 'all') {
      whereClauses.push('c.category_name = ?');
      whereParams.push(category);
    }

    const whereSql = whereClauses.join(' AND ');

    const [items] = await db.query(`
      SELECT i.*, c.category_name, c.description as category_description
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE ${whereSql}
      ORDER BY i.item_name
      LIMIT ? OFFSET ?
    `, [...whereParams, pageSize, offset]);

    const [countRows] = await db.query(`
      SELECT COUNT(*) as total
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE ${whereSql}
    `, whereParams);

    const total = Number(countRows?.[0]?.total ?? 0);
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.json({ items, page, pageSize, total, totalPages });
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

// Create item (procurement, admin, super_admin, engineer can create)
router.post('/', authenticate, requireItemManagement, async (req, res) => {
  try {
    const { item_code, item_name, description, category_id, unit } = req.body;
    const created_by = req.user.id;

    if (!item_code || !String(item_code).trim()) {
      return res.status(400).json({ message: 'Item code is required' });
    }

    if (!item_name || !String(item_name).trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const normalizedCategoryId = Number(category_id);
    if (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const [categories] = await db.query(
      'SELECT id FROM categories WHERE id = ? LIMIT 1',
      [normalizedCategoryId]
    );

    if (categories.length === 0) {
      return res.status(400).json({ message: 'Selected category does not exist' });
    }

    const [result] = await db.query(
      'INSERT INTO items (item_code, item_name, description, category_id, unit, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [item_code, item_name, description, normalizedCategoryId, unit, created_by]
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

// Update item (procurement, admin, super_admin, engineer can update)
router.put('/:id', authenticate, requireItemManagement, async (req, res) => {
  try {
    const { item_code, item_name, description, category_id, unit } = req.body;
    const normalizedCategoryId = Number(category_id);

    if (!item_code || !String(item_code).trim()) {
      return res.status(400).json({ message: 'Item code is required' });
    }

    if (!item_name || !String(item_name).trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    if (!Number.isInteger(normalizedCategoryId) || normalizedCategoryId <= 0) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const [categories] = await db.query(
      'SELECT id FROM categories WHERE id = ? LIMIT 1',
      [normalizedCategoryId]
    );

    if (categories.length === 0) {
      return res.status(400).json({ message: 'Selected category does not exist' });
    }
    
    await db.query(
      'UPDATE items SET item_code = ?, item_name = ?, description = ?, category_id = ?, unit = ? WHERE id = ?',
      [item_code, item_name, description, normalizedCategoryId, unit, req.params.id]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item: ' + error.message });
  }
});

// Delete item (procurement, admin, super_admin, engineer can delete - soft delete)
router.delete('/:id', authenticate, requireItemManagement, async (req, res) => {
  try {
    await db.query("UPDATE items SET status = 'Inactive' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item: ' + error.message });
  }
});

export default router;
