import axios from 'axios';
import { decryptPayload, isEncryptedEnvelop } from './cryptoService';

/**
 * Returns the normalized base URL for the backend API.
 * Guarantees that whether a full domain, trailing slash, or relative path is provided,
 * all endpoints correctly target the `/api` route.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response) => {
    if (isEncryptedEnvelop(response.data)) {
      try {
        const decryptedJson = await decryptPayload(response.data);
        response.data = JSON.parse(decryptedJson);
      } catch (error) {
        console.error('Failed to decrypt response payload from server:', error);
        return Promise.reject(new Error('Decryption failure for response payload'));
      }
    }
    return response;
  },
  async (error) => {
    if (error.response && isEncryptedEnvelop(error.response.data)) {
      try {
        const decryptedJson = await decryptPayload(error.response.data);
        error.response.data = JSON.parse(decryptedJson);
      } catch (decryptErr) {
        console.warn('Failed to decrypt error response payload:', decryptErr);
      }
    }
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or track requests
      const isAuthPath = window.location.pathname.includes('/login') || window.location.pathname.includes('/register') || window.location.pathname.includes('/track');
      if (!isAuthPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
