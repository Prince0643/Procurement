import api from './api';

export const employeeService = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data.employees;
  },

  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  resetPassword: async (id) => {
    const response = await api.post(`/employees/${id}/reset-password`);
    return response.data;
  }
};
