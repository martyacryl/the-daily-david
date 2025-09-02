// API Configuration for different environments
const getApiUrl = () => {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3003'
  }
  
  // For production, use Vercel environment variables
  return process.env.VITE_API_URL || 'https://your-backend-domain.com'
}

export const API_BASE_URL = getApiUrl()

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },
  entries: `${API_BASE_URL}/api/entries`,
  users: `${API_BASE_URL}/api/admin/users`,
}
