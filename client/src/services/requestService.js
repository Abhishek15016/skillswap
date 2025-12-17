import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  return config;
});

export const requestService = {
  async getRequests() {
    try {
      console.log('🔍 requestService: Fetching requests...');
      const response = await api.get('/requests');
      console.log('✅ requestService: Response received:', response.data);
      return response.data.requests;
    } catch (error) {
      console.error('❌ requestService: Error fetching requests:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch requests');
    }
  },

  async createRequest(requestData) {
    try {
      console.log('🔍 requestService: Creating request with data:', requestData);
      const response = await api.post('/requests', requestData);
      console.log('✅ requestService: Request created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ requestService: Error creating request:', error);
      throw new Error(error.response?.data?.error || 'Failed to create request');
    }
  },

  async updateRequest(requestId, status) {
    try {
      const response = await api.put(`/requests/${requestId}`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update request');
    }
  },

  async deleteRequest(requestId) {
    try {
      const response = await api.delete(`/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete request');
    }
  },

  async getRequest(requestId) {
    try {
      const response = await api.get(`/requests/${requestId}`);
      return response.data.request;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch request');
    }
  },
}; 