import db from '../config/database.js';

/**
 * Logs an action to the system_audit_logs table.
 * 
 * @param {number|null} userId - The ID of the user performing the action.
 * @param {string} action - Description of the action (e.g., 'User Logged In', 'Request Edited').
 * @param {string|null} entityType - The type of entity affected (e.g., 'purchase_requests', 'auth').
 * @param {number|null} entityId - The ID of the affected entity.
 * @param {string|null} details - Additional details or JSON stringified data.
 */
export const logAudit = async (userId, action, entityType = null, entityId = null, details = null) => {
  try {
    await db.query(
      `INSERT INTO system_audit_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, details]
    );
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
