import api from './api';

export const reimbursementService = {
  getAll: async () => {
    const response = await api.get('/reimbursements');
    return response.data.reimbursements || [];
  },

  getById: async (id) => {
    const response = await api.get(`/reimbursements/${id}`);
    return response.data.reimbursement;
  },

  create: async (data) => {
    const response = await api.post('/reimbursements', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/reimbursements/${id}`, data);
    return response.data;
  },

  submit: async (id) => {
    const response = await api.put(`/reimbursements/${id}/submit`);
    return response.data;
  },

  approve: async (id, status, rejectionReason = null) => {
    const response = await api.put(`/reimbursements/${id}/approve`, {
      status,
      rejection_reason: rejectionReason
    });
    return response.data;
  },

  markAsReceived: async (id) => {
    const response = await api.put(`/reimbursements/${id}/received`);
    return response.data;
  },

  listAttachments: async (id) => {
    const response = await api.get(`/reimbursements/${id}/attachments`);
    return response.data.attachments || [];
  },

  uploadAttachments: async (id, files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    const response = await api.post(`/reimbursements/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteAttachment: async (id, attachmentId) => {
    const response = await api.delete(`/reimbursements/${id}/attachments/${attachmentId}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reimbursements/${id}`);
    return response.data;
  },

  exportToExcel: async (id) => {
    const response = await api.get(`/reimbursements/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getPendingCount: async () => {
    const response = await api.get('/reimbursements/pending-count');
    return response.data;
  }
};
