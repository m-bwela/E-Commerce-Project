import axios from 'axios';

// In development: VITE_API_URL is not set, so baseURL = '/api' (Vite proxy handles it)
// In production: VITE_API_URL = 'https://genziishop.onrender.com' (set in Vercel/Netlify env vars)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,  // include cookies on every request
});

export default API;
