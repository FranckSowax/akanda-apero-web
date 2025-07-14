/**
 * Utilitaires pour la gestion des numéros de téléphone WhatsApp
 */

/**
 * Nettoie et formate un numéro de téléphone
 * @param phone - Le numéro de téléphone à nettoyer
 * @returns Le numéro nettoyé (chiffres uniquement)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Formate un numéro de téléphone gabonais
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté avec le préfixe +241
 */
export function formatGabonPhone(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // Si le numéro commence déjà par 241, on ajoute juste le +
  if (cleaned.startsWith('241')) {
    return `+${cleaned}`;
  }
  
  // Si le numéro commence par 0, on le remplace par +241
  if (cleaned.startsWith('0')) {
    return `+241${cleaned.substring(1)}`;
  }
  
  // Sinon, on ajoute +241 au début
  return `+241${cleaned}`;
}

/**
 * Valide un numéro de téléphone gabonais
 * @param phone - Le numéro de téléphone à valider
 * @returns true si le numéro est valide, false sinon
 */
export function isValidGabonPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  
  // Vérifier si c'est un numéro gabonais valide
  // Format: +241XXXXXXXX (9 chiffres après 241)
  if (cleaned.startsWith('241')) {
    return cleaned.length === 12; // 241 + 9 chiffres
  }
  
  // Format local: 0XXXXXXXX (9 chiffres avec 0 au début)
  if (cleaned.startsWith('0')) {
    return cleaned.length === 9;
  }
  
  // Format sans préfixe: XXXXXXXX (8 chiffres)
  return cleaned.length === 8;
}

/**
 * Formate un numéro pour l'affichage
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté pour l'affichage (ex: +241 XX XX XX XX)
 */
export function formatPhoneDisplay(phone: string): string {
  const formatted = formatGabonPhone(phone);
  
  // Formater pour l'affichage: +241 XX XX XX XX
  if (formatted.length === 13) { // +241XXXXXXXXX
    return `${formatted.substring(0, 4)} ${formatted.substring(4, 6)} ${formatted.substring(6, 8)} ${formatted.substring(8, 10)} ${formatted.substring(10)}`;
  }
  
  return formatted;
}

/**
 * Obtient le message d'erreur pour un numéro invalide
 * @param phone - Le numéro de téléphone
 * @returns Le message d'erreur ou null si valide
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone.trim()) {
    return 'Le numéro WhatsApp est requis';
  }
  
  if (!isValidGabonPhone(phone)) {
    return 'Veuillez entrer un numéro gabonais valide (ex: +241 XX XX XX XX)';
  }
  
  return null;
}
