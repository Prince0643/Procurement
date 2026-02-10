import api from './api';

export const itemService = {
  getAll: async () => {
    const response = await api.get('/items');
    return response.data.items;
  },

  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data.item;
  },

  create: async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data;
  },

  update: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  }
};
