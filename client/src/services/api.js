import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.request ? 'Cannot reach the server. Make sure the backend is running on port 8000.' : error.message) ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1) =>
  api.post('/cart/add', { productId, quantity });
export const removeFromCart = (productId, quantity) =>
  api.post('/cart/remove', { productId, quantity });
export const updateCartItem = (productId, quantity) =>
  api.put('/cart/update', { productId, quantity });
export const clearCart = () => api.delete('/cart/clear');

// Orders
export const createOrder = () => api.post('/orders');
export const getUserOrders = () => api.get('/orders/user');
export const getAllOrders = () => api.get('/orders/all');
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
