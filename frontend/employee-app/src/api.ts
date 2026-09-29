import axios from 'axios';

// API Base URL - default to port 3000 where backend is running
const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPhotoUrl = (path: string | null) => {
  if (!path) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  if (path.startsWith('http')) return path;
  return `http://localhost:3000${path}`;
};
