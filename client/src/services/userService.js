import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

console.log('🔧 userService: API_URL =', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔧 API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    fullURL: config.baseURL + config.url,
    headers: config.headers
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const userService = {
  async getUsers(page = 1, limit = 20, search = '') {
    try {
      console.log('🔍 userService.getUsers called with:', { page, limit, search });
      
      const response = await api.get('/users', {
        params: { page, limit, search }
      });
      
      console.log('✅ userService.getUsers success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getUsers error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  async getUser(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
  },

  async updateUser(userId, userData) {
    try {
      console.log('🔍 userService.updateUser called with:', { userId, userData });
      
      const response = await api.put(`/users/${userId}`, userData);
      
      console.log('✅ userService.updateUser success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.updateUser error:', error);
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  },

  async uploadPhoto(userId, file) {
    try {
      console.log('🔍 userService.uploadPhoto called with:', { userId, fileName: file.name, fileSize: file.size });
      
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await api.post(`/users/${userId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ userService.uploadPhoto success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.uploadPhoto error:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload photo');
    }
  },

  async searchUsers(skill) {
    try {
      const response = await api.get('/users/search', {
        params: { skill }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search users');
    }
  },

  async changePassword(userId, passwordData) {
    try {
      console.log('🔍 userService.changePassword called with:', { userId });
      
      const response = await api.put(`/users/${userId}/password`, passwordData);
      
      console.log('✅ userService.changePassword success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.changePassword error:', error);
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  },
}; 