import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // твой бэкенд URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// перехватчик запросов (если нужно автоматом подставлять Bearer token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
