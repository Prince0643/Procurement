import api from './api';

export const cashRequestService = {
  getAll: async () => {
    const response = await api.get('/cash-requests');
    return response.data.cashRequests || [];
  },

  getById: async (id) => {
    const response = await api.get(`/cash-requests/${id}`);
    return response.data.cashRequest;
  },

  create: async (data) => {
    const response = await api.post('/cash-requests', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/cash-requests/${id}`, data);
    return response.data;
  },

  submit: async (id) => {
    const response = await api.put(`/cash-requests/${id}/submit`);
    return response.data;
  },

  approve: async (id, status, rejectionReason = null) => {
    const response = await api.put(`/cash-requests/${id}/approve`, {
      status,
      rejection_reason: rejectionReason
    });
    return response.data;
  },

  superAdminApprove: async (id, status, remarks = null) => {
    const response = await api.put(`/cash-requests/${id}/super-admin-approve`, {
      status,
      remarks
    });
    return response.data;
  },

  adminApprove: async (id, status, remarks = null) => {
    const response = await api.put(`/cash-requests/${id}/admin-approve`, {
      status,
      remarks
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cash-requests/${id}`);
    return response.data;
  },

  export: async (id) => {
    const response = await api.get(`/cash-requests/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
