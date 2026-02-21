import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getSuperAdmins, getProcurementOfficers } from '../utils/notifications.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all Disbursement Vouchers
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT dv.*, 
             s.supplier_name,
             po.po_number,
             pr.pr_number,
             e.first_name as prepared_by_first_name,
             e.last_name as prepared_by_last_name,
             accounting.first_name as accounting_first_name,
             accounting.last_name as accounting_last_name,
             manager.first_name as manager_first_name,
             manager.last_name as manager_last_name
      FROM disbursement_vouchers dv
      LEFT JOIN suppliers s ON dv.supplier_id = s.id
      LEFT JOIN purchase_orders po ON dv.purchase_order_id = po.id
      LEFT JOIN purchase_requests pr ON dv.purchase_request_id = pr.id
      LEFT JOIN employees e ON dv.prepared_by = e.id
      LEFT JOIN employees accounting ON dv.certified_by_accounting = accounting.id
      LEFT JOIN employees manager ON dv.certified_by_manager = manager.id
    `;
    
    const params = [];
    
    if (req.user.role === 'engineer') {
      query += ' WHERE pr.requested_by = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY dv.created_at DESC';
    
    const [vouchers] = await db.query(query, params);
    res.json({ disbursementVouchers: vouchers });
  } catch (error) {
    console.error('Failed to fetch disbursement vouchers', error);
    res.status(500).json({ message: 'Failed to fetch disbursement vouchers' });
  }
});

// Get single Disbursement Voucher
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [vouchers] = await db.query(`
      SELECT dv.*, 
             s.supplier_name, s.address as supplier_address, s.contact_person, s.phone, s.email,
             po.po_number, po.total_amount as po_total_amount,
             pr.pr_number, pr.project_address,
             e.first_name as prepared_by_first_name,
             e.last_name as prepared_by_last_name,
             accounting.first_name as accounting_first_name,
             accounting.last_name as accounting_last_name,
             manager.first_name as manager_first_name,
             manager.last_name as manager_last_name
      FROM disbursement_vouchers dv
      LEFT JOIN suppliers s ON dv.supplier_id = s.id
      LEFT JOIN purchase_orders po ON dv.purchase_order_id = po.id
      LEFT JOIN purchase_requests pr ON dv.purchase_request_id = pr.id
      LEFT JOIN employees e ON dv.prepared_by = e.id
      LEFT JOIN employees accounting ON dv.certified_by_accounting = accounting.id
      LEFT JOIN employees manager ON dv.certified_by_manager = manager.id
      WHERE dv.id = ?
    `, [req.params.id]);

    if (vouchers.length === 0) {
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }

    // Get PO items for reference
    const [items] = await db.query(`
      SELECT poi.*, i.item_name as item_name, i.unit, i.item_code
      FROM purchase_order_items poi
      JOIN items i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = ?
    `, [vouchers[0].purchase_order_id]);

    res.json({ disbursementVoucher: { ...vouchers[0], items } });
  } catch (error) {
    console.error('Failed to fetch disbursement voucher', error);
    res.status(500).json({ message: 'Failed to fetch disbursement voucher' });
  }
});

// Create Disbursement Voucher (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { 
      purchase_order_id, 
      particulars, 
      project,
      order_number,
      check_number,
      bank_name,
      payment_date,
      received_by 
    } = req.body;
    
    // Validate required field
    if (!purchase_order_id) {
      return res.status(400).json({ message: 'Purchase Order ID is required' });
    }
    
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Get PO details with supplier and PR info
    const [pos] = await conn.query(`
      SELECT po.*, pr.pr_number, pr.project as pr_project, s.address as supplier_address
      FROM purchase_orders po
      LEFT JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `, [purchase_order_id]);
    
    if (pos.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    const po = pos[0];
    
    // Check if a DV already exists for this PO
    const [existingDVs] = await conn.query(
      'SELECT id FROM disbursement_vouchers WHERE purchase_order_id = ? AND status != ?',
      [purchase_order_id, 'Cancelled']
    );
    
    if (existingDVs.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'A disbursement voucher already exists for this purchase order' });
    }
    
    // Generate DV number (YYYY-MM-### format)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get the last DV number for this year/month
    const [lastDVs] = await conn.query(
      "SELECT dv_number FROM disbursement_vouchers WHERE dv_number LIKE ? ORDER BY dv_number DESC LIMIT 1",
      [`${year}-${month}-%`]
    );
    
    let counter = 1;
    if (lastDVs.length > 0) {
      const lastNumber = lastDVs[0].dv_number;
      const match = lastNumber.match(/-(\d{3})$/);
      if (match) {
        counter = parseInt(match[1], 10) + 1;
      }
    }
    
    const dvNumber = `${year}-${month}-${String(counter).padStart(3, '0')}`;
    
    // Create DV
    const [result] = await conn.query(
      `INSERT INTO disbursement_vouchers 
       (dv_number, purchase_order_id, purchase_request_id, supplier_id, prepared_by, 
        amount, dv_date, particulars, project, order_number, pr_number, check_number, bank_name, 
        payment_date, received_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dvNumber, 
        purchase_order_id, 
        po.purchase_request_id, 
        po.supplier_id, 
        req.user.id,
        po.total_amount,
        particulars || 'Payment for the procurement of materials',
        project || po.pr_project,
        order_number || po.order_number,
        po.pr_number,
        check_number || null,
        bank_name || null,
        payment_date || null,
        received_by || null,
        'Draft'
      ]
    );

    await conn.commit();

    res.status(201).json({ 
      message: 'Disbursement voucher created successfully', 
      dvId: result.insertId,
      dvNumber
    });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Failed to create disbursement voucher', error);
    res.status(500).json({ message: 'Failed to create disbursement voucher: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Update Disbursement Voucher (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { 
      particulars, 
      project,
      check_number,
      bank_name,
      payment_date,
      received_by,
      received_date,
      status
    } = req.body;
    
    conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Check if DV exists
    const [dvs] = await conn.query('SELECT * FROM disbursement_vouchers WHERE id = ?', [req.params.id]);
    if (dvs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }
    
    const dv = dvs[0];
    
    // Update DV
    await conn.query(
      `UPDATE disbursement_vouchers 
       SET particulars = ?, project = ?, check_number = ?, bank_name = ?, 
           payment_date = ?, received_by = ?, received_date = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        particulars || dv.particulars,
        project || dv.project,
        check_number !== undefined ? check_number : dv.check_number,
        bank_name !== undefined ? bank_name : dv.bank_name,
        payment_date || dv.payment_date,
        received_by !== undefined ? received_by : dv.received_by,
        received_date || dv.received_date,
        status || dv.status,
        req.params.id
      ]
    );

    await conn.commit();

    res.json({ message: 'Disbursement voucher updated successfully' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Failed to update disbursement voucher', error);
    res.status(500).json({ message: 'Failed to update disbursement voucher: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Certify DV by Accounting (admin with accounting role or any admin)
router.put('/:id/certify-accounting', authenticate, requireAdmin, async (req, res) => {
  try {
    const [dvs] = await db.query('SELECT * FROM disbursement_vouchers WHERE id = ?', [req.params.id]);
    if (dvs.length === 0) {
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }
    
    await db.query(
      'UPDATE disbursement_vouchers SET certified_by_accounting = ?, updated_at = NOW() WHERE id = ?',
      [req.user.id, req.params.id]
    );

    res.json({ message: 'Disbursement voucher certified by accounting' });
  } catch (error) {
    console.error('Failed to certify disbursement voucher', error);
    res.status(500).json({ message: 'Failed to certify disbursement voucher' });
  }
});

// Certify DV by Manager (super admin)
router.put('/:id/certify-manager', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [dvs] = await db.query('SELECT * FROM disbursement_vouchers WHERE id = ?', [req.params.id]);
    if (dvs.length === 0) {
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }
    
    await db.query(
      'UPDATE disbursement_vouchers SET certified_by_manager = ?, updated_at = NOW() WHERE id = ?',
      [req.user.id, req.params.id]
    );

    res.json({ message: 'Disbursement voucher certified by manager' });
  } catch (error) {
    console.error('Failed to certify disbursement voucher', error);
    res.status(500).json({ message: 'Failed to certify disbursement voucher' });
  }
});

// Mark DV as Paid (admin only)
router.put('/:id/mark-paid', authenticate, requireAdmin, async (req, res) => {
  try {
    const { check_number, bank_name, payment_date, received_by, received_date } = req.body;
    
    const [dvs] = await db.query('SELECT * FROM disbursement_vouchers WHERE id = ?', [req.params.id]);
    if (dvs.length === 0) {
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }
    
    await db.query(
      `UPDATE disbursement_vouchers 
       SET status = 'Paid', check_number = ?, bank_name = ?, payment_date = ?, 
           received_by = ?, received_date = ?, updated_at = NOW()
       WHERE id = ?`,
      [check_number, bank_name, payment_date, received_by, received_date || new Date(), req.params.id]
    );

    res.json({ message: 'Disbursement voucher marked as paid' });
  } catch (error) {
    console.error('Failed to mark disbursement voucher as paid', error);
    res.status(500).json({ message: 'Failed to mark disbursement voucher as paid' });
  }
});

// Delete/Cancel Disbursement Voucher (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const [dvs] = await db.query('SELECT * FROM disbursement_vouchers WHERE id = ?', [req.params.id]);
    if (dvs.length === 0) {
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }
    
    // Only allow deleting Draft or Pending DVs
    const dv = dvs[0];
    if (dv.status === 'Paid') {
      return res.status(400).json({ message: 'Cannot delete a paid disbursement voucher' });
    }
    
    await db.query('DELETE FROM disbursement_vouchers WHERE id = ?', [req.params.id]);

    res.json({ message: 'Disbursement voucher deleted successfully' });
  } catch (error) {
    console.error('Failed to delete disbursement voucher', error);
    res.status(500).json({ message: 'Failed to delete disbursement voucher' });
  }
});

// Export DV to Excel
router.get('/:id/export', authenticate, async (req, res) => {
  try {
    // Get DV details
    const [vouchers] = await db.query(`
      SELECT dv.*, 
             s.supplier_name, s.address as supplier_address,
             po.po_number,
             pr.pr_number,
             e.first_name as prepared_by_first_name,
             e.last_name as prepared_by_last_name,
             accounting.first_name as accounting_first_name,
             accounting.last_name as accounting_last_name,
             manager.first_name as manager_first_name,
             manager.last_name as manager_last_name
      FROM disbursement_vouchers dv
      LEFT JOIN suppliers s ON dv.supplier_id = s.id
      LEFT JOIN purchase_orders po ON dv.purchase_order_id = po.id
      LEFT JOIN purchase_requests pr ON dv.purchase_request_id = pr.id
      LEFT JOIN employees e ON dv.prepared_by = e.id
      LEFT JOIN employees accounting ON dv.certified_by_accounting = accounting.id
      LEFT JOIN employees manager ON dv.certified_by_manager = manager.id
      WHERE dv.id = ?
    `, [req.params.id]);

    if (vouchers.length === 0) {
      return res.status(404).json({ message: 'Disbursement voucher not found' });
    }

    const dv = vouchers[0];

    // Load template workbook
    const templatePath = path.join(__dirname, '..', '..', 'DISBURSEMENT VOUCHER.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Could not load worksheet from template file');
    }

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    // Fill in the data based on the template structure
    // Clear cells first to remove any placeholder values from template
    worksheet.getCell('F3').value = null;
    worksheet.getCell('F4').value = null;
    worksheet.getCell('F5').value = null;
    worksheet.getCell('F7').value = null;
    worksheet.getCell('B7').value = null;
    worksheet.getCell('B8').value = null;
    worksheet.getCell('B9').value = null;
    worksheet.getCell('B15').value = null;
    worksheet.getCell('F15').value = null;
    worksheet.getCell('B23').value = null;
    worksheet.getCell('G23').value = null;
    worksheet.getCell('B27').value = null;
    worksheet.getCell('E27').value = null;
    worksheet.getCell('F29').value = null;
    worksheet.getCell('F30').value = null;
    worksheet.getCell('F31').value = null;
    worksheet.getCell('F32').value = null;

    // F3: Date
    worksheet.getCell('F3').value = formatDate(dv.dv_date);
    
    // F3: Date
    worksheet.getCell('F3').value = formatDate(dv.dv_date);
    // F4: PR NO. value (F4 is master of merged F4:F5)
    worksheet.getCell('F4').value = dv.pr_number || '';
    // F6: Order No.
    worksheet.getCell('F6').value = dv.order_number || '';
    // F7: DV No.
    worksheet.getCell('F7').value = dv.dv_number || '';

    // B7: Payee (supplier name)
    worksheet.getCell('B7').value = dv.supplier_name || '';
    // B8: Address (supplier address)
    worksheet.getCell('B8').value = dv.supplier_address || '';
    // B9: Project
    worksheet.getCell('B9').value = dv.project || '';

    // B12-H19: Particulars section
    // B15: Particulars text
    const particularsText = dv.particulars || 'PAYMENT FOR THE PROCUREMENT OF MATERIALS';
    worksheet.getCell('B15').value = particularsText;
    
    // F15: Amount
    worksheet.getCell('F15').value = dv.amount || 0;
    worksheet.getCell('F15').numFmt = '#,##0.00';

    // B23: Accounting signature name - hardcoded as ELAINE MARICRIS AGUILAR
    worksheet.getCell('B23').value = 'ELAINE MARICRIS AGUILAR';

    // G23: Manager signature name
    const managerName = dv.manager_first_name && dv.manager_last_name
      ? `${dv.manager_first_name.toUpperCase()} ${dv.manager_last_name.toUpperCase()}`
      : '';
    worksheet.getCell('G23').value = managerName;

    // B27: Date for accounting
    worksheet.getCell('B27').value = formatDate(dv.dv_date);
    // E27: Date for manager
    worksheet.getCell('E27').value = formatDate(dv.dv_date);

    // F29: Check No.
    worksheet.getCell('F29').value = dv.check_number || '';
    // F30: Bank Name
    worksheet.getCell('F30').value = dv.bank_name || '';
    // F31: PR No.
    worksheet.getCell('F31').value = dv.pr_number || '';
    // F32: Date (payment date)
    worksheet.getCell('F32').value = formatDate(dv.payment_date);

    // Generate filename
    const filename = `DV-${dv.dv_number}-${Date.now()}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export DV error:', error);
    res.status(500).json({ message: 'Failed to export disbursement voucher: ' + error.message });
  }
});

export default router;
