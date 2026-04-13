// This file handles all product-related API calls

import API from './axios';

// GET /api/products — get all products (with optional filters)
// "params" is an object like { category: "electronics", search: "phone", page: 2 }
// axios turns this into: /api/products?category=electronics&search=phone&page=2
export const getProductsAPI = (params) => API.get('/products', { params });

// GET /api/products/:id — get a single product by ID
export const getProductAPI = (id) => API.get(`/products/${id}`);