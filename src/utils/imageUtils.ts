export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Replace with your actual API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
