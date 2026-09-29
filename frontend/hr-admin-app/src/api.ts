import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL || !BACKEND_URL) {
  throw new Error('VITE_API_BASE_URL and VITE_BACKEND_URL must be configured');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPhotoUrl = (path: string | null) => {
  if (!path) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};
