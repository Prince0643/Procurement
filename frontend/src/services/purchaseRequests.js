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
  list: async (params = {}) => {
    const view = params?.view ?? null;
    const page = params?.page ?? null;
    const pageSize = params?.pageSize ?? null;
    const status = params?.status ?? null;
    const q = params?.q ?? null;

    const key = `list-${JSON.stringify({ view, page, pageSize, status, q })}`;

    return dedupeRequest(key, async () => {
      const queryParams = {};
      if (view) queryParams.view = view;
      if (page) queryParams.page = page;
      if (pageSize) queryParams.pageSize = pageSize;
      if (status) queryParams.status = Array.isArray(status) ? status.join(',') : status;
      if (q) queryParams.q = q;

      const response = await api.get('/purchase-requests', { params: queryParams, cache: false });
      return response.data;
    });
  },

  getAll: async (view) => {
    const key = `getAll-${view || 'default'}`;
    return dedupeRequest(key, async () => {
      const pageSize = 100;
      const all = [];
      let page = 1;
      let total = Infinity;

      while (all.length < total) {
        const response = await api.get('/purchase-requests', {
          params: { ...(view ? { view } : {}), page, pageSize },
          cache: false
        });

        const payload = response.data || {};
        const purchaseRequests = Array.isArray(payload.purchaseRequests) ? payload.purchaseRequests : [];
        total = Number.isFinite(payload.total) ? payload.total : purchaseRequests.length;

        all.push(...purchaseRequests);
        if (purchaseRequests.length < pageSize) break;

        page += 1;
        if (page > 1000) break; // safety guard
      }

      // De-dupe by id (in case data changes mid-pagination)
      const unique = new Map();
      for (const pr of all) {
        if (pr?.id == null) continue;
        unique.set(pr.id, pr);
      }

      return Array.from(unique.values());
    });
  },

  create: async (prData) => {
    const response = await api.post('/purchase-requests', prData);
    return response.data;
  },

  superAdminFirstApprove: async (id, status, remarks, itemRemarks) => {
    const response = await api.put(`/purchase-requests/${id}/super-admin-first-approve`, { status, remarks, item_remarks: itemRemarks });
    return response.data;
  },

  procurementApprove: async (
    id,
    status,
    rejection_reason,
    items,
    supplier_id,
    supplier_address,
    itemRemarks,
    payment_terms_code = null,
    payment_terms_note = null
  ) => {
    const response = await api.put(`/purchase-requests/${id}/procurement-approve`, {
      status,
      rejection_reason,
      items,
      supplier_id,
      supplier_address,
      item_remarks: itemRemarks,
      payment_terms_code,
      payment_terms_note
    });
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
