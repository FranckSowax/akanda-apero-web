import { ApiResponse } from './types';

/**
 * Gestionnaire d'API générique qui facilite les appels API et gère les erreurs
 */
export async function apiHandler<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Si l'API est externe, utilisez NEXT_PUBLIC_API_URL, sinon utilisez l'API interne de Next.js
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    // Éviter de doubler le préfixe /api si l'endpoint commence déjà par /
    const url = endpoint.startsWith('/') 
      ? `${baseUrl}/api${endpoint}` 
      : `${baseUrl}/api/${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Une erreur est survenue',
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

// Fonctions d'aide pour les différents types de requêtes
export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}) => 
    apiHandler<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data: any, options: RequestInit = {}) => 
    apiHandler<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: any, options: RequestInit = {}) => 
    apiHandler<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: <T>(endpoint: string, data: any, options: RequestInit = {}) => 
    apiHandler<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string, options: RequestInit = {}) => 
    apiHandler<T>(endpoint, { ...options, method: 'DELETE' }),
};
