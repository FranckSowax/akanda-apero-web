/**
 * 🚨 Utilitaire de Gestion d'Erreurs - Akanda Apéro
 * 
 * Utilitaire pour améliorer la gestion et l'affichage des erreurs
 * dans toute l'application
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
  context?: string;
  timestamp: number;
}

/**
 * Formater une erreur pour l'affichage dans la console
 */
export function formatError(error: any, context?: string): ErrorInfo {
  const timestamp = Date.now();
  
  // Si l'erreur est null ou undefined
  if (!error) {
    return {
      message: 'Erreur inconnue (objet error vide)',
      context: context || 'unknown',
      timestamp
    };
  }

  // Si c'est une string
  if (typeof error === 'string') {
    return {
      message: error,
      context: context || 'string_error',
      timestamp
    };
  }

  // Si c'est un objet Error standard
  if (error instanceof Error) {
    return {
      message: error.message || 'Erreur sans message',
      stack: error.stack,
      context: context || 'error_object',
      timestamp
    };
  }

  // Si c'est un objet avec une propriété message
  if (error && typeof error === 'object' && error.message) {
    return {
      message: error.message,
      code: error.code || error.status,
      stack: error.stack,
      context: context || 'object_with_message',
      timestamp
    };
  }

  // Si c'est un objet quelconque
  if (error && typeof error === 'object') {
    try {
      return {
        message: JSON.stringify(error),
        context: context || 'generic_object',
        timestamp
      };
    } catch (jsonError) {
      return {
        message: 'Erreur non sérialisable',
        context: context || 'non_serializable',
        timestamp
      };
    }
  }

  // Fallback pour tous les autres cas
  return {
    message: String(error) || 'Erreur inconnue',
    context: context || 'unknown_type',
    timestamp
  };
}

/**
 * Logger une erreur de manière sécurisée
 */
export function logError(error: any, context?: string): void {
  const errorInfo = formatError(error, context);
  
  console.error(`🚨 [${errorInfo.context}] ${errorInfo.message}`, {
    timestamp: new Date(errorInfo.timestamp).toISOString(),
    stack: errorInfo.stack,
    code: errorInfo.code
  });
}

/**
 * Logger un warning de manière sécurisée
 */
export function logWarning(message: string, context?: string): void {
  console.warn(`⚠️ [${context || 'warning'}] ${message}`, {
    timestamp: new Date().toISOString()
  });
}

/**
 * Logger une info de manière sécurisée
 */
export function logInfo(message: string, context?: string): void {
  console.log(`ℹ️ [${context || 'info'}] ${message}`, {
    timestamp: new Date().toISOString()
  });
}

/**
 * Wrapper pour les blocs try-catch
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context: string,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return fallbackValue;
  }
}

/**
 * Wrapper pour les fonctions synchrones
 */
export function safeExecuteSync<T>(
  fn: () => T,
  context: string,
  fallbackValue?: T
): T | undefined {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    return fallbackValue;
  }
}

/**
 * Créer un gestionnaire d'erreur pour les composants React
 */
export function createErrorHandler(componentName: string) {
  return {
    logError: (error: any, action?: string) => {
      logError(error, `${componentName}${action ? `_${action}` : ''}`);
    },
    logWarning: (message: string, action?: string) => {
      logWarning(message, `${componentName}${action ? `_${action}` : ''}`);
    },
    logInfo: (message: string, action?: string) => {
      logInfo(message, `${componentName}${action ? `_${action}` : ''}`);
    }
  };
}

/**
 * Gestionnaire d'erreur global pour les erreurs non catchées
 */
export function setupGlobalErrorHandler(): void {
  // Erreurs JavaScript non catchées
  window.addEventListener('error', (event) => {
    logError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    }, 'global_error');
  });

  // Promesses rejetées non catchées
  window.addEventListener('unhandledrejection', (event) => {
    logError({
      message: 'Promesse rejetée non catchée',
      reason: event.reason
    }, 'unhandled_rejection');
  });
}

export default {
  formatError,
  logError,
  logWarning,
  logInfo,
  safeExecute,
  safeExecuteSync,
  createErrorHandler,
  setupGlobalErrorHandler
};
