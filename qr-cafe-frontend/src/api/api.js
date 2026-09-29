import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach security PIN headers from sessionStorage
api.interceptors.request.use((config) => {
  const adminPin = sessionStorage.getItem('qr_cafe_admin_pin');
  const kitchenPin = sessionStorage.getItem('qr_cafe_kitchen_pin');

  if (adminPin) {
    config.headers['X-Admin-PIN'] = adminPin;
  }
  if (kitchenPin || adminPin) {
    config.headers['X-Staff-PIN'] = kitchenPin || adminPin;
  }

  return config;
});

// Authentication Endpoints
export const verifyKitchenPin = async (pin) => {
  const response = await api.post('/auth/verify-kitchen', { pin });
  return response.data;
};

export const verifyAdminPin = async (pin) => {
  const response = await api.post('/auth/verify-admin', { pin });
  return response.data;
};

// Menu Endpoints
export const fetchMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/menu/categories');
  return response.data;
};

export const fetchMenuItem = async (id) => {
  const response = await api.get(`/menu/items/${id}`);
  return response.data;
};

export const createMenuItem = async (itemData) => {
  const response = await api.post('/menu/items', itemData);
  return response.data;
};

export const updateMenuItem = async (id, itemData) => {
  const response = await api.put(`/menu/items/${id}`, itemData);
  return response.data;
};

export const toggleItemAvailability = async (id) => {
  const response = await api.patch(`/menu/items/${id}/availability`);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/items/${id}`);
  return response.data;
};

// Order Endpoints
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const fetchOrderByNumber = async (orderNumber) => {
  const response = await api.get(`/orders/${orderNumber}`);
  return response.data;
};

export const fetchOrders = async (statusFilter) => {
  const params = {};
  if (statusFilter && statusFilter.length > 0) {
    params.status = Array.isArray(statusFilter) ? statusFilter.join(',') : statusFilter;
  }
  const response = await api.get('/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};
