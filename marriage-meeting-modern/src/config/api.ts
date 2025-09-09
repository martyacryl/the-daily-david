// Marriage Meeting Tool - API Configuration

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://theweeklyhuddle.vercel.app' : 'http://localhost:3001'),
  endpoints: {
    auth: '/api/auth',
    marriageWeeks: '/api/marriage-weeks',
    admin: '/api/admin'
  }
}

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL,
  enableDebugLogging: import.meta.env.VITE_DEBUG_LOGGING === 'true'
}

// Neon Database Configuration
export const NEON_CONFIG = {
  connectionString: import.meta.env.VITE_NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  tableName: import.meta.env.VITE_TABLE_NAME || 'marriage_meetings_dev'
}