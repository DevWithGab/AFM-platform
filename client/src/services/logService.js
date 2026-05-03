import api from './api';

export const logService = {
  getAllLogs: async () => {
    const response = await api.get('/logs');
    return response.data;
  },

  getLogsByAction: async (action) => {
    const response = await api.get(`/logs?action=${action}`);
    return response.data;
  },

  getLogsByUser: async (userId) => {
    const response = await api.get(`/logs?userId=${userId}`);
    return response.data;
  },
};
