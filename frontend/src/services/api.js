import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api.config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (name, email) => {
    const response = await api.put('/auth/profile', { name, email });
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
};

export const transactionService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/transactions${params ? `?${params}` : ''}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export const reportService = {
  getDashboard: async (month, year) => {
    const params = new URLSearchParams({ month, year }).toString();
    const response = await api.get(`/reports/dashboard?${params}`);
    return response.data;
  },

  getByPeriod: async (startDate, endDate, type) => {
    const params = new URLSearchParams({ startDate, endDate, type }).toString();
    const response = await api.get(`/reports/period?${params}`);
    return response.data;
  },

  getByCategory: async (month, year) => {
    const params = new URLSearchParams({ month, year }).toString();
    const response = await api.get(`/reports/categories?${params}`);
    return response.data;
  },
};

export const categoryService = {
  getAll: async (type) => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/categories${params}`);
    return response.data;
  },
};

export default api;
