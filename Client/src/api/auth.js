// This file handles all authentication- related API calls
// Each function sends a request to the backend and return the response

import API from './axios';

// POST /api/auth/register — create a new user
// "data" is an object like { fullName: "john", email: "john@example.com", password: "password123" }
export const registerAPI = (data) => API.post('/auth/register', data);

// POST /api/auth/login — log in an existing user (with email + password)
// "data" is an object like { email: "john@example.com", password: "password123" }
export const loginAPI = (data) => API.post('/auth/login', data);

// POST /api/auth/logout — log out the current user (clears the cookie on the backend)
export const logoutAPI = () => API.post('/auth/logout');

// GET /api/auth/me — check who is currently logged in (returns user info if logged in, or 401 if not)
// This uses the cookie the browser automatically sends.
// If the cookie is valid, the backend returns the user.
// If not, it returns 401 (unauthorized)
export const getMeAPI = () => API.get('/auth/me');

