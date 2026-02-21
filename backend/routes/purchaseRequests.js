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
             approver.last_name as approver_last_name,
             s.supplier_name
      FROM purchase_requests pr
      JOIN employees e ON pr.requested_by = e.id
      LEFT JOIN employees approver ON pr.approved_by = approver.id
      LEFT JOIN suppliers s ON pr.supplier_id = s.id
      WHERE pr.id = ?
    `, [req.params.id]);

    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];
    console.log('PR from DB:', pr);
    console.log('Supplier name from DB:', pr.supplier_name);

    // Get items for this PR
    const [items] = await db.query(`
      SELECT pri.*, i.item_name, i.unit, i.item_code
      FROM purchase_request_items pri
      JOIN items i ON pri.item_id = i.id
      WHERE pri.purchase_request_id = ?
    `, [req.params.id]);

    // Get per-item rejection remarks if PR is rejected or sent back to procurement
    let itemRemarks = [];
    if (pr.status === 'Rejected' || pr.status === 'For Procurement Review') {
      const [remarks] = await db.query(`
        SELECT pirr.purchase_request_item_id, pirr.item_id, pirr.remark, pirr.created_at,
               e.first_name as created_by_first_name, e.last_name as created_by_last_name
        FROM pr_item_rejection_remarks pirr
        LEFT JOIN employees e ON pirr.created_by = e.id
        WHERE pirr.purchase_request_id = ?
        ORDER BY pirr.created_at DESC
      `, [req.params.id]);
      itemRemarks = remarks;
    }

    // Add remarks to items
    const itemsWithRemarks = items.map(item => ({
      ...item,
      rejection_remarks: itemRemarks.filter(r => r.purchase_request_item_id === item.id)
    }));

    res.json({ purchaseRequest: { ...pr, items: itemsWithRemarks } });
  } catch (error) {
    console.error('Fetch purchase request error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase request: ' + error.message });
  }
});

// Create PR (engineer)
router.post('/', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, remarks, items, date_needed, project, project_address, order_number, save_as_draft } = req.body;
    const isDraft = save_as_draft === true;

    // Only validate required fields if NOT saving as draft
    if (!isDraft) {
      if (!purpose || !String(purpose).trim()) {
        return res.status(400).json({ message: 'Purpose is required' });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }
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
    const status = isDraft ? 'Draft' : 'For Procurement Review';

    const [result] = await conn.query(
      "INSERT INTO purchase_requests (pr_number, requested_by, purpose, remarks, status, date_needed, project, project_address, order_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [prNumber, req.user.id, purpose || '', remarks ?? '', status, date_needed || null, project || null, project_address || null, order_number || null]
    );

    const prId = result.insertId;

    // Insert items if provided (required for submit, optional for draft)
    if (items && Array.isArray(items) && items.length > 0) {
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
    }

    await conn.commit();

    // Notify procurement officers only if NOT a draft
    if (!isDraft) {
      const procurementOfficers = await getProcurementOfficers();
      for (const officerId of procurementOfficers) {
        await createNotification(
          officerId,
          'New PR Created',
          `Purchase Request ${prNumber} has been created and is ready for your review`,
          'PR Created',
          prId,
          'purchase_request'
        );
      }
    }

    res.status(201).json({
      message: isDraft ? 'Draft saved successfully' : 'Purchase request created successfully',
      prId,
      pr_number: prNumber,
      status: status
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

// Update Draft PR (engineer only)
router.put('/:id/draft', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, remarks, items, date_needed, project, project_address, order_number } = req.body;

    // Check if PR exists and is draft
    const [prs] = await db.query('SELECT * FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];

    // Only the original requester can update draft
    if (pr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can update this draft' });
    }

    // Only draft PRs can be updated
    if (pr.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft purchase requests can be updated' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update PR details
    await conn.query(
      `UPDATE purchase_requests 
       SET purpose = ?, remarks = ?, date_needed = ?, project = ?, project_address = ?, order_number = ?, updated_at = NOW()
       WHERE id = ?`,
      [purpose ?? pr.purpose, remarks ?? pr.remarks, date_needed || pr.date_needed, project || pr.project, project_address || pr.project_address, order_number || pr.order_number, req.params.id]
    );

    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await conn.query('DELETE FROM purchase_request_items WHERE purchase_request_id = ?', [req.params.id]);

      // Insert new items
      for (const item of items) {
        const itemId = item.item_id ?? item.id;
        const quantity = Number(item.quantity);

        if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('Invalid item payload: each item requires item_id (or id) and quantity > 0');
        }

        const unitPrice = Number(item.unit_price ?? 0);
        const totalPrice = unitPrice * quantity;

        await conn.query(
          'INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, unit_price, total_price, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.id, itemId, quantity, unitPrice, totalPrice, item.remarks ?? item.notes ?? null]
        );
      }
    }

    await conn.commit();

    res.json({ message: 'Draft updated successfully', status: 'Draft' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Update draft error:', error);
    res.status(500).json({ message: 'Failed to update draft: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Submit Draft PR (engineer only) - moves to For Procurement Review and notifies procurement
router.put('/:id/submit-draft', authenticate, async (req, res) => {
  let conn;
  try {
    // Check if PR exists and is draft
    const [prs] = await db.query('SELECT * FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];

    // Only the original requester can submit
    if (pr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can submit this draft' });
    }

    // Only draft PRs can be submitted
    if (pr.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft purchase requests can be submitted' });
    }

    // Validate required fields for submission
    if (!pr.purpose || !String(pr.purpose).trim()) {
      return res.status(400).json({ message: 'Purpose is required to submit' });
    }

    // Check if PR has items
    const [itemCount] = await db.query(
      'SELECT COUNT(*) as count FROM purchase_request_items WHERE purchase_request_id = ?',
      [req.params.id]
    );

    if (itemCount[0].count === 0) {
      return res.status(400).json({ message: 'At least one item is required to submit' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update status to For Procurement Review
    await conn.query(
      "UPDATE purchase_requests SET status = 'For Procurement Review', updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );

    await conn.commit();

    // Notify procurement officers
    const procurementOfficers = await getProcurementOfficers();
    for (const officerId of procurementOfficers) {
      await createNotification(
        officerId,
        'New PR Created',
        `Purchase Request ${pr.pr_number} has been created and is ready for your review`,
        'PR Created',
        pr.id,
        'purchase_request'
      );
    }

    // Emit real-time PR update to all procurement officers
    req.io.to('role_procurement').emit('pr_updated', {
      id: pr.id,
      pr_number: pr.pr_number,
      status: 'For Procurement Review',
      type: 'new_pr'
    });

    res.json({ message: 'Draft submitted successfully', status: 'For Procurement Review' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Submit draft error:', error);
    res.status(500).json({ message: 'Failed to submit draft: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Approve/Reject PR by Super Admin (First Approval - to Procurement)
router.put('/:id/super-admin-first-approve', authenticate, requireSuperAdmin, async (req, res) => {
  let conn;
  try {
    const { status, remarks, item_remarks } = req.body;
    
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    const [prs] = await conn.query('SELECT status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    
    const currentStatus = prs[0].status;
    
    if (currentStatus !== 'For Super Admin Final Approval' && currentStatus !== 'On Hold') {
      await conn.rollback();
      return res.status(400).json({ message: 'Invalid status for this approval step' });
    }
    
    let newStatus;
    if (status === 'approved') {
      newStatus = 'For Purchase';
    } else if (status === 'hold') {
      newStatus = 'On Hold';
    } else if (status === 'rejected') {
      newStatus = 'For Procurement Review';
    } else {
      newStatus = 'Rejected';
    }
    
    await conn.query(
      'UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?',
      [newStatus, req.user.id, remarks, req.params.id]
    );

    // Save per-item rejection remarks if rejecting
    if (status === 'rejected' && item_remarks && item_remarks.length > 0) {
      for (const itemRemark of item_remarks) {
        // Get the actual item_id from purchase_request_items table
        const [priResult] = await conn.query(
          'SELECT item_id FROM purchase_request_items WHERE id = ? AND purchase_request_id = ?',
          [itemRemark.item_id, req.params.id]
        );
        
        if (priResult.length > 0) {
          const actualItemId = priResult[0].item_id;
          await conn.query(
            'INSERT INTO pr_item_rejection_remarks (purchase_request_id, purchase_request_item_id, item_id, remark, created_by) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, itemRemark.item_id, actualItemId, itemRemark.remark, req.user.id]
          );
        }
      }
    }
    
    await conn.commit();

    // Get PR details for notification
    const [prDetails] = await db.query('SELECT pr_number, requested_by FROM purchase_requests WHERE id = ?', [req.params.id]);
    const pr = prDetails[0];

    if (status === 'approved') {
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
    } else if (status === 'hold') {
      // On Hold - notify engineer
      await createNotification(
        pr.requested_by,
        'PR On Hold',
        `Your Purchase Request ${pr.pr_number} has been placed on hold by Super Admin${remarks ? ': ' + remarks : ''}`,
        'PR On Hold',
        req.params.id,
        'purchase_request'
      );
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

    // Emit real-time PR status update
    req.io.emit('pr_status_changed', {
      id: req.params.id,
      pr_number: pr.pr_number,
      status: newStatus,
      type: 'status_update',
      updated_by: 'super_admin'
    });

    res.json({ message: `Purchase request ${status} successfully`, status: newStatus });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Super Admin first approval error:', error);
    res.status(500).json({ message: 'Failed to update purchase request' });
  } finally {
    if (conn) conn.release();
  }
});

// Approve/Reject PR by Procurement (to Super Admin Final Approval)
router.put('/:id/procurement-approve', authenticate, requireProcurement, async (req, res) => {
  let conn;
  try {
    const { status, rejection_reason, items, supplier_id, supplier_address, item_remarks } = req.body;
    
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    const [prs] = await conn.query('SELECT status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    
    const currentStatus = prs[0].status;
    
    if (currentStatus !== 'For Procurement Review') {
      await conn.rollback();
      return res.status(400).json({ message: 'Purchase request not ready for Procurement approval' });
    }
    
    let newStatus;
    let totalAmount = null;
    
    if (status === 'approved') {
      newStatus = 'For Super Admin Final Approval';
      
      // Validate supplier_id is provided
      if (!supplier_id) {
        await conn.rollback();
        return res.status(400).json({ message: 'Supplier is required for approval' });
      }
      
      // Fetch original items for comparison
      const [originalItems] = await conn.query(
        'SELECT id, quantity, unit, unit_price, item_id FROM purchase_request_items WHERE purchase_request_id = ?',
        [req.params.id]
      );
      
      // Track changes made by procurement
      const changes = [];
      
      // Update unit prices for items and calculate totals
      if (items && items.length > 0) {
        let calculatedTotal = 0;
        
        for (const item of items) {
          const unitPrice = parseFloat(item.unit_price) || 0;
          const totalPrice = unitPrice * item.quantity;
          calculatedTotal += totalPrice;
          
          // Find original item to compare
          const originalItem = originalItems.find(oi => oi.id === item.id);
          if (originalItem) {
            const changeDetails = [];
            if (originalItem.unit_price !== unitPrice && unitPrice > 0) {
              changeDetails.push(`unit price from ₱${originalItem.unit_price} to ₱${unitPrice}`);
            }
            if (originalItem.unit !== item.unit && item.unit) {
              changeDetails.push(`unit from "${originalItem.unit}" to "${item.unit}"`);
            }
            if (originalItem.quantity !== item.quantity) {
              changeDetails.push(`quantity from ${originalItem.quantity} to ${item.quantity}`);
            }
            if (changeDetails.length > 0) {
              changes.push({
                item_id: item.id,
                item_name: item.item_name || item.item_code,
                changes: changeDetails
              });
            }
          }
          
          // Update unit_price, total_price, and unit if provided
          await conn.query(
            'UPDATE purchase_request_items SET unit_price = ?, total_price = ?, unit = ? WHERE id = ?',
            [unitPrice, totalPrice, item.unit || null, item.id]
          );
        }
        
        totalAmount = calculatedTotal;
      }
      
      // Update PR status, total_amount, supplier_id and supplier_address
      await conn.query(
        'UPDATE purchase_requests SET status = ?, total_amount = ?, supplier_id = ?, supplier_address = ? WHERE id = ?',
        [newStatus, totalAmount, supplier_id, supplier_address || null, req.params.id]
      );
      
      // Store changes info for notification
      req.changes = changes;
    } else {
      newStatus = 'Rejected';
      await conn.query(
        'UPDATE purchase_requests SET status = ?, rejection_reason = ? WHERE id = ?',
        [newStatus, rejection_reason || null, req.params.id]
      );
      
      // Save per-item rejection remarks
      if (item_remarks && item_remarks.length > 0) {
        for (const itemRemark of item_remarks) {
          // Get the actual item_id from purchase_request_items table
          const [priResult] = await conn.query(
            'SELECT item_id FROM purchase_request_items WHERE id = ? AND purchase_request_id = ?',
            [itemRemark.item_id, req.params.id]
          );
          
          if (priResult.length > 0) {
            const actualItemId = priResult[0].item_id;
            await conn.query(
              'INSERT INTO pr_item_rejection_remarks (purchase_request_id, purchase_request_item_id, item_id, remark, created_by) VALUES (?, ?, ?, ?, ?)',
              [req.params.id, itemRemark.item_id, actualItemId, itemRemark.remark, req.user.id]
            );
          }
        }
      }
    }
    
    await conn.commit();

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
      
      // Notify engineer about any changes made by procurement
      if (req.changes && req.changes.length > 0) {
        const changesSummary = req.changes.map(c => `${c.item_name}: ${c.changes.join(', ')}`).join('; ');
        await createNotification(
          pr.requested_by,
          'PR Values Modified by Procurement',
          `Procurement modified values in your PR ${pr.pr_number}: ${changesSummary}`,
          'PR Modified',
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

    // Emit real-time PR status update
    req.io.emit('pr_status_changed', {
      id: req.params.id,
      pr_number: pr.pr_number,
      status: newStatus,
      type: 'status_update',
      updated_by: 'procurement'
    });

    res.json({ message: `Purchase request ${status} successfully`, status: newStatus, total_amount: totalAmount });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Procurement approval error:', error);
    res.status(500).json({ message: 'Failed to update purchase request' });
  } finally {
    if (conn) conn.release();
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

    // Fill order number (F10)
    worksheet.getCell('F10').value = pr.order_number || '';
    
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

// Resubmit rejected PR (engineer)
router.put('/:id/resubmit', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, remarks, items, date_needed, project, project_address, order_number } = req.body;

    // Check if PR exists and is rejected
    const [prs] = await db.query('SELECT * FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];

    // Only the original requester can resubmit
    if (pr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can resubmit this PR' });
    }

    // Only rejected PRs can be resubmitted
    if (pr.status !== 'Rejected') {
      return res.status(400).json({ message: 'Only rejected purchase requests can be resubmitted' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update PR details and reset status to For Procurement Review, clear all pricing data
    await conn.query(
      `UPDATE purchase_requests 
       SET purpose = ?, remarks = ?, date_needed = ?, project = ?, project_address = ?, order_number = ?, 
           status = 'For Procurement Review', approved_by = NULL, approved_at = NULL, 
           supplier_id = NULL, supplier_address = NULL, rejection_reason = NULL, 
           total_amount = NULL, updated_at = NOW()
       WHERE id = ?`,
      [purpose || pr.purpose, remarks ?? pr.remarks, date_needed || pr.date_needed, project || pr.project, project_address || pr.project_address, order_number || pr.order_number, req.params.id]
    );

    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await conn.query('DELETE FROM purchase_request_items WHERE purchase_request_id = ?', [req.params.id]);

      // Insert new items with unit_price and total_price reset to NULL
      // (Procurement will need to set these again during review)
      for (const item of items) {
        const itemId = item.item_id ?? item.id;
        const quantity = Number(item.quantity);

        if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('Invalid item payload: each item requires item_id (or id) and quantity > 0');
        }

        // Reset prices to NULL - procurement will set them again
        await conn.query(
          'INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, unit_price, total_price, remarks) VALUES (?, ?, ?, NULL, NULL, ?)',
          [req.params.id, itemId, quantity, item.remarks ?? item.notes ?? null]
        );
      }
    }

    await conn.commit();

    // Notify procurement officers about resubmitted PR
    const procurementOfficers = await getProcurementOfficers();
    for (const officerId of procurementOfficers) {
      await createNotification(
        officerId,
        'PR Resubmitted',
        `Purchase Request ${pr.pr_number} has been resubmitted by ${req.user.first_name} ${req.user.last_name}`,
        'PR Created',
        pr.id,
        'purchase_request'
      );
    }

    res.json({ message: 'Purchase request resubmitted successfully', status: 'For Procurement Review' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Resubmit PR error:', error);
    res.status(500).json({ message: 'Failed to resubmit purchase request: ' + error.message });
  } finally {
    if (conn) conn.release();
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
