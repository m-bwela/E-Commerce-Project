import API from './axios';

// GET /api/cart — get the current user's cart
export const getCartAPI = () => API.get('/cart');

// POST /api/cart — add an item to the cart
// size is optional — only passed for footwear products
export const addToCartAPI = (productId, quantity, size) => API.post('/cart', { productId, quantity, size });

// PUT /api/cart/:productId — update the quantity of an item in the cart
export const updateCartItemAPI = (itemId, quantity) => API.put(`/cart/${itemId}`, { quantity });

// DELETE /api/cart — clear the ENTIRE cart (not one item — one item is removed via updateCartItemAPI with quantity 0)
export const clearCartAPI = () => API.delete('/cart');