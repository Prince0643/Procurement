import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const [rows] = await db.query(
      'SELECT id, employee_code, first_name, last_name, position, status FROM employees WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = rows[0];
    
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Map position to role
    const roleMap = {
      'Engineer': 'engineer',
      'Admin': 'admin',
      'Super Admin': 'super_admin',
      'Super Adminn': 'super_admin'
    };
    user.role = roleMap[user.position] || 'engineer';

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Required role: ' + roles.join(' or ')
      });
    }

    next();
  };
};

// Role-specific middleware helpers
export const requireEngineer = authorize('engineer', 'admin', 'super_admin');
export const requireAdmin = authorize('admin', 'super_admin');
export const requireSuperAdmin = authorize('super_admin');
