import axios from 'axios';

// Create a reusable axios instance with default settings
// Think of this like saving a contact in your phone —
// instead of dialing the full number every time, you just tap the name.
const API = axios.create({
  baseURL: 'http://localhost:5000/api',  // Every request starts with this URL
  withCredentials: true,                  // Send cookies with every request (needed for JWT auth)
});

export default API;
