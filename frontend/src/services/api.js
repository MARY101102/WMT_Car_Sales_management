import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api/v1' 
  : 'http://192.168.8.100:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(`[API Error] ${error.response?.status} on ${error.config?.url}`);
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying, and not a login request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
           throw new Error('No refresh token');
        }

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        if (res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect to login (handled by App.js or Store)
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        // We can't navigate easily from here, but the 401 will propagate to the caller
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
