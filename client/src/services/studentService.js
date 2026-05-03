import api from './api';

export const studentService = {
  getAllStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  uploadStudentPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post(`/students/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
