// Configuration file for The Daily David App
// Supports multiple environments: development, staging, production
// Now using Neon database instead of Supabase

const config = {
  // Development Environment
  development: {
    neonConnectionString: 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-curly-bird-91689233-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    tableName: 'daily_david_entries_dev', // Development table
    enableDebugLogging: true,
    enableMockData: true,
    environment: 'development',
    appTitle: 'The Daily David - DEV'
  },

  // Production Environment
  production: {
    neonConnectionString: 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-curly-bird-91689233-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    tableName: 'daily_david_entries', // Production table
    enableDebugLogging: false,
    enableMockData: false,
    environment: 'production',
    appTitle: 'The Daily David - Spiritual Growth Tool'
  }
};

// Get current environment (default to development)
const getCurrentEnvironment = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const env = urlParams.get('env') || 'development';
  return env in config ? env : 'development';
};

// Get current config
const getConfig = () => {
  const env = getCurrentEnvironment();
  return config[env];
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config, getCurrentEnvironment, getConfig };
} else {
  window.appConfig = { config, getCurrentEnvironment, getConfig };
}
