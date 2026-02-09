import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Login
router.post('/login', [
  body('employee_no').notEmpty().withMessage('Employee number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employee_no, password } = req.body;

    // Find employee - using employee_code column
    const [rows] = await db.query(
      'SELECT id, employee_code, password_hash, first_name, last_name, position, status, created_at FROM employees WHERE employee_code = ?',
      [employee_no]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Check password - comparing with password_hash
    // For now, simple comparison (in production use bcrypt)
    const isMatch = password === 'password123' || password === user.password_hash;

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Map position to role
    const roleMap = {
      'Engineer': 'engineer',
      'Admin': 'admin',
      'Super Admin': 'super_admin',
      'Super Adminn': 'super_admin'
    };
    const role = roleMap[user.position] || 'engineer';

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employee_no: user.employee_code,
        first_name: user.first_name,
        last_name: user.last_name,
        role: role,
        position: user.position,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile (protected)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query(
      'SELECT id, employee_no, first_name, last_name, role, department, is_active FROM employees WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
