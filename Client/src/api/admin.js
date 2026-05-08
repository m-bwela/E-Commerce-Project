import API from './axios';
// API is the axios instance from axios.js
// It already knows: baseURL = http://localhost:5000/api
// and withCredentials: true (sends cookies)

// ─── STATS ─────────────────────────────────────────────────────────────────
// Fetches numbers for the dashboard overview cards
export const getStatsAPI = () => API.get('/admin/stats');

// ─── USERS ─────────────────────────────────────────────────────────────────
// Get a list of all registered users
export const getUsersAPI = () => API.get('/admin/users');

// Change a user's role — id = the user's ID, role = "ADMIN" or "USER"
// PATCH means "partially update" (only change the role, not the whole user)
export const updateUserRoleAPI = (id, role) =>
  API.patch(`/admin/users/${id}/role`, { role });

// ─── ORDERS ────────────────────────────────────────────────────────────────
// Change an order's status — id = order ID, status = "SHIPPED" etc.
export const updateOrderStatusAPI = (id, status) =>
  API.patch(`/admin/orders/${id}/status`, { status });

// Get ALL orders (admin version — reuses the existing /orders/all endpoint)
export const getAdminOrdersAPI = () => API.get('/orders/all');

// ─── PRODUCTS ──────────────────────────────────────────────────────────────
// Get all products (reuses the existing /products endpoint)
export const getAdminProductsAPI = () => API.get('/products');

// Create a new product — formData is a FormData object (used for file uploads)
export const createProductAPI = (formData) => API.post('/products', formData);

// Update an existing product by ID
export const updateProductAPI = (id, formData) =>
  API.put(`/products/${id}`, formData);

// Delete a product by ID
export const deleteProductAPI = (id) => API.delete(`/products/${id}`);