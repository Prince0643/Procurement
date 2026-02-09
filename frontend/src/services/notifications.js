// Mock notifications data
const MOCK_NOTIFICATIONS = [
  { id: 1, recipient_id: 1, title: 'PR Approved', message: 'Your PR-2024-001 has been approved', type: 'PR Approved', related_id: 1, related_type: 'purchase_request', is_read: false, created_at: '2024-01-15' },
  { id: 2, recipient_id: 1, title: 'Item Received', message: 'Items from PO-2024-001 have been received', type: 'Item Received', related_id: 1, related_type: 'purchase_order', is_read: true, created_at: '2024-01-20' },
  { id: 3, recipient_id: 2, title: 'New PR Created', message: 'PR-2024-002 is pending approval', type: 'PR Created', related_id: 2, related_type: 'purchase_request', is_read: false, created_at: '2024-01-16' },
  { id: 4, recipient_id: 2, title: 'PR Rejected', message: 'PR-2024-004 has been rejected', type: 'PR Rejected', related_id: 4, related_type: 'purchase_request', is_read: false, created_at: '2024-01-14' },
];

let notifications = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { notifications };
  },

  markAsRead: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
    return { message: 'Notification marked as read' };
  },

  markAllAsRead: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    notifications.forEach(n => n.is_read = true);
    return { message: 'All notifications marked as read' };
  }
};
