import apiClient from './client';

export const shopApi = {
  getItems: (params) => apiClient.get('/shop/items', { params }),
  getItem: (id) => apiClient.get(`/shop/items/${id}`),
  purchase: (itemId) => apiClient.post('/shop/purchase', { itemId }),
  getInventory: () => apiClient.get('/shop/inventory'),
  equip: (itemId) => apiClient.post(`/shop/inventory/${itemId}/equip`),
  unequip: (itemId) => apiClient.post(`/shop/inventory/${itemId}/unequip`),
};
