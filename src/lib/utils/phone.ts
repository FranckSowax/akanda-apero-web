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
 * Formate un numéro de téléphone
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté sans indicatif automatique
 */
export function formatGabonPhone(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // Si le numéro commence déjà par + (indicatif international), le garder tel quel
  if (phone.trim().startsWith('+')) {
    return phone.trim();
  }
  
  // Si le numéro commence par 0, le supprimer
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  
  // Sinon, retourner le numéro nettoyé
  return cleaned;
}

/**
 * Valide un numéro de téléphone gabonais
 * @param phone - Le numéro de téléphone à valider
 * @returns true si le numéro est valide, false sinon
 */
export function isValidGabonPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  
  // Accepter différents formats de numéros
  // Format international: +241XXXXXXXX (9 chiffres après 241)
  if (cleaned.startsWith('241')) {
    return cleaned.length === 12; // 241 + 9 chiffres
  }
  
  // Format local avec 0: 0XXXXXXXX (9 chiffres avec 0 au début)
  if (cleaned.startsWith('0')) {
    return cleaned.length === 9;
  }
  
  // Format local sans préfixe: XXXXXXXX (8 chiffres)
  if (cleaned.length === 8) {
    return true;
  }
  
  // Format international d'autres pays (accepter les numéros avec +)
  if (phone.trim().startsWith('+')) {
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
  
  return false;
}

/**
 * Formate un numéro pour l'affichage
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté pour l'affichage
 */
export function formatPhoneDisplay(phone: string): string {
  const formatted = formatGabonPhone(phone);
  
  // Si c'est un numéro avec indicatif international, formater avec espaces
  if (formatted.startsWith('+')) {
    // Garder l'indicatif et formater le reste
    return formatted;
  }
  
  // Pour les numéros locaux, formater avec espaces si assez long
  if (formatted.length === 8) {
    return `${formatted.substring(0, 2)} ${formatted.substring(2, 4)} ${formatted.substring(4, 6)} ${formatted.substring(6)}`;
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
    return 'Veuillez entrer un numéro de téléphone valide (ex: 07 12 34 56)';
  }
  
  return null;
}
