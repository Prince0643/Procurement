import express from 'express';
import mysqldump from 'mysqldump';
import fs from 'fs';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper middleware for strictly super_admin
const requireSuperAdmin = authorize('super_admin');

/**
 * @route   GET /api/settings/backup
 * @desc    Generate and download a full SQL database backup
 * @access  Private (Super Admin Only)
 */
router.get('/backup', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'procurement_db';

    // We'll create a temporary file name to dump the SQL into
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `procurement_backup_${dateStr}.sql`;
    const tempFilePath = path.join(__dirname, '..', filename);

    // Generate the dump
    await mysqldump({
      connection: {
        host: dbHost,
        port: parseInt(dbPort),
        user: dbUser,
        password: dbPassword,
        database: dbName,
      },
      dumpToFile: tempFilePath,
    });

    // Send the file as an attachment
    res.download(tempFilePath, filename, (err) => {
      // After downloading (or if an error occurs), delete the temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (err) {
        console.error('Error sending backup file:', err);
      }
    });

  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ message: 'Failed to generate database backup' });
  }
});

export default router;
