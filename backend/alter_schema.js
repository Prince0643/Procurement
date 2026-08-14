import pool from './config/database.js';

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // 1. Add super_admin_rep to employees.role
        const [rows] = await pool.query(`SHOW COLUMNS FROM employees LIKE 'role'`);
        const currentType = rows[0].Type; 
        console.log('Current employees.role type:', currentType);
        
        await pool.query(`
            ALTER TABLE employees 
            MODIFY COLUMN role ENUM('engineer', 'procurement', 'admin', 'super_admin', 'super_admin_rep') DEFAULT 'engineer'
        `);
        console.log('Added super_admin_rep to employees.role ENUM');
        
        // 2. Add For Super Admin Rep Review to purchase_requests.status
        const [prRows] = await pool.query(`SHOW COLUMNS FROM purchase_requests LIKE 'status'`);
        const prCurrentType = prRows[0].Type;
        console.log('Current purchase_requests.status type:', prCurrentType);
        
        await pool.query(`
            ALTER TABLE purchase_requests 
            MODIFY COLUMN status ENUM(
                'Draft',
                'Pending',
                'For Procurement Review', 
                'For Engineer Review',
                'For Admin Review',
                'For Super Admin Rep Review',
                'For Super Admin Final Approval',
                'On Hold',
                'For Purchase',
                'PO Created',
                'Payment Request Created',
                'Completed',
                'Rejected',
                'Cancelled',
                'Received',
                'Pending Accreditation Review'
            ) DEFAULT 'Draft'
        `);
        console.log('Added For Super Admin Rep Review to purchase_requests.status ENUM');

        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
