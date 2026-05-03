import api from './api';

export const reportService = {
  generateReport: async (filters) => {
    const response = await api.post('/reports/generate', filters);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
};
