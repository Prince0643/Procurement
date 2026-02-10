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
  }
};
