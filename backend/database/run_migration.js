import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'procurement_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function runMigration() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database');
    
    const sql = `ALTER TABLE payment_requests 
MODIFY COLUMN status enum('Draft','Pending','For Approval','On Hold','Approved','Rejected','Cancelled','DV Created','Paid') DEFAULT 'Draft'`;
    
    await connection.execute(sql);
    console.log('Migration completed successfully: Added "For Approval" status to payment_requests table');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
