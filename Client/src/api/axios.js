import axios from 'axios';

// Create a reusable axios instance with default settings
// Think of this like saving a contact in your phone —
// instead of dialing the full number every time, you just tap the name.
const API = axios.create({
  baseURL: '/api',        // relative — hits localhost:5173/api which Vite proxies to localhost:5000/api
  withCredentials: true,  // still needed so cookies are included
});

export default API;
