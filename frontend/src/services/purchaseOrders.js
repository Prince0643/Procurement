import api from './api.js';

export const purchaseOrderService = {
  getAll: async () => {
    const response = await api.get('/purchase-orders');
    return response.data.purchaseOrders;
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data.purchaseOrder;
  },

  create: async (poData) => {
    const response = await api.post('/purchase-orders', poData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  superAdminApprove: async (id, status) => {
    const response = await api.put(`/purchase-orders/${id}/super-admin-approve`, { status });
    return response.data;
  },

  exportToExcel: async (id) => {
    const response = await api.get(`/purchase-orders/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  resubmit: async (id, poData) => {
    const response = await api.put(`/purchase-orders/${id}/resubmit`, poData);
    return response.data;
  },

  getAttachments: async (id) => {
    const response = await api.get(`/purchase-orders/${id}/attachments`);
    return response.data.attachments;
  },

  uploadAttachment: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/purchase-orders/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.attachment;
  },

  deleteAttachment: async (id, attachmentId) => {
    const response = await api.delete(`/purchase-orders/${id}/attachments/${attachmentId}`);
    return response.data;
  }
};
