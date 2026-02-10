import api from './api';

export const purchaseRequestService = {
  getAll: async () => {
    const response = await api.get('/purchase-requests');
    return response.data.purchaseRequests;
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-requests/${id}`);
    return response.data.purchaseRequest;
  },

  create: async (prData) => {
    const response = await api.post('/purchase-requests', prData);
    return response.data;
  },

  superAdminFirstApprove: async (id, status, remarks) => {
    const response = await api.put(`/purchase-requests/${id}/super-admin-first-approve`, { status, remarks });
    return response.data;
  },

  procurementApprove: async (id, status, rejection_reason) => {
    const response = await api.put(`/purchase-requests/${id}/procurement-approve`, { status, rejection_reason });
    return response.data;
  },

  // Legacy endpoint
  approve: async (id, status, remarks) => {
    const response = await api.put(`/purchase-requests/${id}/approve`, { status, remarks });
    return response.data;
  }
};
