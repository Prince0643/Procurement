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

export const supplierService = {
  getAll: async () => {
    return dedupeRequest('suppliers-getAll', async () => {
      const response = await api.get('/suppliers');
      return response.data.suppliers;
    });
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data.supplier;
  },

  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};
