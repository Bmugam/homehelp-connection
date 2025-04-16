export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com'
  : 'http://localhost:3000';

export const API_TIMEOUT = 15000; // 15 seconds

export const API_RETRY_COUNT = 3;
