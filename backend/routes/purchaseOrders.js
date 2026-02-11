import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getSuperAdmins } from '../utils/notifications.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const { purchase_request_id, supplier_id, expected_delivery_date, place_of_delivery, project, delivery_term, payment_term, notes, items } = req.body;
    
    // Generate PO number (MTN-YYYY-MM-### format - same as PR)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get initials from current user or default to MTN
    const [userResult] = await db.query('SELECT first_name, last_name FROM employees WHERE id = ?', [req.user.id]);
    const user = userResult[0] || {};
    const initials = (user.first_name?.[0] || 'M') + (user.last_name?.[0] || 'T') + 'N';
    
    // Count existing POs for this month to generate sequence
    const [countResult] = await db.query(
      "SELECT COUNT(*) as count FROM purchase_orders WHERE po_number LIKE ?",
      [`${initials}-${year}-${month}-%`]
    );
    const sequence = String(countResult[0].count + 1).padStart(3, '0');
    const poNumber = `${initials}-${year}-${month}-${sequence}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create PO with new fields
    const [result] = await db.query(
      `INSERT INTO purchase_orders (po_number, purchase_request_id, supplier_id, prepared_by, total_amount, po_date, expected_delivery_date, place_of_delivery, project, delivery_term, payment_term, notes, status) 
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, COALESCE(?, 'COD'), COALESCE(?, 'CASH'), ?, ?)`,
      [poNumber, purchase_request_id, supplier_id, req.user.id, totalAmount, expected_delivery_date, place_of_delivery || null, project || null, delivery_term, payment_term, notes || null, 'Draft']
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

// Export PO to Excel
router.get('/:id/export', authenticate, async (req, res) => {
  try {
    // Get PO details with supplier and PR info
    const [pos] = await db.query(`
      SELECT po.*, 
             s.supplier_name, s.address as supplier_address,
             pr.pr_number,
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

    const po = pos[0];

    // Get PO items
    const [items] = await db.query(`
      SELECT poi.*, i.item_name, i.item_code, i.unit
      FROM purchase_order_items poi
      JOIN items i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = ?
    `, [req.params.id]);

    // Load template workbook
    const templatePath = path.join(__dirname, '..', '..', 'PO 2026.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.getWorksheet(1);

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    // Fill PO number (G5)
    worksheet.getCell('G5').value = po.po_number || '';

    // Fill supplier name (B5)
    worksheet.getCell('B5').value = po.supplier_name || '';

    // Fill supplier address (B6)
    worksheet.getCell('B6').value = po.supplier_address || '';

    // Fill date (G6) - po_date
    worksheet.getCell('G6').value = formatDate(po.po_date);

    // Fill project (B8)
    worksheet.getCell('B8').value = po.project || '';

    // Fill place of delivery (B9)
    worksheet.getCell('B9').value = po.place_of_delivery || '';

    // Fill delivery term (G9)
    worksheet.getCell('G9').value = po.delivery_term || 'COD';

    // Fill date of delivery (B10) - expected_delivery_date
    worksheet.getCell('B10').value = formatDate(po.expected_delivery_date);

    // Fill payment term (G10)
    worksheet.getCell('G10').value = po.payment_term || 'CASH';

    // Fill items starting from row 12
    let rowNum = 12;
    items.forEach((item, index) => {
      const row = worksheet.getRow(rowNum);
      row.getCell(1).value = item.quantity; // A - QTY
      row.getCell(2).value = item.unit; // B - UNIT
      // Description spans C-E, set to C
      row.getCell(3).value = item.item_name || item.item_code; // C - DESCRIPTION (spans to E)
      row.getCell(6).value = parseFloat(item.unit_price) || 0; // F - UNIT COST
      row.getCell(7).value = parseFloat(item.total_price) || 0; // G - AMOUNT
      rowNum++;
    });

    // Fill purchase total (G29)
    worksheet.getCell('G29').value = po.total_amount || 0;

    // Generate filename
    const filename = `PO-${po.po_number}-${Date.now()}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export PO error:', error);
    res.status(500).json({ message: 'Failed to export purchase order: ' + error.message });
  }
});

export default router;
