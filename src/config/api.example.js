
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'https://localhost:7092/api',
  
  AUTH_KEY: 'sr_auth_v1',
  
  TIMEOUT: 30000,
  
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  DEBUG_MODE: process.env.VITE_DEBUG === 'true',
}
