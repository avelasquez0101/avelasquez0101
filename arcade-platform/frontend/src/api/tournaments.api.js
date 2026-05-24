import apiClient from './client';

export const tournamentsApi = {
  // Públicos (requieren auth para acciones)
  getAll: (params) => apiClient.get('/tournaments', { params }),
  getById: (id) => apiClient.get(`/tournaments/${id}`),
  
  // Acciones de usuario
  register: (tournamentId) => apiClient.post(`/tournaments/${tournamentId}/register`),
  checkIn: (tournamentId) => apiClient.post(`/tournaments/${tournamentId}/checkin`),
  getBracket: (tournamentId) => apiClient.get(`/tournaments/${tournamentId}/bracket`),
  
  // Partidas
  getMatch: (matchId) => apiClient.get(`/matches/${matchId}`),
  reportResult: (matchId, score1, score2) => 
    apiClient.post(`/matches/${matchId}/report`, { score1, score2 }),
  createDispute: (matchId, reason, screenshotUrl) => 
    apiClient.post(`/matches/${matchId}/dispute`, { reason, screenshotUrl }),
  
  // Admin
  create: (data) => apiClient.post('/admin/tournaments', data),
  update: (id, data) => apiClient.put(`/admin/tournaments/${id}`, data),
  cancel: (id) => apiClient.post(`/admin/tournaments/${id}/cancel`),
  generateBracket: (id) => apiClient.post(`/admin/tournaments/${id}/generate-bracket`),
  getDisputes: () => apiClient.get('/admin/disputes'),
  resolveDispute: (id, winnerId) => 
    apiClient.post(`/admin/disputes/${id}/resolve`, { winnerId }),
};
