import api from './api';

export const fineService = {
  getAllFines: async () => {
    const response = await api.get('/fines');
    return response.data;
  },

  getFineById: async (id) => {
    const response = await api.get(`/fines/${id}`);
    return response.data;
  },

  createFine: async (fineData) => {
    const response = await api.post('/fines', fineData);
    return response.data;
  },

  updateFine: async (id, fineData) => {
    const response = await api.put(`/fines/${id}`, fineData);
    return response.data;
  },

  deleteFine: async (id) => {
    const response = await api.delete(`/fines/${id}`);
    return response.data;
  },

  markAsPaid: async (id) => {
    const response = await api.patch(`/fines/${id}/mark-paid`);
    return response.data;
  },

  getFinesByStudent: async (studentId) => {
    const response = await api.get(`/fines/student/${studentId}`);
    return response.data;
  },
};
