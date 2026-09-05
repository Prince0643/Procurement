import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const [notifications] = await db.query(`
      SELECT n.*
      FROM notifications n
      WHERE n.recipient_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [req.user.id]);

    // Count unread
    const [unreadCount] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = false',
      [req.user.id]
    );

    res.json({ 
      notifications,
      unreadCount: unreadCount[0].count
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND recipient_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Failed to update notification:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE recipient_id = ? AND is_read = false',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Failed to update notifications:', error);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

// Subscribe to push notifications
router.post('/subscribe', authenticate, async (req, res) => {
  const subscription = req.body;
  const employeeId = req.user.id;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Invalid subscription' });
  }

  try {
    // Check if it already exists
    const [existing] = await db.query(
      'SELECT id FROM push_subscriptions WHERE employee_id = ? AND endpoint = ?',
      [employeeId, subscription.endpoint]
    );

    if (existing.length === 0) {
      await db.query(
        'INSERT INTO push_subscriptions (employee_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
        [employeeId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
      );
    }
    res.status(201).json({ message: 'Subscription saved' });
  } catch (error) {
    console.error('Failed to save subscription:', error);
    res.status(500).json({ message: 'Failed to save subscription' });
  }
});

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Register mobile push token
router.post('/register-token', authenticate, async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Insert token if it doesn't exist, using IGNORE to handle duplicate (user_id, token) pairs
    await db.query(
      'INSERT IGNORE INTO user_push_tokens (user_id, token) VALUES (?, ?)',
      [userId, token]
    );
    res.status(200).json({ message: 'Push token registered successfully' });
  } catch (error) {
    console.error('Failed to register push token:', error);
    res.status(500).json({ message: 'Failed to register push token' });
  }
});

export default router;
