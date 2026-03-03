import api from './api';

export const serviceRequestService = {
  getAll: async () => {
    const response = await api.get('/service-requests');
    return response.data.serviceRequests;
  },

  getById: async (id) => {
    const response = await api.get(`/service-requests/${id}`);
    return response.data.serviceRequest;
  },

  create: async (srData) => {
    const response = await api.post('/service-requests', srData);
    return response.data;
  },

  update: async (id, srData) => {
    const response = await api.put(`/service-requests/${id}`, srData);
    return response.data;
  },

  submit: async (id) => {
    const response = await api.put(`/service-requests/${id}/submit`);
    return response.data;
  },

  approve: async (id, status, rejectionReason) => {
    const response = await api.put(`/service-requests/${id}/approve`, { 
      status, 
      rejection_reason: rejectionReason 
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/service-requests/${id}`);
    return response.data;
  }
};
