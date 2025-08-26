/**
 * Utilitaires pour la normalisation des numéros de téléphone gabonais
 * Convertit les formats locaux (077889988) vers le format international (+24177889988)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
  originalPhone: string;
  format: 'local' | 'international' | 'international_foreign' | 'invalid';
  error?: string;
  country?: string;
}

/**
 * Normalise un numéro de téléphone vers le format international
 * Formats acceptés:
 * - 077889988 (local gabonais) -> +24177889988
 * - +24177889988 (international gabonais) -> +24177889988
 * - 24177889988 (gabonais sans +) -> +24177889988
 * - +33123456789 (international étranger) -> +33123456789 (conservé tel quel)
 * - +237123456789 (international étranger) -> +237123456789 (conservé tel quel)
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
  
  // Vérifier d'abord si c'est un numéro international étranger (commence par + et n'est pas +241)
  const foreignInternationalPattern = /^\+(\d{1,3})(\d+)$/;
  const foreignMatch = cleanPhone.match(foreignInternationalPattern);
  
  if (foreignMatch) {
    const countryCode = foreignMatch[1];
    
    // Si ce n'est pas le Gabon (+241), accepter le numéro tel quel
    if (countryCode !== '241') {
      // Validation basique : au moins 7 chiffres après l'indicatif pays
      const nationalNumber = foreignMatch[2];
      if (nationalNumber.length >= 7) {
        const countryNames: { [key: string]: string } = {
          '33': 'France',
          '237': 'Cameroun',
          '225': 'Côte d\'Ivoire',
          '221': 'Sénégal',
          '212': 'Maroc',
          '213': 'Algérie',
          '216': 'Tunisie',
          '1': 'États-Unis/Canada',
          '44': 'Royaume-Uni',
          '49': 'Allemagne',
          '39': 'Italie',
          '34': 'Espagne'
        };
        
        return {
          isValid: true,
          normalizedPhone: cleanPhone, // Conserver tel quel
          originalPhone: phone,
          format: 'international_foreign',
          country: countryNames[countryCode] || `Pays +${countryCode}`
        };
      } else {
        return {
          isValid: false,
          normalizedPhone: '',
          originalPhone: phone,
          format: 'invalid',
          error: 'Numéro international trop court'
        };
      }
    }
  }
  
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
    error: 'Format invalide. Utilisez 077889988, +24177889988 (Gabon) ou un numéro international (+33, +237, etc.)'
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
 * normalizeGabonPhone('+33123456789') -> { isValid: true, normalizedPhone: '+33123456789', format: 'international_foreign', country: 'France' }
 * normalizeGabonPhone('+237123456789') -> { isValid: true, normalizedPhone: '+237123456789', format: 'international_foreign', country: 'Cameroun' }
 * normalizeGabonPhone('123456') -> { isValid: false, error: 'Format invalide...' }
 */
