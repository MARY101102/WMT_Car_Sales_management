import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://172.20.10.3:5000';

export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8';
  
  if (path.startsWith('http')) return path;
  
  // Ensure path starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};
