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

export const chatService = {
  async getChatRoom(requestId) {
    try {
      console.log('🔍 chatService: Fetching chat room for request ID:', requestId);
      const response = await api.get(`/chat/room/${requestId}`);
      console.log('✅ chatService: Chat room response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ chatService: Error fetching chat room:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch chat room');
    }
  },

  async getMessages(roomId) {
    try {
      const response = await api.get(`/chat/${roomId}`);
      return response.data.messages;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch messages');
    }
  },

  async sendMessage(roomId, text) {
    try {
      const response = await api.post(`/chat/${roomId}`, { text });
      return response.data.chat_message;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  },
}; 