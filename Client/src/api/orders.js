import API from './axios';

// POST /api/orders — create a new order
// "data" is an object like { phoneNumber: "123-456-7890" }
export const createOrderAPI  = (phoneNumber) => API.post('/orders', { phoneNumber });