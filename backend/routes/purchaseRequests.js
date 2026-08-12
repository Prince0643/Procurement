import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireProcurement, requireSuperAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { createNotification, getProcurementOfficers, getSuperAdmins, getEngineers, getReviewersForPR } from '../utils/notifications.js';
import ExcelJS from 'exceljs';
import { resolveExcelTemplatePath } from '../utils/excelTemplatePath.js';
import { assertProjectIsActive } from '../utils/branchProjects.js';
import { assertOrderNumberUnlocked } from '../utils/orderNumberLocks.js';

const router = express.Router();

// Configure multer for PR accreditation file uploads
const prAccreditationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/pr-accreditation';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const prAccreditationUpload = multer({
  storage: prAccreditationStorage,
  limits: { fileSize: Infinity } // No file size limit as requested
});
const normalizePaymentTermsNote = (note) => {
  const normalized = note == null ? '' : String(note).trim();
  return normalized || null;
};
const normalizeSupplierName = (name) => {
  const normalized = name == null ? '' : String(name).trim();
  return normalized || null;
};
const createInputError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const roundMoney = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
};

const sumScheduleAmounts = (schedules = []) => {
  return roundMoney(
    schedules.reduce((sum, schedule) => {
      const amount = Number(schedule?.amount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0)
  );
};

const normalizePaymentSchedules = (paymentSchedules) => {
  if (paymentSchedules == null) return [];
  if (!Array.isArray(paymentSchedules)) {
    throw createInputError('payment_schedules must be an array');
  }

  const seenDates = new Set();
  const normalized = paymentSchedules.map((entry, index) => {
    const paymentDate = String(entry?.payment_date || '').trim();
    if (!paymentDate) {
      throw createInputError(`payment_schedules[${index}].payment_date is required`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      throw createInputError(`payment_schedules[${index}].payment_date must be YYYY-MM-DD`);
    }

    const parsedDate = new Date(`${paymentDate}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== paymentDate) {
      throw createInputError(`payment_schedules[${index}].payment_date is invalid`);
    }

    if (seenDates.has(paymentDate)) {
      throw createInputError(`Duplicate payment date found: ${paymentDate}`);
    }
    seenDates.add(paymentDate);

    const note = entry?.note == null ? null : String(entry.note).trim() || null;
    let amount = null;
    if (entry?.amount != null && entry.amount !== '') {
      const numericAmount = Number(entry.amount);
      if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        throw createInputError(`payment_schedules[${index}].amount must be a non-negative number`);
      }
      amount = Number(numericAmount.toFixed(2));
    }

    return {
      payment_date: paymentDate,
      amount,
      note
    };
  });

  return normalized.sort((a, b) => a.payment_date.localeCompare(b.payment_date));
};

const replacePaymentSchedules = async (conn, purchaseRequestId, schedules, employeeId) => {
  await conn.query(
    'DELETE FROM purchase_request_payment_schedules WHERE purchase_request_id = ?',
    [purchaseRequestId]
  );

  if (!schedules.length) return;

  for (const schedule of schedules) {
    await conn.query(
      `INSERT INTO purchase_request_payment_schedules
      (purchase_request_id, payment_date, amount, note, created_by)
      VALUES (?, ?, ?, ?, ?)`,
      [purchaseRequestId, schedule.payment_date, schedule.amount, schedule.note, employeeId]
    );
  }
};

const getPaymentScheduleCount = async (conn, purchaseRequestId) => {
  const [rows] = await conn.query(
    'SELECT COUNT(*) AS count FROM purchase_request_payment_schedules WHERE purchase_request_id = ?',
    [purchaseRequestId]
  );
  return rows[0]?.count || 0;
};

const getExistingPaymentSchedules = async (conn, purchaseRequestId) => {
  const [rows] = await conn.query(
    'SELECT DATE_FORMAT(payment_date, "%Y-%m-%d") AS payment_date, amount, note FROM purchase_request_payment_schedules WHERE purchase_request_id = ?',
    [purchaseRequestId]
  );
  return rows || [];
};

const assertPaymentScheduleTotalsMatch = ({ paymentBasis, schedules, totalAmount }) => {
  if (paymentBasis !== 'debt') return;

  const schedulesTotal = sumScheduleAmounts(schedules);
  const prTotal = roundMoney(totalAmount);
  if (schedulesTotal !== prTotal) {
    throw createInputError(`Payment schedule total (${schedulesTotal.toFixed(2)}) must match PR total (${prTotal.toFixed(2)}).`);
  }
};

// Check supplier accreditation status with fuzzy matching
router.get('/check-supplier-accreditation/:supplierName', authenticate, async (req, res) => {
  try {
    const supplierName = decodeURIComponent(req.params.supplierName);
    const normalizedInput = supplierName.trim().toLowerCase();

    // Fuzzy match against suppliers table
    const [suppliers] = await db.query(`
      SELECT id, supplier_name, accredited, accreditation_files, address
      FROM suppliers
      WHERE LOWER(supplier_name) LIKE ?
      ORDER BY
        CASE
          WHEN LOWER(supplier_name) = ? THEN 1
          WHEN LOWER(supplier_name) LIKE ? THEN 2
          WHEN LOWER(supplier_name) LIKE ? THEN 3
          ELSE 4
        END,
        LENGTH(supplier_name) ASC
      LIMIT 5
    `, [`%${normalizedInput}%`, normalizedInput, `${normalizedInput}%`, `%${normalizedInput}%`]);

    if (suppliers.length === 0) {
      return res.json({
        found: false,
        accredited: false,
        supplierId: null,
        supplierName: null,
        accreditationFiles: [],
        message: 'Supplier not found in database'
      });
    }

    // Use the best match (first result due to ORDER BY)
    const bestMatch = suppliers[0];
    let accreditationFiles = [];
    if (bestMatch.accreditation_files) {
      try {
        accreditationFiles = JSON.parse(bestMatch.accreditation_files);
      } catch (e) {
        accreditationFiles = [];
      }
    }

    res.json({
      found: true,
      accredited: bestMatch.accredited === 1,
      supplierId: bestMatch.id,
      supplierName: bestMatch.supplier_name,
      suggestedName: bestMatch.supplier_name !== supplierName ? bestMatch.supplier_name : null,
      accreditationFiles,
      address: bestMatch.address
    });
  } catch (error) {
    console.error('Check supplier accreditation error:', error);
    res.status(500).json({ message: 'Failed to check supplier accreditation: ' + error.message });
  }
});

// Get all PRs (filtered by user role)
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const { view } = req.query;
    const q = String(req.query.q || '').trim();
    const pendingReview = req.query.pending_review === 'true';

    const statusesRaw = req.query.status;
    const statuses = Array.isArray(statusesRaw)
      ? statusesRaw
      : (typeof statusesRaw === 'string' && statusesRaw.length > 0)
        ? statusesRaw.split(',')
        : [];
    const normalizedStatuses = statuses
      .map((s) => String(s || '').trim())
      .filter(Boolean);

    let baseFrom = `
      FROM purchase_requests pr
      JOIN employees e ON pr.requested_by = e.id
      LEFT JOIN suppliers s ON pr.supplier_id = s.id
    `;

    const whereClauses = [];
    const whereParams = [];

    // Filter for pending reviews for current user
    if (pendingReview) {
      console.log('🔍 Fetching pending reviews for user:', req.user.id, 'role:', req.user.role);
      baseFrom = `
        FROM purchase_requests pr
        JOIN employees e ON pr.requested_by = e.id
        LEFT JOIN suppliers s ON pr.supplier_id = s.id
        JOIN purchase_request_reviews prr ON pr.id = prr.purchase_request_id
      `;
      whereClauses.push('prr.reviewer_id = ?');
      whereClauses.push('prr.review_status = ?');
      whereParams.push(req.user.id, 'pending');
      console.log('🔍 Pending review query params:', { userId: req.user.id, reviewStatus: 'pending' });
    }

    // Engineers see only their own PRs by default, but can view all with ?view=all
    if (req.user.role === 'engineer' && view !== 'all' && !pendingReview) {
      whereClauses.push('pr.requested_by = ?');
      whereParams.push(req.user.id);
    }

    if (normalizedStatuses.length > 0) {
      whereClauses.push(`pr.status IN (${normalizedStatuses.map(() => '?').join(', ')})`);
      whereParams.push(...normalizedStatuses);
    }

    if (q) {
      const like = `%${q}%`;
      whereClauses.push(`(
        pr.pr_number LIKE ?
        OR pr.project LIKE ?
        OR CONCAT(e.first_name, ' ', e.last_name) LIKE ?
        OR pr.supplier_name LIKE ?
        OR s.supplier_name LIKE ?
      )`);
      whereParams.push(like, like, like, like, like);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const listQuery = `
      SELECT pr.*, 
             e.first_name as requester_first_name, 
             e.last_name as requester_last_name,
             COALESCE(pr.supplier_name, s.supplier_name) as supplier_name,
             COALESCE(pr.supplier_name, s.supplier_name) as payee_name,
             COALESCE(pr.supplier_address, s.address) as payee_address,
             (SELECT COUNT(*) FROM purchase_request_payment_schedules prs WHERE prs.purchase_request_id = pr.id) as payment_schedule_count,
             (SELECT MIN(prs.payment_date) FROM purchase_request_payment_schedules prs WHERE prs.purchase_request_id = pr.id) as next_payment_date
      ${baseFrom}
      ${whereSql}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      ${baseFrom}
      ${whereSql}
    `;

    const [prs] = await db.query(listQuery, [...whereParams, pageSize, offset]);
    const [countRows] = await db.query(countQuery, whereParams);

    res.json({
      purchaseRequests: prs,
      page,
      pageSize,
      total: countRows?.[0]?.total ?? 0
    });

    if (pendingReview) {
      console.log('🔍 Pending review results:', prs.length, 'PRs found');
      console.log('🔍 PR IDs:', prs.map(r => ({ id: r.id, pr_number: r.pr_number, status: r.status })));
    }
  } catch (error) {
    console.error('Fetch purchase requests error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase requests: ' + error.message });
  }
});

// Get single PR with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    // 70-84
    const [prs] = await db.query(`
	      SELECT pr.*, 
	             e.first_name as requester_first_name, 
	             e.last_name as requester_last_name,
	             e.role as requester_role,
	             approver.first_name as approver_first_name,
	             approver.last_name as approver_last_name,
	             COALESCE(pr.supplier_name, s.supplier_name) as supplier_name,
	             COALESCE(pr.supplier_name, s.supplier_name) as payee_name,
	             COALESCE(pr.supplier_address, s.address) as payee_address,
	             s.address as supplier_address,
	             engineer_selected.supplier_name as engineer_supplier_name
	      FROM purchase_requests pr
	      JOIN employees e ON pr.requested_by = e.id
	      LEFT JOIN employees approver ON pr.approved_by = approver.id
	      LEFT JOIN suppliers s ON pr.supplier_id = s.id
	      LEFT JOIN suppliers engineer_selected ON pr.supplier_id = engineer_selected.id
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

    const [paymentSchedules] = await db.query(`
      SELECT id, purchase_request_id, DATE_FORMAT(payment_date, '%Y-%m-%d') as payment_date, amount, note, created_by, created_at, updated_at
      FROM purchase_request_payment_schedules
      WHERE purchase_request_id = ?
      ORDER BY payment_date ASC
    `, [req.params.id]);

    const [paidDvRows] = await db.query(`
      SELECT amount
      FROM disbursement_vouchers
      WHERE purchase_request_id = ? AND status = 'Paid'
    `, [req.params.id]);

    const formatDateLabel = (ymd) => {
      if (!ymd) return '-';
      const date = new Date(`${ymd}T00:00:00`);
      return Number.isNaN(date.getTime()) ? ymd : date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const today = new Date();
    const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let paymentReviewNote = 'No payment schedules set';
    if (paymentSchedules.length > 0) {
      let remainingPaid = paidDvRows.reduce((sum, row) => {
        const amount = Number(row?.amount);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0);

      const schedules = paymentSchedules.map((schedule) => ({
        payment_date: String(schedule.payment_date || '').trim(),
        amount: Number.isFinite(Number(schedule.amount)) && Number(schedule.amount) > 0 ? Number(schedule.amount) : 0
      }));

      const paidFlags = schedules.map(() => false);
      for (let index = 0; index < schedules.length; index += 1) {
        const scheduleAmount = schedules[index].amount;
        if (remainingPaid >= scheduleAmount) {
          paidFlags[index] = true;
          remainingPaid -= scheduleAmount;
        } else {
          break;
        }
      }

      if (!paidFlags[0]) {
        const firstDate = schedules[0].payment_date;
        paymentReviewNote = firstDate < todayYmd
          ? `First payment is not paid — OVERDUE: ${formatDateLabel(firstDate)}`
          : `First payment is not paid — UPCOMING: ${formatDateLabel(firstDate)}`;
      } else {
        const nextUpcomingUnpaidIndex = schedules.findIndex((schedule, index) => !paidFlags[index] && schedule.payment_date >= todayYmd);
        if (nextUpcomingUnpaidIndex !== -1) {
          paymentReviewNote = `Next upcoming payment: ${formatDateLabel(schedules[nextUpcomingUnpaidIndex].payment_date)}`;
        } else if (paidFlags.every(Boolean)) {
          paymentReviewNote = 'All scheduled payments are paid';
        } else {
          const firstUnpaidIndex = paidFlags.findIndex((paid) => !paid);
          if (firstUnpaidIndex !== -1) {
            paymentReviewNote = `First unpaid payment is overdue: ${formatDateLabel(schedules[firstUnpaidIndex].payment_date)}`;
          }
        }
      }
    }

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

    // Get review records for this PR
    const [reviews] = await db.query(`
      SELECT prr.*, 
             e.first_name as reviewer_first_name, 
             e.last_name as reviewer_last_name,
             e.role as reviewer_role,
             e.is_active as reviewer_is_active
      FROM purchase_request_reviews prr
      JOIN employees e ON prr.reviewer_id = e.id
      WHERE prr.purchase_request_id = ?
        AND e.is_active = 1
      ORDER BY prr.created_at ASC
    `, [req.params.id]);

    res.json({ purchaseRequest: { ...pr, items: itemsWithRemarks, payment_schedules: paymentSchedules, payment_review_note: paymentReviewNote, reviews } });
  } catch (error) {
    console.error('Fetch purchase request error:', error);
    res.status(500).json({ message: 'Failed to fetch purchase request: ' + error.message });
  }
});

// Create PR (engineer)
router.post('/', authenticate, prAccreditationUpload.array('accreditation_files', 5), async (req, res) => {
  let conn;
  try {
    console.log('📥 Received PR creation request');
    console.log('📦 Request body keys:', Object.keys(req.body));
    console.log('📦 Files received:', req.files?.length || 0);

    const { purpose, remarks, items, date_needed, project, project_address, order_number, save_as_draft, payment_basis, payment_terms_note, supplier_id, supplier_name, payment_schedules } = req.body;

    // Parse JSON strings from FormData
    let parsedItems = items;
    let parsedPaymentSchedules = payment_schedules;

    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
        console.log('✅ Parsed items:', parsedItems);
      } catch (e) {
        console.error('Failed to parse items:', e);
        parsedItems = [];
      }
    }

    if (typeof payment_schedules === 'string') {
      try {
        parsedPaymentSchedules = JSON.parse(payment_schedules);
        console.log('✅ Parsed payment_schedules:', parsedPaymentSchedules);
      } catch (e) {
        console.error('Failed to parse payment_schedules:', e);
        parsedPaymentSchedules = [];
      }
    }

    await assertProjectIsActive(project, { providedOrderNumber: order_number });
    const isDraft = save_as_draft === true;

    // Only validate required fields if NOT saving as draft
    if (!isDraft) {
      if (!purpose || !String(purpose).trim()) {
        return res.status(400).json({ message: 'Purpose is required' });
      }

      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }
    }

    conn = await db.getConnection();
    await conn.beginTransaction();
    // 147-148

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Get the last PR number for this year/month (without initials)
    const [lastPrs] = await conn.query(
      "SELECT pr_number FROM purchase_requests WHERE pr_number LIKE ? ORDER BY pr_number DESC LIMIT 1",
      [`${year}-%`]  // This looks for year only
    );

    let counter = 1;
    if (lastPrs.length > 0) {
      const lastNumber = lastPrs[0].pr_number;
      const match = lastNumber.match(/-(\d{3})$/);
      if (match) {
        counter = parseInt(match[1], 10) + 1;
      }
    }

    const prNumber = `${year}-${month}-${String(counter).padStart(3, '0')}`;

    // Determine status based on requester role
    let status;
    if (isDraft) {
      status = 'Draft';
    } else if (req.user.role === 'engineer') {
      status = 'For Engineer Review';
    } else if (req.user.role === 'admin') {
      status = 'For Admin Review';
    } else if (req.user.role === 'procurement') {
      status = 'For Procurement Review';
    } else {
      status = 'For Super Admin Final Approval';
    }

    const paymentBasis = payment_basis === 'non_debt' ? 'non_debt' : 'debt';
    const paymentTermsNote = normalizePaymentTermsNote(payment_terms_note);
    const paymentTermsCode = paymentTermsNote ? 'CUSTOM' : null;
    const freeTextSupplierName = normalizeSupplierName(supplier_name);
    const normalizedPaymentSchedules = normalizePaymentSchedules(parsedPaymentSchedules);

    // Handle accreditation files and check supplier accreditation status
    const accreditationFiles = req.files || [];
    let supplierAccredited = null;
    let matchedSupplierId = supplier_id || null;

    // Check supplier accreditation status if supplier name is provided
    if (freeTextSupplierName && !isDraft) {
      const normalizedSupplierName = freeTextSupplierName.trim().toLowerCase();
      const [supplierCheck] = await conn.query(`
        SELECT id, accredited
        FROM suppliers
        WHERE LOWER(supplier_name) = ?
        LIMIT 1
      `, [normalizedSupplierName]);

      if (supplierCheck.length > 0) {
        supplierAccredited = supplierCheck[0].accredited === 1 ? 1 : 0;
        matchedSupplierId = supplierCheck[0].id;

        // If supplier is not accredited, set status to Pending Accreditation Review
        if (supplierAccredited === 0) {
          status = 'Pending Accreditation Review';
        }
      } else {
        supplierAccredited = 0; // Supplier not in database = not accredited
        status = 'Pending Accreditation Review';
      }
    }

    // Process accreditation files
    let accreditationFilesJson = null;
    if (accreditationFiles.length > 0) {
      const processedFiles = accreditationFiles.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploaded_at: new Date().toISOString()
      }));
      accreditationFilesJson = JSON.stringify(processedFiles);

      // If supplier exists in database, also link files to supplier record
      if (matchedSupplierId) {
        const [existingSupplierFiles] = await conn.query(
          'SELECT accreditation_files FROM suppliers WHERE id = ?',
          [matchedSupplierId]
        );

        let supplierFiles = [];
        if (existingSupplierFiles[0]?.accreditation_files) {
          try {
            supplierFiles = JSON.parse(existingSupplierFiles[0].accreditation_files);
          } catch (e) {
            supplierFiles = [];
          }
        }

        const updatedSupplierFiles = [...supplierFiles, ...processedFiles];
        await conn.query(
          'UPDATE suppliers SET accreditation_files = ? WHERE id = ?',
          [JSON.stringify(updatedSupplierFiles), matchedSupplierId]
        );
      }
    }

    if (!isDraft && paymentBasis === 'debt' && normalizedPaymentSchedules.length === 0) {
      return res.status(400).json({ message: 'At least one payment schedule is required for debt/with account PR.' });
    }

    const normalizedItems = Array.isArray(parsedItems)
      ? parsedItems.map((item) => {
        const itemId = item.item_id ?? item.id;
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unit_price ?? item.estimated_unit_price ?? 0);
        const totalPrice = quantity * unitPrice;

        if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('Invalid item payload: each item requires item_id (or id) and quantity > 0');
        }

        return {
          itemId,
          quantity,
          unitPrice,
          totalPrice,
          remarks: item.remarks ?? item.notes ?? null
        }
      })
      : [];

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    assertPaymentScheduleTotalsMatch({
      paymentBasis,
      schedules: normalizedPaymentSchedules,
      totalAmount
    });

    let supplierAddress = null;

    // First, check if supplier_address was provided directly in the request
    if (req.body.supplier_address && String(req.body.supplier_address).trim()) {
      supplierAddress = String(req.body.supplier_address).trim();
      console.log('✅ Using supplier_address from request:', supplierAddress);
    }

    // If no direct address but supplier_id exists, get address from suppliers table
    if (!supplierAddress && supplier_id) {
      const [supRows] = await conn.query(
        'SELECT address from suppliers WHERE id = ? LIMIT 1',
        [supplier_id]
      );

      if (supRows.length === 0) {
        throw new Error('Invalid supplier_id; supplier not found');
      }

      supplierAddress = supRows[0].address ?? null;
      console.log('✅ Using address from suppliers table:', supplierAddress);
    }

    console.log('🎯 FINAL supplierAddress being saved:', supplierAddress);

    // 200-218
    const [result] = await conn.query(
      `INSERT INTO purchase_requests
      (pr_number, requested_by, purpose, remarks, status, date_needed, project, project_address, order_number, payment_basis, payment_terms_code, payment_terms_note, payment_terms_set_by, payment_terms_set_at, supplier_id, supplier_name, supplier_address, total_amount, accreditation_files, supplier_accredited)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prNumber,
        req.user.id,
        purpose || '',
        remarks ?? '',
        status,
        date_needed || null,
        project || null,
        project_address || null,
        order_number || null,
        paymentBasis,
        paymentTermsCode,
        paymentTermsNote,
        paymentTermsNote ? req.user.id : null,
        paymentTermsNote ? new Date() : null,
        supplier_id || null,
        freeTextSupplierName,
        supplierAddress,
        totalAmount,
        accreditationFilesJson,
        supplierAccredited
      ]
    );

    const prId = result.insertId;

    if (normalizedItems.length > 0) {
      for (const item of normalizedItems) {
        await conn.query(
          'INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, unit_price, total_price, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [prId, item.itemId, item.quantity, item.unitPrice, item.totalPrice, item.remarks]
        );
      }
    }

    await replacePaymentSchedules(conn, prId, normalizedPaymentSchedules, req.user.id);

    // Create review records for all required reviewers if NOT a draft
    if (!isDraft) {
      const reviewers = await getReviewersForPR(req.user.role);
      console.log('🔍 Reviewers for PR (before filtering):', reviewers);
      console.log('🔍 Requester ID:', req.user.id);

      // Filter out the requester themselves
      const filteredReviewers = reviewers.filter(reviewerId => reviewerId !== req.user.id);
      console.log('🔍 Reviewers for PR (after filtering):', filteredReviewers);

      // Create review records
      for (const reviewerId of filteredReviewers) {
        await conn.query(
          'INSERT INTO purchase_request_reviews (purchase_request_id, reviewer_id, review_status) VALUES (?, ?, ?)',
          [prId, reviewerId, 'pending']
        );
      }

      console.log('✅ Created review records for PR:', prId, 'with reviewers:', filteredReviewers);

      // Send notifications to all reviewers (excluding requester)
      for (const reviewerId of filteredReviewers) {
        await createNotification(
          reviewerId,
          'New PR Created',
          `Purchase Request ${prNumber} has been created and is ready for your review`,
          'PR Created',
          prId,
          'purchase_request'
        );
      }
    }

    await conn.commit();

    res.status(201).json({
      message: isDraft ? 'Draft saved successfully' : 'Purchase request created successfully',
      prId,
      pr_number: prNumber,
      status: status,
      payment_basis: paymentBasis,
      payment_terms_code: paymentTermsCode,
      payment_terms_note: paymentTermsNote,
      supplier_name: freeTextSupplierName,
      payment_schedules: normalizedPaymentSchedules
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
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: statusCode === 500 ? 'Failed to create purchase request: ' + error.message : error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Update Draft PR (engineer only)
router.put('/:id/draft', authenticate, async (req, res) => {
  let conn;
  try {
    const { purpose, remarks, items, date_needed, project, project_address, order_number, payment_basis, payment_terms_note, supplier_id, supplier_name, payment_schedules } = req.body;
    await assertProjectIsActive(project, { providedOrderNumber: order_number });

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

    const normalizedItems = Array.isArray(items)
      ? items.map((item) => {
        const itemId = item.item_id ?? item.id;
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unit_price ?? item.estimated_unit_price ?? 0);
        const totalPrice = quantity * unitPrice;

        if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('Invalid item payload: each item requires item_id (or id) and quantity > 0');
        }

        return {
          itemId,
          quantity,
          unitPrice,
          totalPrice,
          remarks: item.remarks ?? item.notes ?? null
        };
      })
      : [];

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    let supplierAddress = null;
    const effectiveSupplierId = supplier_id ?? pr.supplier_id;

    if (effectiveSupplierId) {
      const [supRows] = await conn.query(
        'SELECT address FROM suppliers WHERE id = ? LIMIT 1',
        [effectiveSupplierId]
      );

      if (supRows.length === 0) {
        throw new Error('Invalid supplier_id: supplier not found');
      }

      supplierAddress = supRows[0].address ?? null;
    }

    const nextPaymentBasis = payment_basis ?? pr.payment_basis;
    const nextPaymentTermsNote = normalizePaymentTermsNote(payment_terms_note ?? pr.payment_terms_note);
    const nextPaymentTermsCode = nextPaymentTermsNote ? 'CUSTOM' : null;
    const nextSupplierName = hasOwn(req.body, 'supplier_name')
      ? normalizeSupplierName(supplier_name)
      : pr.supplier_name;
    const hasPaymentSchedulesField = hasOwn(req.body, 'payment_schedules');
    const normalizedPaymentSchedules = hasPaymentSchedulesField ? normalizePaymentSchedules(payment_schedules) : null;
    const schedulesForValidation = hasPaymentSchedulesField
      ? normalizedPaymentSchedules
      : await getExistingPaymentSchedules(conn, req.params.id);
    assertPaymentScheduleTotalsMatch({
      paymentBasis: nextPaymentBasis,
      schedules: schedulesForValidation,
      totalAmount
    });

    // Update PR details
    await conn.query(
      `UPDATE purchase_requests 
       SET purpose = ?, remarks = ?, date_needed = ?, project = ?, project_address = ?, order_number = ?, payment_basis = ?,
           payment_terms_code = ?, payment_terms_note = ?, payment_terms_set_by = ?, payment_terms_set_at = ?,
           supplier_id = ?, supplier_name = ?, supplier_address = ?, total_amount = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        purpose ?? pr.purpose,
        remarks ?? pr.remarks,
        date_needed || pr.date_needed,
        project || pr.project,
        project_address || pr.project_address,
        order_number || pr.order_number,
        nextPaymentBasis,
        nextPaymentTermsCode,
        nextPaymentTermsNote,
        nextPaymentTermsNote ? req.user.id : null,
        nextPaymentTermsNote ? new Date() : null,
        supplier_id ?? pr.supplier_id,
        nextSupplierName,
        supplierAddress,
        totalAmount,
        req.params.id
      ]
    );

    // Update items if provided
    if (normalizedItems.length > 0) {
      await conn.query('DELETE FROM purchase_request_items WHERE purchase_request_id = ?', [req.params.id]);

      for (const item of normalizedItems) {
        await conn.query(
          'INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, unit_price, total_price, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.id, item.itemId, item.quantity, item.unitPrice, item.totalPrice, item.remarks]
        );
      }
    }

    if (hasPaymentSchedulesField) {
      await replacePaymentSchedules(conn, req.params.id, normalizedPaymentSchedules, req.user.id);
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
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: statusCode === 500 ? 'Failed to update draft: ' + error.message : error.message });
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
    if (pr.payment_basis === 'debt') {
      const scheduleCount = await getPaymentScheduleCount(db, req.params.id);
      if (scheduleCount === 0) {
        return res.status(400).json({ message: 'At least one payment schedule is required for debt/with account PR.' });
      }
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

    // Determine new status based on requester role
    let newStatus;
    if (req.user.role === 'engineer') {
      newStatus = 'For Engineer Review';
    } else if (req.user.role === 'admin') {
      newStatus = 'For Admin Review';
    } else if (req.user.role === 'procurement') {
      newStatus = 'For Procurement Review';
    } else {
      newStatus = 'For Super Admin Final Approval';
    }

    // Update status
    await conn.query(
      "UPDATE purchase_requests SET status = ?, updated_at = NOW() WHERE id = ?",
      [newStatus, req.params.id]
    );

    // Create review records for all required reviewers
    const reviewers = await getReviewersForPR(req.user.role);

    // Filter out the requester themselves
    const filteredReviewers = reviewers.filter(reviewerId => reviewerId !== req.user.id);

    for (const reviewerId of filteredReviewers) {
      await conn.query(
        'INSERT INTO purchase_request_reviews (purchase_request_id, reviewer_id, review_status) VALUES (?, ?, ?)',
        [req.params.id, reviewerId, 'pending']
      );
    }

    await conn.commit();

    // Send notifications to all reviewers (excluding requester)
    for (const reviewerId of filteredReviewers) {
      await createNotification(
        reviewerId,
        'New PR Created',
        `Purchase Request ${pr.pr_number} has been created and is ready for your review`,
        'PR Created',
        pr.id,
        'purchase_request'
      );
    }

    // Emit real-time PR update
    req.io.to('role_procurement').emit('pr_updated', {
      id: pr.id,
      pr_number: pr.pr_number,
      status: newStatus,
      type: 'new_pr'
    });

    res.json({ message: 'Draft submitted successfully', status: newStatus });
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

// Review PR (for Engineers, Admins, Procurement)
router.post('/:id/review', authenticate, async (req, res) => {
  let conn;
  try {
    const { review_status, review_comment } = req.body;

    if (!review_status || !['approved', 'rejected'].includes(review_status)) {
      return res.status(400).json({ message: 'Invalid review status. Must be approved or rejected.' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Get PR and check if user is a reviewer
    const [prs] = await conn.query(
      'SELECT pr.*, e.role as requester_role FROM purchase_requests pr JOIN employees e ON pr.requested_by = e.id WHERE pr.id = ?',
      [req.params.id]
    );

    if (prs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];

    // Check if user is a reviewer for this PR
    const [reviewCheck] = await conn.query(
      'SELECT * FROM purchase_request_reviews WHERE purchase_request_id = ? AND reviewer_id = ?',
      [req.params.id, req.user.id]
    );

    if (reviewCheck.length === 0) {
      await conn.rollback();
      return res.status(403).json({ message: 'You are not authorized to review this PR' });
    }

    // Check if already reviewed
    if (reviewCheck[0].review_status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'You have already reviewed this PR' });
    }

    // Validate that user's role matches the current status
    const currentStatus = pr.status;
    const userRole = req.user.role;

    if (currentStatus === 'For Engineer Review' && userRole !== 'engineer') {
      await conn.rollback();
      return res.status(403).json({ message: 'This purchase request is currently awaiting Engineer review. You do not have permission to review at this stage.' });
    }

    if (currentStatus === 'For Admin Review' && userRole !== 'admin') {
      await conn.rollback();
      return res.status(403).json({ message: 'This purchase request is currently awaiting Admin review. You do not have permission to review at this stage.' });
    }

    if (currentStatus === 'For Procurement Review' && userRole !== 'procurement') {
      await conn.rollback();
      return res.status(403).json({ message: 'This purchase request is currently awaiting Procurement review. You do not have permission to review at this stage.' });
    }

    if (currentStatus === 'For Super Admin Final Approval' && userRole !== 'super_admin') {
      await conn.rollback();
      return res.status(403).json({ message: 'This purchase request is currently awaiting Super Admin final approval. You do not have permission to review at this stage.' });
    }

    // Update review record
    await conn.query(
      'UPDATE purchase_request_reviews SET review_status = ?, review_comment = ?, reviewed_at = NOW() WHERE purchase_request_id = ? AND reviewer_id = ?',
      [review_status, review_comment || null, req.params.id, req.user.id]
    );

    // If rejected, set PR status to Rejected
    if (review_status === 'rejected') {
      await conn.query(
        'UPDATE purchase_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
        ['Rejected', review_comment || 'Rejected by reviewer', req.params.id]
      );

      await conn.commit();

      // Notify requester
      await createNotification(
        pr.requested_by,
        'PR Rejected',
        `Your Purchase Request ${pr.pr_number} has been rejected`,
        'PR Rejected',
        pr.id,
        'purchase_request'
      );

      res.json({ message: 'PR rejected successfully', status: 'Rejected' });
      return;
    }

    // Determine next status based on which reviewer group has completed
    let newStatus;
    let notificationRecipients = [];
    let notificationTitle;
    let notificationMessage;

    console.log('🔍 Review workflow: PR ID:', req.params.id, 'Requester role:', pr.requester_role);

    if (pr.requester_role === 'engineer') {
      // Engineer requester: Engineers → Admins → Procurement → Super Admin
      // Check if all engineers have approved
      const [engineerReviews] = await conn.query(
        `SELECT prr.review_status 
         FROM purchase_request_reviews prr
         JOIN employees e ON prr.reviewer_id = e.id
         WHERE prr.purchase_request_id = ? AND e.role = 'engineer' AND e.is_active = 1`,
        [req.params.id]
      );

      console.log('🔍 Engineer reviews:', engineerReviews);

      const engineersApproved = engineerReviews.length > 0 && engineerReviews.every(r => r.review_status === 'approved');
      const engineersPending = engineerReviews.some(r => r.review_status === 'pending');
      const engineersRejected = engineerReviews.some(r => r.review_status === 'rejected');

      console.log('🔍 Engineers approved:', engineersApproved, 'pending:', engineersPending, 'rejected:', engineersRejected);

      if (engineersRejected) {
        // Engineers rejected, PR is rejected
        await conn.query(
          'UPDATE purchase_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
          ['Rejected', 'Rejected by engineer reviewer', req.params.id]
        );
        await conn.commit();
        res.json({ message: 'PR rejected by engineer reviewer', status: 'Rejected' });
        return;
      }

      if (engineersPending) {
        // Still waiting for engineers
        await conn.commit();
        res.json({ message: 'Review submitted successfully. Waiting for other engineers.' });
        return;
      }

      if (engineersApproved) {
        // Check if all admins have approved
        const [adminReviews] = await conn.query(
          `SELECT prr.review_status 
           FROM purchase_request_reviews prr
           JOIN employees e ON prr.reviewer_id = e.id
           WHERE prr.purchase_request_id = ? AND e.role = 'admin' AND e.is_active = 1`,
          [req.params.id]
        );

        console.log('🔍 Admin reviews:', adminReviews);

        const adminsApproved = adminReviews.length > 0 && adminReviews.every(r => r.review_status === 'approved');
        const adminsPending = adminReviews.some(r => r.review_status === 'pending');
        const adminsRejected = adminReviews.some(r => r.review_status === 'rejected');

        console.log('🔍 Admins approved:', adminsApproved, 'pending:', adminsPending, 'rejected:', adminsRejected);

        if (adminsRejected) {
          // Admins rejected, PR is rejected
          await conn.query(
            'UPDATE purchase_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
            ['Rejected', 'Rejected by admin reviewer', req.params.id]
          );
          await conn.commit();
          res.json({ message: 'PR rejected by admin reviewer', status: 'Rejected' });
          return;
        }

        if (adminsPending) {
          // Engineers done, move to Admin Review
          newStatus = 'For Admin Review';
          notificationRecipients = await getAdmins();
          notificationTitle = 'PR Ready for Admin Review';
          notificationMessage = `Purchase Request ${pr.pr_number} has been reviewed by engineers and is ready for admin review`;
        } else if (adminsApproved || adminReviews.length === 0) {
          // Admins done or no admins, check procurement
          const [procurementReviews] = await conn.query(
            `SELECT prr.review_status 
             FROM purchase_request_reviews prr
             JOIN employees e ON prr.reviewer_id = e.id
             WHERE prr.purchase_request_id = ? AND e.role = 'procurement' AND e.is_active = 1`,
            [req.params.id]
          );

          console.log('🔍 Procurement reviews:', procurementReviews);

          const procurementApproved = procurementReviews.length > 0 && procurementReviews.every(r => r.review_status === 'approved');
          const procurementPending = procurementReviews.some(r => r.review_status === 'pending');
          const procurementRejected = procurementReviews.some(r => r.review_status === 'rejected');

          console.log('🔍 Procurement approved:', procurementApproved, 'pending:', procurementPending, 'rejected:', procurementRejected);

          if (procurementRejected) {
            // Procurement rejected, PR is rejected
            await conn.query(
              'UPDATE purchase_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
              ['Rejected', 'Rejected by procurement reviewer', req.params.id]
            );
            await conn.commit();
            res.json({ message: 'PR rejected by procurement reviewer', status: 'Rejected' });
            return;
          }

          if (procurementPending) {
            // Admins done, move to Procurement Review
            newStatus = 'For Procurement Review';
            notificationRecipients = await getProcurementOfficers();
            notificationTitle = 'PR Ready for Procurement Review';
            notificationMessage = `Purchase Request ${pr.pr_number} has been reviewed by admins and is ready for procurement review`;
          } else if (procurementApproved || procurementReviews.length === 0) {
            // All done or no procurement, move to Super Admin Final Approval
            newStatus = 'For Super Admin Final Approval';
            notificationRecipients = await getSuperAdmins();
            notificationTitle = 'PR Ready for Final Approval';
            notificationMessage = `Purchase Request ${pr.pr_number} has been reviewed by all required reviewers and is ready for your final approval`;
          }
        }
      }
    } else if (pr.requester_role === 'admin') {
      // Admin requester: Admins → Super Admin
      const [adminReviews] = await conn.query(
        `SELECT prr.review_status 
         FROM purchase_request_reviews prr
         JOIN employees e ON prr.reviewer_id = e.id
         WHERE prr.purchase_request_id = ? AND e.role = 'admin' AND e.is_active = 1`,
        [req.params.id]
      );

      console.log('🔍 Admin reviews (admin requester):', adminReviews);

      const adminsApproved = adminReviews.length > 0 && adminReviews.every(r => r.review_status === 'approved');
      const adminsPending = adminReviews.some(r => r.review_status === 'pending');
      const adminsRejected = adminReviews.some(r => r.review_status === 'rejected');

      if (adminsRejected) {
        await conn.query(
          'UPDATE purchase_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
          ['Rejected', 'Rejected by admin reviewer', req.params.id]
        );
        await conn.commit();
        res.json({ message: 'PR rejected by admin reviewer', status: 'Rejected' });
        return;
      }

      if (adminsPending) {
        await conn.commit();
        res.json({ message: 'Review submitted successfully. Waiting for other admins.' });
        return;
      }

      if (adminsApproved || adminReviews.length === 0) {
        newStatus = 'For Super Admin Final Approval';
        notificationRecipients = await getSuperAdmins();
        notificationTitle = 'PR Ready for Final Approval';
        notificationMessage = `Purchase Request ${pr.pr_number} has been reviewed by all required reviewers and is ready for your final approval`;
      }
    } else if (pr.requester_role === 'procurement') {
      // Procurement requester: Procurement → Super Admin
      const [procurementReviews] = await conn.query(
        `SELECT prr.review_status 
         FROM purchase_request_reviews prr
         JOIN employees e ON prr.reviewer_id = e.id
         WHERE prr.purchase_request_id = ? AND e.role = 'procurement' AND e.is_active = 1`,
        [req.params.id]
      );

      console.log('🔍 Procurement reviews (procurement requester):', procurementReviews);

      const procurementApproved = procurementReviews.length > 0 && procurementReviews.every(r => r.review_status === 'approved');
      const procurementPending = procurementReviews.some(r => r.review_status === 'pending');
      const procurementRejected = procurementReviews.some(r => r.review_status === 'rejected');

      if (procurementRejected) {
        await conn.query(
          'UPDATE purchase_requests SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
          ['Rejected', 'Rejected by procurement reviewer', req.params.id]
        );
        await conn.commit();
        res.json({ message: 'PR rejected by procurement reviewer', status: 'Rejected' });
        return;
      }

      if (procurementPending) {
        await conn.commit();
        res.json({ message: 'Review submitted successfully. Waiting for other procurement officers.' });
        return;
      }

      if (procurementApproved || procurementReviews.length === 0) {
        newStatus = 'For Super Admin Final Approval';
        notificationRecipients = await getSuperAdmins();
        notificationTitle = 'PR Ready for Final Approval';
        notificationMessage = `Purchase Request ${pr.pr_number} has been reviewed by all required reviewers and is ready for your final approval`;
      }
    } else {
      // Super Admin requester: No review needed
      await conn.commit();
      res.json({ message: 'Review submitted successfully.' });
      return;
    }

    console.log('🔍 New status:', newStatus);

    if (newStatus) {
      await conn.query(
        `UPDATE purchase_requests SET status = ?, updated_at = NOW() WHERE id = ?`,
        [newStatus, req.params.id]
      );

      await conn.commit();

      // Notify next reviewers
      for (const recipientId of notificationRecipients) {
        await createNotification(
          recipientId,
          notificationTitle,
          notificationMessage,
          'PR Review',
          pr.id,
          'purchase_request'
        );
      }

      res.json({ message: `Review submitted successfully. PR moved to ${newStatus}.`, status: newStatus });
    } else {
      await conn.commit();
      res.json({ message: 'Review submitted successfully. Waiting for other reviewers.' });
    }

  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore
      }
    }
    console.error('Review PR error:', error);
    res.status(500).json({ message: 'Failed to review PR: ' + error.message });
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

    const [prs] = await conn.query('SELECT status, order_number FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    await assertOrderNumberUnlocked(prs[0].order_number, 'approval');

    const currentStatus = prs[0].status;

    // Check if status is For Engineer Review - Super Admin cannot approve yet
    if (currentStatus === 'For Engineer Review') {
      await conn.rollback();
      return res.status(400).json({ message: 'This purchase request is currently awaiting Engineer review. Super Admin approval is not available at this stage.' });
    }

    if (currentStatus !== 'For Super Admin Final Approval' && currentStatus !== 'On Hold') {
      await conn.rollback();
      return res.status(400).json({ message: 'Invalid status for this approval step' });
    }

    // Check if all required reviewers have approved
    const [reviews] = await conn.query(
      `SELECT prr.review_status
       FROM purchase_request_reviews prr
       JOIN employees e ON prr.reviewer_id = e.id
       WHERE prr.purchase_request_id = ?
         AND e.is_active = 1`,
      [req.params.id]
    );

    if (reviews.length > 0) {
      const allApproved = reviews.every(r => r.review_status === 'approved');
      const anyRejected = reviews.some(r => r.review_status === 'rejected');

      if (!allApproved || anyRejected) {
        await conn.rollback();
        return res.status(400).json({
          message: 'Cannot approve: Not all required reviewers have approved this PR yet',
          reviews_status: reviews.map(r => r.review_status)
        });
      }
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
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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
    const {
      status,
      rejection_reason,
      items,
      supplier_id,
      supplier_address,
      item_remarks
    } = req.body;

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [prs] = await conn.query(
      'SELECT status, payment_basis, payment_terms_note, order_number FROM purchase_requests WHERE id = ?',
      [req.params.id]
    );
    if (prs.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const currentStatus = prs[0].status;
    await assertOrderNumberUnlocked(prs[0].order_number, 'approval');

    if (currentStatus !== 'For Procurement Review') {
      await conn.rollback();
      return res.status(400).json({ message: 'Purchase request not ready for Procurement approval' });
    }

    let newStatus;
    let totalAmount = null;

    if (status === 'approved') {
      newStatus = 'For Super Admin Final Approval';
      if (prs[0].payment_basis === 'debt') {
        const scheduleCount = await getPaymentScheduleCount(conn, req.params.id);
        if (scheduleCount === 0) {
          await conn.rollback();
          return res.status(400).json({ message: 'At least one payment schedule is required before approval.' });
        }
      }

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
        'UPDATE purchase_requests SET status = ?, total_amount = ?, supplier_id = ?, supplier_name = NULL, supplier_address = ? WHERE id = ?',
        [
          newStatus,
          totalAmount,
          supplier_id,
          supplier_address || null,
          req.params.id
        ]
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
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name,
             COALESCE(pr.supplier_name, s.supplier_name) as supplier_name,
             s.contact_person as supplier_contact
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

    // Get PR items
    const [items] = await db.query(`
      SELECT pri.*, i.item_name, i.item_code, i.unit
      FROM purchase_request_items pri
      JOIN items i ON pri.item_id = i.id
      WHERE pri.purchase_request_id = ?
    `, [req.params.id]);

    // Get payment schedules (date string keeps timezone-safe comparisons)
    const [paymentSchedules] = await db.query(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m-%d') AS payment_date, amount, note
      FROM purchase_request_payment_schedules
      WHERE purchase_request_id = ?
      ORDER BY payment_date ASC
    `, [req.params.id]);

    // Get paid DV totals tied to this PR (actual released payments).
    const [paidDvRows] = await db.query(`
      SELECT amount
      FROM disbursement_vouchers
      WHERE purchase_request_id = ? AND status = 'Paid'
    `, [req.params.id]);

    // Fetch review records for this PR
    const [reviews] = await db.query(`
      SELECT prr.*, 
             e.first_name as reviewer_first_name, 
             e.last_name as reviewer_last_name,
             e.role as reviewer_role
      FROM purchase_request_reviews prr
      JOIN employees e ON prr.reviewer_id = e.id
      WHERE prr.purchase_request_id = ?
        AND e.is_active = 1
      ORDER BY prr.created_at ASC
    `, [req.params.id]);

    // Load template workbook
    const templatePath = resolveExcelTemplatePath('PURCHASE REQUEST- FINAL-2026.xlsx');
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
    const supplierAddressCell = worksheet.getCell('C9');
    supplierAddressCell.value = pr.supplier_address || '';
    supplierAddressCell.font = { name: 'Times New Roman', size: 12, bold: true };

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

    // Add payment terms summary below "*** NOTHING FOLLOWS ***" without touching fixed template totals/signatures.
    const exportNoteLines = [];
    const paymentTermsNote = String(pr.payment_terms_note || '').trim();
    if (paymentTermsNote) {
      exportNoteLines.push(`Payment Terms: ${paymentTermsNote}`);
    }

    if (paymentSchedules.length > 0) {
      const today = new Date();
      const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const formatMoney = (value) => Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      const getDueLabel = (dateYmd, suffix = '') => {
        const base = dateYmd < todayYmd
          ? 'OVERDUE'
          : dateYmd === todayYmd
            ? 'DUE TODAY'
            : 'UPCOMING';
        return suffix ? `${base} ${suffix}` : base;
      };

      const firstUpcomingOrToday = paymentSchedules.find((schedule) => schedule.payment_date >= todayYmd);
      const targetSchedule = firstUpcomingOrToday || paymentSchedules[paymentSchedules.length - 1];

      if (targetSchedule?.payment_date) {
        const dueLabel = getDueLabel(targetSchedule.payment_date);

        const amountNumber = Number(targetSchedule.amount);
        const amountSuffix = Number.isFinite(amountNumber)
          ? ` | Amount: ${formatMoney(amountNumber)}`
          : '';

        exportNoteLines.push(`Next Payment: ${targetSchedule.payment_date}${amountSuffix}`);
        exportNoteLines.push(`Status: ${dueLabel}`);
      }

      // Compute first unpaid schedule using FIFO allocation of paid DV amount.
      let remainingPaid = paidDvRows.reduce((sum, row) => {
        const amount = Number(row?.amount);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0);

      let firstPaidSchedule = null;
      let firstUnpaidSchedule = null;
      for (const schedule of paymentSchedules) {
        const amount = Number(schedule?.amount);
        const scheduleAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
        if (remainingPaid >= scheduleAmount) {
          if (!firstPaidSchedule) {
            firstPaidSchedule = {
              payment_date: schedule.payment_date,
              amount: scheduleAmount
            };
          }
          remainingPaid -= scheduleAmount;
          continue;
        }
        firstUnpaidSchedule = {
          payment_date: schedule.payment_date,
          amount: scheduleAmount
        };
        break;
      }

      if (firstPaidSchedule) {
        exportNoteLines.push(
          `First Paid Schedule: ${firstPaidSchedule.payment_date} | Amount: ${formatMoney(firstPaidSchedule.amount)} | PAID`
        );
      } else if (firstUnpaidSchedule) {
        exportNoteLines.push(
          `First Unpaid Schedule: ${firstUnpaidSchedule.payment_date} | Amount: ${formatMoney(firstUnpaidSchedule.amount)} | ${getDueLabel(firstUnpaidSchedule.payment_date, '(unpaid)')}`
        );
      } else {
        exportNoteLines.push('First Unpaid Schedule: None (all scheduled payments fulfilled)');
      }
    }

    const maxSummaryRow = 30; // Row 31 contains total; avoid overwriting template footer region.
    let noteRowNumber = rowNum + 1;
    for (const line of exportNoteLines) {
      if (noteRowNumber > maxSummaryRow) break;
      const mergeRange = `A${noteRowNumber}:F${noteRowNumber}`;
      try {
        worksheet.unMergeCells(mergeRange);
      } catch {
        // Ignore if row is not currently merged as A:F.
      }
      try {
        worksheet.mergeCells(mergeRange);
      } catch (mergeError) {
        console.warn(`Failed to merge note row ${noteRowNumber} (${mergeRange}):`, mergeError?.message || mergeError);
      }
      const cell = worksheet.getRow(noteRowNumber).getCell(1);
      cell.value = line;
      cell.font = { color: { argb: 'FF0000' } };
      noteRowNumber++;
    }

    // Fill total (F31)
    worksheet.getCell('F31').value = pr.total_amount || 0;

    // Fill requester name (A34) - "Prepared by"
    const requesterName = `${pr.requester_first_name || ''} ${pr.requester_last_name || ''}`.trim();
    const requesterNameCell = worksheet.getCell('A34');
    requesterNameCell.value = requesterName || '';
    requesterNameCell.font = { name: 'Times New Roman', size: 12, bold: true };
    requesterNameCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Calculate reviewer and approver names
    const getReviewerName = (review) => {
      const name = `${review.reviewer_first_name || ''} ${review.reviewer_last_name || ''}`.trim();
      return name || review.reviewer_name || 'Reviewer';
    };

    const getReviewerRoleLabel = (role) => {
      const labels = {
        engineer: 'Engineer',
        admin: 'Admin',
        procurement: 'Procurement',
        super_admin: 'Super Admin'
      };
      return labels[role] || 'Reviewer';
    };

    const approvedReviewers = reviews.filter(review => review.review_status === 'approved');
    const rejectedReviewers = reviews.filter(review => review.review_status === 'rejected');
    const reviewedByText = approvedReviewers.length > 0
      ? getReviewerName(approvedReviewers[0])
      : rejectedReviewers.length > 0
        ? `${getReviewerName(rejectedReviewers[0])} (declined)`
        : (pr.reviewed_by_name || 'Pending review');

    // Populate Primary Reviewed By
    const reviewedByCell = worksheet.getCell('D34');
    reviewedByCell.value = reviewedByText;
    reviewedByCell.font = { name: 'Times New Roman', size: 12, bold: true };
    reviewedByCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const reviewedByRoleCell = worksheet.getCell('C35');
    reviewedByRoleCell.value = 'Name and Signature';
    reviewedByRoleCell.font = { name: 'Times New Roman', size: 10, italic: true };
    reviewedByRoleCell.alignment = { horizontal: 'center', vertical: 'top' };

    // Populate Received By (Approver)
    const approverName = pr.approver_first_name || pr.approver_last_name
      ? `${pr.approver_first_name || ''} ${pr.approver_last_name || ''}`.trim()
      : 'MARC JUSTIN E. ARZADON';

    const approverNameCell = worksheet.getCell('E34');
    approverNameCell.value = approverName;
    approverNameCell.font = { name: 'Times New Roman', size: 12, bold: true };
    approverNameCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.getCell('E35').value = 'General Manager';

    // Additional Reviewers Logic
    if (approvedReviewers.length > 1) {
      const additionalReviewedRows = [];
      for (let index = 1; index < approvedReviewers.length; index += 3) {
        additionalReviewedRows.push(approvedReviewers.slice(index, index + 3));
      }

      let currentRow = 37; // Start below the primary signature block
      for (const row of additionalReviewedRows) {
        const headerRow = worksheet.getRow(currentRow);
        const nameRow = worksheet.getRow(currentRow + 1);
        const roleRow = worksheet.getRow(currentRow + 2);

        for (let i = 0; i < 3; i++) {
          if (row[i]) {
            const columns = [1, 4, 5]; // Column A (1), Column D (4), Column E (5)
            const startCol = columns[i];
            const endCol = startCol + 1;  // 2 (B), 4 (D), 6 (F)
            const colLetter1 = String.fromCharCode(64 + startCol);
            const colLetter2 = String.fromCharCode(64 + endCol);

            try {
              worksheet.mergeCells(`${colLetter1}${currentRow}:${colLetter2}${currentRow}`);
              worksheet.mergeCells(`${colLetter1}${currentRow + 1}:${colLetter2}${currentRow + 1}`);
              worksheet.mergeCells(`${colLetter1}${currentRow + 2}:${colLetter2}${currentRow + 2}`);
            } catch (e) {
              console.warn('Failed to merge additional reviewer cells:', e.message);
            }

            const headerCell = headerRow.getCell(startCol);
            headerCell.value = 'Reviewed by:';
            headerCell.font = { name: 'Times New Roman', size: 12 };
            headerCell.alignment = { horizontal: 'left', vertical: 'bottom' };
            // The template has borders for signatures, so add a bottom border to match "Prepared by:"
            headerCell.border = { bottom: { style: 'thin' } };

            const nameCell = nameRow.getCell(startCol);
            nameCell.value = getReviewerName(row[i]);
            nameCell.font = { name: 'Times New Roman', size: 12, bold: true };
            nameCell.alignment = { horizontal: 'center', vertical: 'middle' };

            const roleCell = roleRow.getCell(startCol);
            roleCell.value = 'Name and Signature';
            roleCell.font = { name: 'Times New Roman', size: 10, italic: true };
            roleCell.alignment = { horizontal: 'center', vertical: 'top' };
          }
        }
        currentRow += 4; // leave a blank row between groups
      }
    }

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
    const { purpose, remarks, items, date_needed, project, project_address, order_number, payment_basis, payment_terms_note, supplier_id, supplier_name, payment_schedules } = req.body;
    await assertProjectIsActive(project, { providedOrderNumber: order_number });

    // Check if PR exists and is rejected
    const [prs] = await db.query('SELECT * FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];
    const nextPaymentBasis = payment_basis ?? pr.payment_basis;
    const nextPaymentTermsNote = normalizePaymentTermsNote(payment_terms_note ?? pr.payment_terms_note);
    const nextPaymentTermsCode = nextPaymentTermsNote ? 'CUSTOM' : null;
    const nextSupplierName = hasOwn(req.body, 'supplier_name')
      ? normalizeSupplierName(supplier_name)
      : pr.supplier_name;
    const hasPaymentSchedulesField = hasOwn(req.body, 'payment_schedules');
    const normalizedPaymentSchedules = hasPaymentSchedulesField ? normalizePaymentSchedules(payment_schedules) : null;

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

    const normalizedItems = Array.isArray(items)
      ? items.map((item) => {
        const itemId = item.item_id ?? item.id;
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unit_price ?? item.estimated_unit_price ?? 0);
        const totalPrice = quantity * unitPrice;

        if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('Invalid item payload: each item requires item_id (or id) and quantity > 0');
        }

        return {
          itemId,
          quantity,
          unitPrice,
          totalPrice,
          remarks: item.remarks ?? item.notes ?? null
        }
      })
      : [];

    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const schedulesForValidation = hasPaymentSchedulesField
      ? normalizedPaymentSchedules
      : await getExistingPaymentSchedules(conn, req.params.id);
    assertPaymentScheduleTotalsMatch({
      paymentBasis: nextPaymentBasis,
      schedules: schedulesForValidation,
      totalAmount
    });

    let supplierAddress = null;
    const effectiveSupplierId = supplier_id ?? pr.supplier_id;

    if (effectiveSupplierId) {
      const [supRows] = await conn.query(
        'SELECT address FROM suppliers WHERE id = ? LIMIT 1',
        [effectiveSupplierId]
      );

      if (supRows.length === 0) {
        throw new Error('Invalid supplier_id: supplier not found');
      }

      supplierAddress = supRows[0].address ?? null;
    }

    // Update PR details and reset status to For Procurement Review, clear all pricing data
    await conn.query(
      `UPDATE purchase_requests 
       SET purpose = ?, remarks = ?, date_needed = ?, project = ?, project_address = ?, order_number = ?, 
           payment_basis = ?, payment_terms_code = ?, payment_terms_note = ?, payment_terms_set_by = ?, payment_terms_set_at = ?, supplier_id = ?,
           supplier_name = ?, status = 'For Procurement Review', approved_by = NULL, approved_at = NULL, 
           supplier_address = ?, rejection_reason = NULL, 
           total_amount = ?, updated_at = NOW()
       WHERE id = ?`,

      [purpose || pr.purpose,
      remarks ?? pr.remarks,
      date_needed || pr.date_needed,
      project || pr.project,
      project_address || pr.project_address,
      order_number || pr.order_number,
        nextPaymentBasis,
        nextPaymentTermsCode,
        nextPaymentTermsNote,
      nextPaymentTermsNote ? req.user.id : null,
      nextPaymentTermsNote ? new Date() : null,
      supplier_id ?? pr.supplier_id,
        nextSupplierName,
        supplierAddress,
        totalAmount,
      req.params.id
      ]
    );

    // Update items if provided
    if (normalizedItems.length > 0) {
      await conn.query('DELETE FROM purchase_request_items WHERE purchase_request_id = ?', [req.params.id]);

      for (const item of normalizedItems) {
        await conn.query(
          'INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, unit_price, total_price, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.id, item.itemId, item.quantity, item.unitPrice, item.totalPrice, item.remarks]
        );
      }
    }

    if (hasPaymentSchedulesField) {
      await replacePaymentSchedules(conn, req.params.id, normalizedPaymentSchedules, req.user.id);
    }

    if (nextPaymentBasis === 'debt') {
      const scheduleCount = await getPaymentScheduleCount(conn, req.params.id);
      if (scheduleCount === 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'At least one payment schedule is required for debt/with account PR.' });
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
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: statusCode === 500 ? 'Failed to resubmit purchase request: ' + error.message : error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Legacy endpoint - remove requireSuperAdmin restriction for backward compatibility
router.put('/:id/approve', authenticate, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const [prs] = await db.query('SELECT order_number, status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    await assertOrderNumberUnlocked(prs[0].order_number, 'approval');

    const currentStatus = prs[0].status;
    const userRole = req.user.role;

    // Validate that user's role matches the current status
    if (currentStatus === 'For Engineer Review' && userRole !== 'engineer') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Engineer review. You do not have permission to approve at this stage.' });
    }

    if (currentStatus === 'For Admin Review' && userRole !== 'admin') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Admin review. You do not have permission to approve at this stage.' });
    }

    if (currentStatus === 'For Procurement Review' && userRole !== 'procurement') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Procurement review. You do not have permission to approve at this stage.' });
    }

    if (currentStatus === 'For Super Admin Final Approval' && userRole !== 'super_admin') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Super Admin final approval. You do not have permission to approve at this stage.' });
    }

    await db.query(
      'UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ? WHERE id = ?',
      [status, req.user.id, remarks, req.params.id]
    );

    res.json({ message: `Purchase request ${status} successfully` });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update purchase request' });
  }
});

// Mark PR as Received (engineer only, only when status is Completed)
router.put('/:id/received', authenticate, async (req, res) => {
  try {
    // Check if PR exists
    const [prs] = await db.query('SELECT * FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const pr = prs[0];

    // Only the original requester can mark as received
    if (pr.requested_by !== req.user.id) {
      return res.status(403).json({ message: 'Only the original requester can mark this PR as received' });
    }

    // Only Completed PRs can be marked as Received
    if (pr.status !== 'Completed') {
      return res.status(400).json({ message: 'Only completed purchase requests can be marked as received' });
    }

    await db.query(
      'UPDATE purchase_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Received', req.params.id]
    );

    res.json({ message: 'Purchase request marked as received successfully', status: 'Received' });
  } catch (error) {
    console.error('Mark received error:', error);
    res.status(500).json({ message: 'Failed to mark purchase request as received' });
  }
});

// Update PR status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const [prs] = await db.query('SELECT order_number, status FROM purchase_requests WHERE id = ?', [req.params.id]);
    if (prs.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    await assertOrderNumberUnlocked(prs[0].order_number, 'status update');

    const currentStatus = prs[0].status;
    const userRole = req.user.role;

    // Validate that user's role matches the current status
    if (currentStatus === 'For Engineer Review' && userRole !== 'engineer') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Engineer review. You do not have permission to update the status at this stage.' });
    }

    if (currentStatus === 'For Admin Review' && userRole !== 'admin') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Admin review. You do not have permission to update the status at this stage.' });
    }

    if (currentStatus === 'For Procurement Review' && userRole !== 'procurement') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Procurement review. You do not have permission to update the status at this stage.' });
    }

    if (currentStatus === 'For Super Admin Final Approval' && userRole !== 'super_admin') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Super Admin final approval. You do not have permission to update the status at this stage.' });
    }

    await db.query(
      'UPDATE purchase_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: `Purchase request status updated to ${status} successfully`, status });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update purchase request status' });
  }
});

export default router;
