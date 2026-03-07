import api from './api';

// In-flight request tracking to prevent duplicate simultaneous requests
const inFlightRequests = new Map();

const dedupeRequest = async (key, requestFn) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  
  const promise = requestFn().finally(() => {
    inFlightRequests.delete(key);
  });
  
  inFlightRequests.set(key, promise);
  return promise;
};

export const serviceRequestService = {
  getAll: async () => {
    return dedupeRequest('serviceRequests-getAll', async () => {
      const response = await api.get('/service-requests');
      return response.data.serviceRequests;
    });
  },

  getById: async (id) => {
    return dedupeRequest(`serviceRequests-getById-${id}`, async () => {
      const response = await api.get(`/service-requests/${id}`);
      return response.data.serviceRequest;
    });
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

  procurementApprove: async (id, status, supplierId, rejectionReason) => {
    const response = await api.put(`/service-requests/${id}/procurement-approve`, {
      status,
      supplier_id: supplierId,
      rejection_reason: rejectionReason
    });
    return response.data;
  },

  superAdminApprove: async (id, status, rejectionReason, remarks) => {
    const response = await api.put(`/service-requests/${id}/super-admin-approve`, {
      status,
      rejection_reason: rejectionReason,
      remarks
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/service-requests/${id}`);
    return response.data;
  },

  exportToExcel: async (id) => {
    const response = await api.get(`/service-requests/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
