import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import reimbursementUpload from '../middleware/reimbursementUpload.js';
import { createNotification, getAdmins } from '../utils/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Generate RMB number (RMB-Initials-YYYY-MM-XXX format)
const generateRMBNumber = async (user) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const firstInitial = String(user.first_name || '').charAt(0).toUpperCase();
  const middleInitial = String(user.middle_initial || '').charAt(0).toUpperCase();
  const lastInitial = String(user.last_name || '').charAt(0).toUpperCase();
  const initials = `${firstInitial}${middleInitial}${lastInitial}`;

  const [last] = await db.query(
    'SELECT rmb_number FROM reimbursements WHERE rmb_number LIKE ? ORDER BY rmb_number DESC LIMIT 1',
    [`RMB-${initials}-${year}-${month}-%`]
  );

  let counter = 1;
  if (last.length > 0) {
    const lastNumber = last[0].rmb_number;
    const match = lastNumber.match(/-(\d{3})$/);
    if (match) counter = parseInt(match[1], 10) + 1;
  }

  return `RMB-${initials}-${year}-${month}-${String(counter).padStart(3, '0')}`;
};

// Get all reimbursements
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT r.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM reimbursements r
      JOIN employees e ON r.requested_by = e.id
      LEFT JOIN employees approver ON r.approved_by = approver.id
    `;

    const params = [];

    if (req.user.role === 'engineer') {
      query += ' WHERE r.requested_by = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json({ reimbursements: rows });
  } catch (error) {
    console.error('Fetch reimbursements error:', error);
    res.status(500).json({ message: 'Failed to fetch reimbursements: ' + error.message });
  }
});

// Get single reimbursement (with attachments)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT r.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM reimbursements r
      JOIN employees e ON r.requested_by = e.id
      LEFT JOIN employees approver ON r.approved_by = approver.id
      WHERE r.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const [attachments] = await db.query(
      `
      SELECT ra.*, e.first_name as uploaded_by_first_name, e.last_name as uploaded_by_last_name
      FROM reimbursement_attachments ra
      LEFT JOIN employees e ON ra.uploaded_by = e.id
      WHERE ra.reimbursement_id = ?
      ORDER BY ra.uploaded_at DESC
      `,
      [req.params.id]
    );

    res.json({ reimbursement: { ...rows[0], attachments } });
  } catch (error) {
    console.error('Fetch reimbursement error:', error);
    res.status(500).json({ message: 'Failed to fetch reimbursement: ' + error.message });
  }
});

// Create reimbursement (engineer)
router.post('/', authenticate, async (req, res) => {
  let conn;
  try {
    const { payee, purpose, project, project_address, order_number, amount, date_needed, remarks } = req.body;

    if (!payee || !String(payee).trim()) {
      return res.status(400).json({ message: 'Payee is required' });
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const rmbNumber = await generateRMBNumber(req.user);

    const [result] = await conn.query(
      `INSERT INTO reimbursements
       (rmb_number, requested_by, payee, purpose, project, project_address, order_number, amount, date_needed, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rmbNumber,
        req.user.id,
        payee,
        purpose || null,
        project || null,
        project_address || null,
        order_number || null,
        parseFloat(amount),
        date_needed || null,
        remarks || null,
        'Draft'
      ]
    );

    await conn.commit();

    res.status(201).json({
      message: 'Reimbursement created successfully',
      reimbursementId: result.insertId,
      rmb_number: rmbNumber,
      status: 'Draft'
    });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch { /* ignore */ }
    }
    console.error('Create reimbursement error:', error);
    res.status(500).json({ message: 'Failed to create reimbursement: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Update reimbursement (Draft only)
router.put('/:id', authenticate, async (req, res) => {
  let conn;
  try {
    const { payee, purpose, project, project_address, order_number, amount, date_needed, remarks } = req.body;

    const [rows] = await db.query('SELECT * FROM reimbursements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const r = rows[0];

    if (r.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can update this reimbursement' });
    }

    if (r.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft reimbursements can be updated' });
    }

    if (amount !== undefined && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `UPDATE reimbursements
       SET payee = ?, purpose = ?, project = ?, project_address = ?, order_number = ?, amount = ?, date_needed = ?, remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        payee ?? r.payee,
        purpose ?? r.purpose,
        project ?? r.project,
        project_address ?? r.project_address,
        order_number ?? r.order_number,
        amount !== undefined ? parseFloat(amount) : r.amount,
        date_needed ?? r.date_needed,
        remarks ?? r.remarks,
        req.params.id
      ]
    );

    await conn.commit();

    res.json({ message: 'Reimbursement updated successfully', status: 'Draft' });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch { /* ignore */ }
    }
    console.error('Update reimbursement error:', error);
    res.status(500).json({ message: 'Failed to update reimbursement: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Submit reimbursement (Draft -> Pending)
router.put('/:id/submit', authenticate, async (req, res) => {
  let conn;
  try {
    const [rows] = await db.query('SELECT * FROM reimbursements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const r = rows[0];

    if (r.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can submit this reimbursement' });
    }

    if (r.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft reimbursements can be submitted' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query("UPDATE reimbursements SET status = 'Pending', updated_at = NOW() WHERE id = ?", [req.params.id]);

    await conn.commit();

    const admins = await getAdmins();
    for (const adminId of admins) {
      await createNotification(
        adminId,
        'New Reimbursement Request',
        `Reimbursement ${r.rmb_number} has been submitted and requires your approval`,
        'PR Created',
        r.id,
        'reimbursement'
      );
    }

    res.json({ message: 'Reimbursement submitted successfully', status: 'Pending' });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch { /* ignore */ }
    }
    console.error('Submit reimbursement error:', error);
    res.status(500).json({ message: 'Failed to submit reimbursement: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Approve/Reject reimbursement (admin)
router.put('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { status, rejection_reason } = req.body; // 'approved' | 'rejected'

    const [rows] = await db.query('SELECT * FROM reimbursements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const r = rows[0];

    if (r.status !== 'Pending' && r.status !== 'For Approval') {
      return res.status(400).json({ message: 'Reimbursement not ready for approval' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    let newStatus;
    if (status === 'approved') {
      newStatus = 'Approved';
      await conn.query(
        'UPDATE reimbursements SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?',
        [newStatus, req.user.id, req.params.id]
      );
    } else {
      newStatus = 'Rejected';
      await conn.query(
        'UPDATE reimbursements SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, rejection_reason || null, req.params.id]
      );
    }

    await conn.commit();

    if (status === 'approved') {
      await createNotification(
        r.requested_by,
        'Reimbursement Approved',
        `Your Reimbursement ${r.rmb_number} has been approved`,
        'PR Approved',
        r.id,
        'reimbursement'
      );
    } else {
      await createNotification(
        r.requested_by,
        'Reimbursement Rejected',
        `Your Reimbursement ${r.rmb_number} has been rejected${rejection_reason ? ': ' + rejection_reason : ''}`,
        'PR Rejected',
        r.id,
        'reimbursement'
      );
    }

    res.json({ message: `Reimbursement ${status} successfully`, status: newStatus });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch { /* ignore */ }
    }
    console.error('Approve reimbursement error:', error);
    res.status(500).json({ message: 'Failed to approve reimbursement: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// List attachments
router.get('/:id/attachments', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, requested_by FROM reimbursements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const r = rows[0];
    if (req.user.role === 'engineer' && r.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [attachments] = await db.query(
      `
      SELECT ra.*, e.first_name as uploaded_by_first_name, e.last_name as uploaded_by_last_name
      FROM reimbursement_attachments ra
      LEFT JOIN employees e ON ra.uploaded_by = e.id
      WHERE ra.reimbursement_id = ?
      ORDER BY ra.uploaded_at DESC
      `,
      [req.params.id]
    );

    res.json({ attachments });
  } catch (error) {
    console.error('List reimbursement attachments error:', error);
    res.status(500).json({ message: 'Failed to list attachments: ' + error.message });
  }
});

// Upload liquidation attachments (multiple)
router.post('/:id/attachments', authenticate, reimbursementUpload.array('files', 10), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reimbursements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const r = rows[0];

    // Only requester or admins can upload
    if (req.user.role === 'engineer' && r.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can upload attachments' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploaded = [];

    for (const file of req.files) {
      const [result] = await db.query(
        `INSERT INTO reimbursement_attachments (reimbursement_id, file_path, file_name, file_size, mime_type, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.params.id,
          `/uploads/reimbursements/${file.filename}`,
          file.originalname,
          file.size,
          file.mimetype,
          req.user.id
        ]
      );

      uploaded.push({
        id: result.insertId,
        file_path: `/uploads/reimbursements/${file.filename}`,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.id
      });
    }

    res.status(201).json({ message: 'Attachments uploaded successfully', attachments: uploaded });
  } catch (error) {
    console.error('Upload reimbursement attachments error:', error);
    res.status(500).json({ message: 'Failed to upload attachments: ' + error.message });
  }
});

// Delete a single attachment (admin/super_admin or uploader)
router.delete('/:id/attachments/:attachmentId', authenticate, async (req, res) => {
  try {
    const [attachments] = await db.query(
      'SELECT * FROM reimbursement_attachments WHERE id = ? AND reimbursement_id = ?',
      [req.params.attachmentId, req.params.id]
    );

    if (attachments.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = attachments[0];

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isUploader = attachment.uploaded_by === req.user.id;

    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove file from disk
    try {
      const uploadsDir = path.resolve(__dirname, '../uploads/reimbursements');
      const fileName = path.basename(attachment.file_path || '');
      const filePath = path.resolve(uploadsDir, fileName);

      if (filePath.startsWith(uploadsDir) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.log('File may not exist on disk:', err.message);
    }

    await db.query('DELETE FROM reimbursement_attachments WHERE id = ?', [attachment.id]);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete reimbursement attachment error:', error);
    res.status(500).json({ message: 'Failed to delete attachment: ' + error.message });
  }
});

// Delete reimbursement (Draft only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reimbursements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reimbursement not found' });
    }

    const r = rows[0];

    if (r.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can delete this reimbursement' });
    }

    if (r.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft reimbursements can be deleted' });
    }

    await db.query('DELETE FROM reimbursements WHERE id = ?', [req.params.id]);

    res.json({ message: 'Reimbursement deleted successfully' });
  } catch (error) {
    console.error('Delete reimbursement error:', error);
    res.status(500).json({ message: 'Failed to delete reimbursement: ' + error.message });
  }
});

export default router;
