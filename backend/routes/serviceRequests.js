import express from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getSuperAdmins, getAdmins } from '../utils/notifications.js';

const router = express.Router();

// Generate SR number (SRV-Initials-YYYY-MM-XXX format)
const generateSRNumber = async (user) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const firstInitial = String(user.first_name || '').charAt(0).toUpperCase();
  const middleInitial = String(user.middle_initial || '').charAt(0).toUpperCase();
  const lastInitial = String(user.last_name || '').charAt(0).toUpperCase();
  const initials = `${firstInitial}${middleInitial}${lastInitial}`;

  const [lastSRs] = await db.query(
    "SELECT sr_number FROM service_requests WHERE sr_number LIKE ? ORDER BY sr_number DESC LIMIT 1",
    [`SRV-${initials}-${year}-${month}-%`]
  );

  let counter = 1;
  if (lastSRs.length > 0) {
    const lastNumber = lastSRs[0].sr_number;
    const match = lastNumber.match(/-(\d{3})$/);
    if (match) {
      counter = parseInt(match[1], 10) + 1;
    }
  }

  return `SRV-${initials}-${year}-${month}-${String(counter).padStart(3, '0')}`;
};

// Get all Service Requests
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT sr.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             s.supplier_name,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM service_requests sr
      JOIN employees e ON sr.requested_by = e.id
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN employees approver ON sr.approved_by = approver.id
    `;
    
    const params = [];
    
    // Engineers see only their own SRs
    if (req.user.role === 'engineer') {
      query += ' WHERE sr.requested_by = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY sr.created_at DESC';
    
    const [srs] = await db.query(query, params);
    res.json({ serviceRequests: srs });
  } catch (error) {
    console.error('Fetch service requests error:', error);
    res.status(500).json({ message: 'Failed to fetch service requests: ' + error.message });
  }
});

// Get single Service Request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [srs] = await db.query(`
      SELECT sr.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             s.supplier_name, s.contact_person, s.phone, s.email, s.address as supplier_address,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM service_requests sr
      JOIN employees e ON sr.requested_by = e.id
      LEFT JOIN suppliers s ON sr.supplier_id = s.id
      LEFT JOIN employees approver ON sr.approved_by = approver.id
      WHERE sr.id = ?
    `, [req.params.id]);

    if (srs.length === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    res.json({ serviceRequest: srs[0] });
  } catch (error) {
    console.error('Fetch service request error:', error);
    res.status(500).json({ message: 'Failed to fetch service request: ' + error.message });
  }
});

// Create Service Request (engineer)
router.post('/', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, description, service_type, sr_type, project, project_address, supplier_id, amount, quantity, unit, date_needed, remarks, order_number } = req.body;

    // Validate required fields
    if (!purpose || !String(purpose).trim()) {
      return res.status(400).json({ message: 'Purpose is required' });
    }

    if (!service_type) {
      return res.status(400).json({ message: 'Service type is required' });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Validate quantity required for payment_request type
    const finalSrType = sr_type || 'payment_request';
    if (finalSrType === 'payment_request' && (!quantity || quantity <= 0)) {
      return res.status(400).json({ message: 'Valid quantity is required for Payment Request type' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const srNumber = await generateSRNumber(req.user);

    const [result] = await conn.query(
      `INSERT INTO service_requests 
       (sr_number, requested_by, purpose, description, service_type, sr_type, project, project_address, supplier_id, amount, quantity, unit, date_needed, remarks, order_number, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [srNumber, req.user.id, purpose, description || null, service_type, finalSrType, project || null, project_address || null, supplier_id || null, amount, finalSrType === 'payment_request' ? quantity : null, unit || null, date_needed || null, remarks || null, order_number || null, 'Draft']
    );

    const srId = result.insertId;

    await conn.commit();

    res.status(201).json({
      message: 'Service request created successfully',
      srId,
      sr_number: srNumber,
      status: 'Draft'
    });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Create service request error:', error);
    res.status(500).json({ message: 'Failed to create service request: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Update Service Request (Draft only, engineer only)
router.put('/:id', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, description, service_type, sr_type, project, project_address, supplier_id, amount, quantity, unit, date_needed, remarks, order_number } = req.body;

    // Check if SR exists
    const [srs] = await db.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (srs.length === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const sr = srs[0];

    // Only the original requester can update
    if (sr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can update this service request' });
    }

    // Only draft SRs can be updated
    if (sr.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft service requests can be updated' });
    }

    // Validate quantity required for payment_request type
    const finalSrType = sr_type ?? sr.sr_type ?? 'payment_request';
    if (finalSrType === 'payment_request' && amount && (!quantity || quantity <= 0)) {
      return res.status(400).json({ message: 'Valid quantity is required for Payment Request type' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `UPDATE service_requests 
       SET purpose = ?, description = ?, service_type = ?, sr_type = ?, project = ?, project_address = ?, 
           supplier_id = ?, amount = ?, quantity = ?, unit = ?, date_needed = ?, remarks = ?, order_number = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        purpose ?? sr.purpose,
        description ?? sr.description,
        service_type ?? sr.service_type,
        finalSrType,
        project || sr.project,
        project_address || sr.project_address,
        supplier_id ?? sr.supplier_id,
        amount || sr.amount,
        finalSrType === 'payment_request' ? (quantity || sr.quantity) : null,
        unit || sr.unit,
        date_needed || sr.date_needed,
        remarks ?? sr.remarks,
        order_number || sr.order_number,
        req.params.id
      ]
    );

    await conn.commit();

    res.json({ message: 'Service request updated successfully', status: 'Draft' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Update service request error:', error);
    res.status(500).json({ message: 'Failed to update service request: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Submit Service Request (Draft -> Pending)
router.put('/:id/submit', authenticate, async (req, res) => {
  let conn;
  try {
    const [srs] = await db.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (srs.length === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const sr = srs[0];

    // Only the original requester can submit
    if (sr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can submit this service request' });
    }

    // Only draft SRs can be submitted
    if (sr.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft service requests can be submitted' });
    }

    // Validate required fields
    if (!sr.purpose || !String(sr.purpose).trim()) {
      return res.status(400).json({ message: 'Purpose is required to submit' });
    }

    if (!sr.amount || sr.amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required to submit' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query(
      "UPDATE service_requests SET status = 'Pending', updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );

    await conn.commit();

    // Notify admins for approval
    const admins = await getAdmins();
    for (const adminId of admins) {
      await createNotification(
        adminId,
        'New Service Request',
        `Service Request ${sr.sr_number} has been submitted and requires your approval`,
        'PR Created',
        sr.id,
        'service_request'
      );
    }

    res.json({ message: 'Service request submitted successfully', status: 'Pending' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Submit service request error:', error);
    res.status(500).json({ message: 'Failed to submit service request: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Approve/Reject Service Request (admin/super admin)
router.put('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { status, rejection_reason } = req.body; // status: 'approved' | 'rejected'

    const [srs] = await db.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (srs.length === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const sr = srs[0];

    // Only Pending SRs can be approved/rejected
    if (sr.status !== 'Pending' && sr.status !== 'For Approval') {
      return res.status(400).json({ message: 'Service request not ready for approval' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    let newStatus;
    if (status === 'approved') {
      newStatus = 'Approved';
      await conn.query(
        'UPDATE service_requests SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?',
        [newStatus, req.user.id, req.params.id]
      );
    } else {
      newStatus = 'Rejected';
      await conn.query(
        'UPDATE service_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, rejection_reason || null, req.params.id]
      );
    }

    await conn.commit();

    // Notify engineer
    if (status === 'approved') {
      await createNotification(
        sr.requested_by,
        'Service Request Approved',
        `Your Service Request ${sr.sr_number} has been approved and is ready for PO creation`,
        'PR Approved',
        sr.id,
        'service_request'
      );
    } else {
      await createNotification(
        sr.requested_by,
        'Service Request Rejected',
        `Your Service Request ${sr.sr_number} has been rejected${rejection_reason ? ': ' + rejection_reason : ''}`,
        'PR Rejected',
        sr.id,
        'service_request'
      );
    }

    res.json({ message: `Service request ${status} successfully`, status: newStatus });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Approve service request error:', error);
    res.status(500).json({ message: 'Failed to approve service request: ' + error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Delete Service Request (Draft only, engineer only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [srs] = await db.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (srs.length === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const sr = srs[0];

    // Only the original requester can delete
    if (sr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can delete this service request' });
    }

    // Only draft SRs can be deleted
    if (sr.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft service requests can be deleted' });
    }

    await db.query('DELETE FROM service_requests WHERE id = ?', [req.params.id]);

    res.json({ message: 'Service request deleted successfully' });
  } catch (error) {
    console.error('Delete service request error:', error);
    res.status(500).json({ message: 'Failed to delete service request: ' + error.message });
  }
});

export default router;
