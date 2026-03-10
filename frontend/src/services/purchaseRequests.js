import api from './api';

// In-flight request tracking to prevent duplicate simultaneous requests
const inFlightRequests = new Map();

const dedupeRequest = async (key, requestFn) => {
  // Clear any existing cache for this key to ensure fresh data
  inFlightRequests.delete(key);
  
  const promise = requestFn().finally(() => {
    inFlightRequests.delete(key);
  });
  
  inFlightRequests.set(key, promise);
  return promise;
};

export const purchaseRequestService = {
  getAll: async (view) => {
    const key = `getAll-${view || 'default'}`;
    return dedupeRequest(key, async () => {
      const params = view ? { view } : {};
      const response = await api.get('/purchase-requests', { params });
      return response.data.purchaseRequests;
    });
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-requests/${id}`);
    return response.data.purchaseRequest;
  },

  create: async (prData) => {
    const response = await api.post('/purchase-requests', prData);
    return response.data;
  },

  superAdminFirstApprove: async (id, status, remarks, itemRemarks) => {
    const response = await api.put(`/purchase-requests/${id}/super-admin-first-approve`, { status, remarks, item_remarks: itemRemarks });
    return response.data;
  },

  procurementApprove: async (id, status, rejection_reason, items, supplier_id, supplier_address, itemRemarks) => {
    const response = await api.put(`/purchase-requests/${id}/procurement-approve`, { status, rejection_reason, items, supplier_id, supplier_address, item_remarks: itemRemarks });
    return response.data;
  },

  // Legacy endpoint
  approve: async (id, status, remarks) => {
    const response = await api.put(`/purchase-requests/${id}/approve`, { status, remarks });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/purchase-requests/${id}/status`, { status });
    return response.data;
  },

  markAsReceived: async (id) => {
    const response = await api.put(`/purchase-requests/${id}/received`);
    return response.data;
  },

  exportToExcel: async (id) => {
    const response = await api.get(`/purchase-requests/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  resubmit: async (id, prData) => {
    const response = await api.put(`/purchase-requests/${id}/resubmit`, prData);
    return response.data;
  },

  saveDraft: async (prData) => {
    const response = await api.post('/purchase-requests', { ...prData, save_as_draft: true });
    return response.data;
  },

  updateDraft: async (id, prData) => {
    const response = await api.put(`/purchase-requests/${id}/draft`, prData);
    return response.data;
  },

  submitDraft: async (id) => {
    const response = await api.put(`/purchase-requests/${id}/submit-draft`);
    return response.data;
  }
};
