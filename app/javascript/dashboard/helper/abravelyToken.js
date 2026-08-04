/**
 * Gerenciador da Fonte Única do JWT Abravely Chat no Frontend
 * Armazena e recupera exclusivamente o Token JWT emitido pelo backend Abravely Express.
 * NUNCA utiliza ou aceita cookies/headers Devise/Rails (ex: cw_d_session_info / access-token).
 */

export const ABRAVELY_JWT_TOKEN_KEY = 'abravely_jwt_token';

export const getAbravelyJwtToken = () => {
  if (typeof window === 'undefined') return null;

  // 1. Tentar recuperar da variavel global de configuracao
  if (window.chatwootConfig?.abravelyJwtToken) {
    return window.chatwootConfig.abravelyJwtToken;
  }

  // 2. Tentar recuperar de localStorage
  try {
    const token = localStorage.getItem(ABRAVELY_JWT_TOKEN_KEY);
    if (token && typeof token === 'string' && token.split('.').length === 3) {
      return token;
    }
  } catch (e) {
    // Ignorar erro de acesso a localStorage
  }

  // 3. Tentar recuperar de sessionStorage
  try {
    const token = sessionStorage.getItem(ABRAVELY_JWT_TOKEN_KEY);
    if (token && typeof token === 'string' && token.split('.').length === 3) {
      return token;
    }
  } catch (e) {
    // Ignorar erro de acesso a sessionStorage
  }

  return null;
};

export const setAbravelyJwtToken = (token) => {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    console.warn('[Abravely Token] Tentativa de salvar token JWT inválido rejeitada.');
    return false;
  }

  try {
    localStorage.setItem(ABRAVELY_JWT_TOKEN_KEY, token);
    sessionStorage.setItem(ABRAVELY_JWT_TOKEN_KEY, token);
    if (window.chatwootConfig) {
      window.chatwootConfig.abravelyJwtToken = token;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const clearAbravelyJwtToken = () => {
  try {
    localStorage.removeItem(ABRAVELY_JWT_TOKEN_KEY);
    sessionStorage.removeItem(ABRAVELY_JWT_TOKEN_KEY);
    if (window.chatwootConfig) {
      delete window.chatwootConfig.abravelyJwtToken;
    }
  } catch (e) {
    // Ignorar erro
  }
};
