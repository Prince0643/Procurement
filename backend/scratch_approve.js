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

    if (currentStatus === 'For Super Admin Rep Review' && userRole !== 'super_admin_rep') {
      return res.status(403).json({ message: 'This purchase request is currently awaiting Super Admin Rep review. You do not have permission to approve at this stage.' });
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
