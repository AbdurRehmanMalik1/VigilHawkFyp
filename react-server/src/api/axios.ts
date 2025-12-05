// src/api/axiosInstance.ts
import axios from 'axios';

// Create an axios instance with base URL pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000',  // or use your container hostname if needed
  timeout: 10000,                    // optional: timeout in ms
});

// Request interceptor (e.g., attach auth token)
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken'); // or however you store it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor (handle global errors)
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Network error, server down, etc
      alert('Network error, please try again later.');
    } else if (error.response.status === 401) {
      // Unauthorized - maybe token expired
      alert('Session expired. Please login again.');
      // Optionally redirect to login page here
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
