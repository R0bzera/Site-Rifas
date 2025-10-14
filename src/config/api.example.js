// Arquivo de exemplo para configuração da API
// Copie para api.js e ajuste conforme necessário

export const API_CONFIG = {
  // URL base da API - ALTERE CONFORME SEU AMBIENTE
  BASE_URL: process.env.VITE_API_BASE_URL || 'https://localhost:7092/api',
  
  // Chave para armazenar o token de autenticação no localStorage
  AUTH_KEY: 'sr_auth_v1',
  
  // Timeout para requisições (em milissegundos)
  TIMEOUT: 30000,
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Configurações de desenvolvimento
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Configurações de debug (apenas para desenvolvimento)
  DEBUG_MODE: process.env.VITE_DEBUG === 'true',
}

// Para usar em produção, crie um arquivo .env com:
// VITE_API_BASE_URL=https://sua-api-producao.com/api
// VITE_DEBUG=false