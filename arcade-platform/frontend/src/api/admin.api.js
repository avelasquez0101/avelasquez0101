import apiClient from './client';

export const adminApi = {
  // Torneos
  createTournament: (data) => apiClient.post('/admin/tournaments', data),
  updateTournament: (id, data) => apiClient.put(`/admin/tournaments/${id}`, data),
  cancelTournament: (id) => apiClient.post(`/admin/tournaments/${id}/cancel`),
  generateBracket: (id) => apiClient.post(`/admin/tournaments/${id}/generate-bracket`),
  
  // Disputas
  getDisputes: () => apiClient.get('/admin/disputes'),
  resolveDispute: (id, resolutionData) => apiClient.post(`/admin/disputes/${id}/resolve`, resolutionData),
  
  // Usuarios
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  banUser: (id, reason) => apiClient.put(`/admin/users/${id}/ban`, { reason }),
};
