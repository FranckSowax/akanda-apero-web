// Utilitaire partagé pour la gestion des emojis de catégories
// Utilisé dans les pages publiques et l'administration pour garantir la cohérence

/**
 * Fonction pour obtenir l'emoji approprié pour chaque catégorie
 * @param categoryName - Le nom de la catégorie
 * @param fallbackIcon - L'icône de fallback (optionnel)
 * @returns L'emoji correspondant à la catégorie
 */
export const getCategoryEmoji = (categoryName: string, fallbackIcon?: string): string => {
  const emojiMap: Record<string, string> = {
    'whisky': '🥃',
    'rhum': '🍹',
    'tequila': '🌵',
    'vodka': '🧊',
    'gin': '🍸',
    'cognac': '🥃',
    'armagnac': '🥃',
    'brandy': '🥃',
    'liqueurs': '🍷',
    'vins': '🍷',
    'vin rouge': '🍷',
    'vin blanc': '🍷',
    'vin rosé': '🍷',
    'champagnes': '🥂',
    'champagne': '🥂',
    'bières': '🍺',
    'bière': '🍺',
    'cocktails': '🍹',
    'cocktail': '🍹',
    'spiritueux': '🍾',
    'apéritifs': '🍫',
    'apéritif': '🍫',
    'sodas': '🥤',
    'soda': '🥤',
    'jus': '🥤',
    'sans alcool': '🥛',
    'formules': '🎁',
    'formule': '🎁',
    'dépannage': '🛒',
    'glaçons': '🧊',
    'glaçon': '🧊',
    'liqueurs douces': '🍯',
    'liqueur douce': '🍯',
    'apéritifs naturels': '🌿',
    'apéritif naturel': '🌿',
    'pastis': '🌿',
    'absinthe': '🌿',
    'porto': '🍷',
    'sherry': '🍷',
    'vermouth': '🍸',
    'sake': '🍶',
    'mezcal': '🌵',
    'cachaça': '🍹',
    'bourbon': '🥃',
    'scotch': '🥃',
    'irish': '🥃',
    'rye': '🥃',
    'single malt': '🥃',
    'blended': '🥃'
  };
  
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Recherche exacte d'abord
  if (emojiMap[normalizedName]) {
    return emojiMap[normalizedName];
  }
  
  // Recherche partielle pour les noms composés
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return emoji;
    }
  }
  
  // Fallback vers l'icône existante ou emoji par défaut
  return fallbackIcon || '🏷️';
};

/**
 * Liste des options d'emojis disponibles pour l'admin
 * Synchronisée avec la fonction getCategoryEmoji
 */
export const categoryEmojiOptions = [
  { emoji: '🎁', name: 'Formules' },
  { emoji: '🍷', name: 'Vins' },
  { emoji: '🍸', name: 'Liqueurs' },
  { emoji: '🍺', name: 'Bières' },
  { emoji: '🥂', name: 'Champagnes' },
  { emoji: '🍫', name: 'Apéritifs & sucreries' },
  { emoji: '🥤', name: 'Sodas & jus' },
  { emoji: '🛒', name: 'Dépannage' },
  { emoji: '🧊', name: 'Glaçons' },
  { emoji: '🥃', name: 'Whisky' },
  { emoji: '🍹', name: 'Cocktails' },
  { emoji: '🥛', name: 'Sans Alcool' },
  { emoji: '🍾', name: 'Spiritueux' },
  { emoji: '🍯', name: 'Liqueurs douces' },
  { emoji: '🌿', name: 'Apéritifs naturels' },
  { emoji: '🌵', name: 'Tequila' },
  { emoji: '🍶', name: 'Sake' },
  { emoji: '🏷️', name: 'Général' }
];

/**
 * Fonction pour obtenir l'emoji par défaut basé sur le type de catégorie
 * @param categoryName - Le nom de la catégorie
 * @returns L'emoji par défaut approprié
 */
export const getDefaultCategoryEmoji = (categoryName: string): string => {
  return getCategoryEmoji(categoryName, '🏷️');
};
