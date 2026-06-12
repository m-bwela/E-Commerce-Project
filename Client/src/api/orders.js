import API from './axios';

// POST /api/orders — create a new order
export const createOrderAPI  = (phoneNumber) => API.post('/orders', { phoneNumber });

// GET /api/orders — get the current user's orders
export const getOrdersAPI = () => API.get('/orders');

// GET /api/orders/:id — get a single order by ID
export const getOrderAPI = (id) => API.get(`/orders/${id}`);

// POST /api/mpesa/stk-push — trigger M-Pesa payment prompt on user's phone
// orderId = the order we just created, phone = user's phone number
export const stkPushAPI = (orderId, phone) => API.post('/mpesa/stk-push', { orderId, phone });

// GET /api/mpesa/status/:orderId — check if payment went through (used for polling)
export const checkPaymentStatusAPI = (orderId) => API.get(`/mpesa/status/${orderId}`);