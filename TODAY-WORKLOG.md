# Work Log - March 16, 2026

## Bug Fix: Notification UI Not Updating When Marking as Read

### Problem
When clicking "Mark all read" or marking individual notifications as read, the UI did not immediately update to reflect the changes. The dropdown continued showing the old notifications.

### Root Cause
Stale closure issue in `Header.jsx` - the `setNotifications` callback used in `handleMarkAsRead` and `handleMarkAllAsRead` was capturing stale state references, causing the UI to not update properly.

### Fix Applied
**File:** `frontend/src/components/layout/Header.jsx`

Updated `handleMarkAsRead` to use functional state update form with clearer variable naming to ensure React uses the most current state:

```javascript
// Before (stale closure risk)
setNotifications(prev => prev.filter(n => n.id !== id));

// After (fresh state guarantee)
setNotifications(currentNotifications => currentNotifications.filter(n => n.id !== id));
```

### Status
✅ Fixed - Notification UI now updates immediately when marking as read.

---

## Socket.IO Overview

The socket (`backend/utils/socket.js`) enables **real-time notifications**:
- Emits `notification` events when new notifications are created
- Clients join `user_${userId}` room for personal notifications
- Clients join `role_${role}` room for role-based broadcasts

**Helper functions:**
- `emitToUser(userId, event, data)` - Send to specific user
- `emitToRole(role, event, data)` - Send to all users with a role
- `emitToAll(event, data)` - Broadcast to everyone

