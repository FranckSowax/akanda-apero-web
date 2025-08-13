/**
 * Utilitaires pour la normalisation des numéros de téléphone gabonais
 * Convertit les formats locaux (077889988) vers le format international (+24177889988)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
  originalPhone: string;
  format: 'local' | 'international' | 'invalid';
  error?: string;
}

/**
 * Normalise un numéro de téléphone gabonais vers le format international
 * Formats acceptés:
 * - 077889988 (local) -> +24177889988
 * - +24177889988 -> +24177889988
 * - 24177889988 -> +24177889988
 */
export function normalizeGabonPhone(phone: string): PhoneValidationResult {
  if (!phone) {
    return {
      isValid: false,
      normalizedPhone: '',
      originalPhone: phone,
      format: 'invalid',
      error: 'Numéro de téléphone requis'
    };
  }

  // Nettoyer le numéro (supprimer espaces, tirets, parenthèses, points)
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Patterns pour les numéros gabonais
  const localPattern = /^0([67]\d{7})$/; // 077889988 ou 067889988
  const internationalWithPlusPattern = /^\+241([67]\d{7})$/; // +24177889988
  const internationalWithoutPlusPattern = /^241([67]\d{7})$/; // 24177889988
  
  // Format local gabonais (077889988)
  const localMatch = cleanPhone.match(localPattern);
  if (localMatch) {
    const nationalNumber = localMatch[1]; // 77889988 (sans le 0)
    return {
      isValid: true,
      normalizedPhone: `+241${nationalNumber}`,
      originalPhone: phone,
      format: 'local'
    };
  }
  
  // Format international avec + (+24177889988)
  const internationalPlusMatch = cleanPhone.match(internationalWithPlusPattern);
  if (internationalPlusMatch) {
    return {
      isValid: true,
      normalizedPhone: cleanPhone, // Déjà au bon format
      originalPhone: phone,
      format: 'international'
    };
  }
  
  // Format international sans + (24177889988)
  const internationalMatch = cleanPhone.match(internationalWithoutPlusPattern);
  if (internationalMatch) {
    return {
      isValid: true,
      normalizedPhone: `+${cleanPhone}`, // Ajouter le +
      originalPhone: phone,
      format: 'international'
    };
  }
  
  return {
    isValid: false,
    normalizedPhone: '',
    originalPhone: phone,
    format: 'invalid',
    error: 'Format invalide. Utilisez 077889988 ou +24177889988'
  };
}

/**
 * Formate un numéro normalisé pour l'affichage
 * +24177889988 -> +241 77 88 99 88
 */
export function formatGabonPhoneForDisplay(normalizedPhone: string): string {
  if (!normalizedPhone || !normalizedPhone.startsWith('+241')) {
    return normalizedPhone;
  }
  
  // +24177889988 -> +241 77 88 99 88
  const countryCode = '+241';
  const number = normalizedPhone.substring(4); // 77889988
  
  if (number.length === 8) {
    return `${countryCode} ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)}`;
  }
  
  return normalizedPhone;
}

/**
 * Convertit un numéro normalisé vers le format local pour l'affichage
 * +24177889988 -> 077889988
 */
export function formatGabonPhoneToLocal(normalizedPhone: string): string {
  if (!normalizedPhone || !normalizedPhone.startsWith('+241')) {
    return normalizedPhone;
  }
  
  const number = normalizedPhone.substring(4); // 77889988
  return `0${number}`; // 077889988
}

/**
 * Valide si un numéro est un numéro gabonais valide
 */
export function isValidGabonPhone(phone: string): boolean {
  const result = normalizeGabonPhone(phone);
  return result.isValid;
}

/**
 * Exemples d'utilisation:
 * normalizeGabonPhone('077889988') -> { isValid: true, normalizedPhone: '+24177889988', format: 'local' }
 * normalizeGabonPhone('+24177889988') -> { isValid: true, normalizedPhone: '+24177889988', format: 'international' }
 * normalizeGabonPhone('24177889988') -> { isValid: true, normalizedPhone: '+24177889988', format: 'international' }
 * normalizeGabonPhone('123456') -> { isValid: false, error: 'Format invalide...' }
 */
