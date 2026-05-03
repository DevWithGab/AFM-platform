import api from './api';

export const attendanceService = {
  recordAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  getAttendanceByActivity: async (activityId) => {
    const response = await api.get(`/attendance/activity/${activityId}`);
    return response.data;
  },

  getAttendanceByStudent: async (studentId) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },

  getAllAttendance: async () => {
    const response = await api.get('/attendance');
    return response.data;
  },

  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};
