// Central de Configuracao de API e URLs do Abravely Chat 1.0

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Função utilitária para montar URLs completas de endpoints REST
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};
