import axios from 'axios';

// Create an Axios instance pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

// This automatically attaches your JWT token to every request if you are logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;