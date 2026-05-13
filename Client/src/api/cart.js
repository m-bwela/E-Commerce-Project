import API from 'axios';

// GET /api/cart — get the current user's cart
export const getCartAPI = () => API.get('/cart');

// POST /api/cart — add an item to the cart
// "data" is an object like { productId: "123", quantity: 2 }
export const addToCartAPI = ({ productId, quantity }) => API.post('/cart', { productId, quantity });

// PUT /api/cart/:productId — update the quantity of an item in the cart
export const updateCartItemAPI = (itemId, quantity) => API.put(`/cart/${itemId}`, { quantity });

// DELETE /api/cart/:productId — remove an item from the cart
export const removeFromCartAPI = () => API.delete('/cart');