import api from './api';

export const activityService = {
  getAllActivities: async () => {
    const response = await api.get('/activities');
    return response.data;
  },

  getActivityById: async (id) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  createActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },

  activateActivity: async (id) => {
    const response = await api.patch(`/activities/${id}/activate`);
    return response.data;
  },

  deactivateActivity: async (id) => {
    const response = await api.patch(`/activities/${id}/deactivate`);
    return response.data;
  },
};
