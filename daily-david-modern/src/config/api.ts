// API Configuration for different environments
const getApiUrl = () => {
  // Always use the current domain (no localhost)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Fallback for SSR
  return 'https://thedailydavid.vercel.app'
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
