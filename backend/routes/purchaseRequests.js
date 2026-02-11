import express from 'express';
import { authenticate, requireProcurement, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getProcurementOfficers, getSuperAdmins } from '../utils/notifications.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const { purpose, remarks, items, date_needed, project, project_address } = req.body;

    if (!purpose || !String(purpose).trim()) {
      return res.status(400).json({ message: 'Purpose is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const firstInitial = String(req.user.first_name || '').charAt(0).toUpperCase();
    const middleInitial = String(req.user.middle_initial || '').charAt(0).toUpperCase();
    const lastInitial = String(req.user.last_name || '').charAt(0).toUpperCase();
    const initials = `${firstInitial}${middleInitial}${lastInitial}`;

    // Get the last PR number for this engineer in this year/month
    const [lastPrs] = await conn.query(
      "SELECT pr_number FROM purchase_requests WHERE pr_number LIKE ? ORDER BY pr_number DESC LIMIT 1",
      [`${initials}-${year}-${month}-%`]
    );

    let counter = 1;
    if (lastPrs.length > 0) {
      const lastNumber = lastPrs[0].pr_number;
      const match = lastNumber.match(/-(\d{3})$/);
      if (match) {
        counter = parseInt(match[1], 10) + 1;
      }
    }

    const prNumber = `${initials}-${year}-${month}-${String(counter).padStart(3, '0')}`;

    const [result] = await conn.query(
      "INSERT INTO purchase_requests (pr_number, requested_by, purpose, remarks, status, date_needed, project, project_address) VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?)",
      [prNumber, req.user.id, purpose, remarks ?? '', date_needed || null, project || null, project_address || null]
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
    const { status, rejection_reason, items, supplier_id, supplier_address } = req.body;
    
    const [prs] = await db.query('SELECT status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    
    const currentStatus = prs[0].status;
    
    if (currentStatus !== 'For Procurement Review') {
      return res.status(400).json({ message: 'Purchase request not ready for Procurement approval' });
    }
    
    let newStatus;
    let totalAmount = null;
    
    if (status === 'approved') {
      newStatus = 'For Super Admin Final Approval';
      
      // Validate supplier_id is provided
      if (!supplier_id) {
        return res.status(400).json({ message: 'Supplier is required for approval' });
      }
      
      // Update unit prices for items and calculate totals
      if (items && items.length > 0) {
        let calculatedTotal = 0;
        
        for (const item of items) {
          const unitPrice = parseFloat(item.unit_price) || 0;
          const totalPrice = unitPrice * item.quantity;
          calculatedTotal += totalPrice;
          
          await db.query(
            'UPDATE purchase_request_items SET unit_price = ?, total_price = ? WHERE id = ?',
            [unitPrice, totalPrice, item.id]
          );
        }
        
        totalAmount = calculatedTotal;
      }
      
      // Update PR status, total_amount, supplier_id and supplier_address
      await db.query(
        'UPDATE purchase_requests SET status = ?, total_amount = ?, supplier_id = ?, supplier_address = ? WHERE id = ?',
        [newStatus, totalAmount, supplier_id, supplier_address || null, req.params.id]
      );
    } else {
      newStatus = 'Rejected';
      await db.query(
        'UPDATE purchase_requests SET status = ?, rejection_reason = ? WHERE id = ?',
        [newStatus, rejection_reason || null, req.params.id]
      );
    }

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

    res.json({ message: `Purchase request ${status} successfully`, status: newStatus, total_amount: totalAmount });
  } catch (error) {
    console.error('Procurement approval error:', error);
    res.status(500).json({ message: 'Failed to update purchase request' });
  }
});

// Export PR to Excel
router.get('/:id/export', authenticate, async (req, res) => {
  try {
    // Get PR details with items and supplier info
    const [prs] = await db.query(`
      SELECT pr.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             s.supplier_name,
             s.contact_person as supplier_contact
      FROM purchase_requests pr
      JOIN employees e ON pr.requested_by = e.id
      LEFT JOIN suppliers s ON pr.supplier_id = s.id
      WHERE pr.id = ?
    `, [req.params.id]);
    
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    
    const pr = prs[0];
    
    // Get PR items
    const [items] = await db.query(`
      SELECT pri.*, i.item_name, i.item_code, i.unit
      FROM purchase_request_items pri
      JOIN items i ON pri.item_id = i.id
      WHERE pri.purchase_request_id = ?
    `, [req.params.id]);
    
    // Load template workbook
    const templatePath = path.join(__dirname, '..', '..', 'PURCHASE REQUEST- FINAL-2026.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    const worksheet = workbook.getWorksheet(1);
    
    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    
    // Fill PR number (F6)
    worksheet.getCell('F6').value = pr.pr_number || '';
    
    // Fill supplier name (C8)
    worksheet.getCell('C8').value = pr.supplier_name || '';
    
    // Fill supplier address (C9)
    worksheet.getCell('C9').value = pr.supplier_address || '';
    
    // Fill project (C10)
    worksheet.getCell('C10').value = pr.project || '';
    
    // Fill project address (C11)
    worksheet.getCell('C11').value = pr.project_address || '';
    
    // Fill date prepared (F8) - created_at
    worksheet.getCell('F8').value = formatDate(pr.created_at);
    
    // Fill date needed (F9)
    worksheet.getCell('F9').value = formatDate(pr.date_needed);
    
    // Fill items starting from row 14
    let rowNum = 14;
    items.forEach((item, index) => {
      const row = worksheet.getRow(rowNum);
      row.getCell(1).value = item.quantity; // A - QTY
      row.getCell(2).value = item.unit; // B - UNIT
      row.getCell(3).value = item.item_name || item.item_code; // C/D - DESCRIPTION (merged)
      row.getCell(5).value = parseFloat(item.unit_price) || 0; // E - UNIT COST
      row.getCell(6).value = parseFloat(item.total_price) || 0; // F - AMOUNT
      rowNum++;
    });
    
    // Add "*** NOTHING FOLLOWS ***" after items
    const nothingFollowsRow = worksheet.getRow(rowNum);
    nothingFollowsRow.getCell(3).value = '*** NOTHING FOLLOWS ***';
    
    // Fill total (F31)
    worksheet.getCell('F31').value = pr.total_amount || 0;
    
    // Generate filename
    const filename = `PR-${pr.pr_number}-${Date.now()}.xlsx`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Export PR error:', error);
    res.status(500).json({ message: 'Failed to export purchase request: ' + error.message });
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
