// Définition de l'interface pour les catégories
export interface CategoryData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  color: string;
  icon?: string;
}

// Définition des catégories avec leurs codes couleur
export const categories = [
  {
    name: "Meilleures Ventes",
    slug: "meilleures-ventes",
    description: "Nos produits les plus populaires",
    image_url: "🔥",
    color: "#FFF5E8", // Beige très clair
    icon: "Star"
  },
  {
    name: "Formules",
    slug: "formules",
    description: "Packs et combos spéciaux",
    image_url: "🎁",
    color: "#F1E8FF", // Violet très clair
    icon: "Package"
  },
  {
    name: "Alcools",
    slug: "alcools",
    description: "Spiritueux et boissons fortes",
    image_url: "🥃",
    color: "#FFF9E0", // Beige/jaune clair
    icon: "GlassWater"
  },
  {
    name: "Vins",
    slug: "vins",
    description: "Sélection de vins fins",
    image_url: "🍷",
    color: "#FFEAEA", // Rose clair
    icon: "Wine"
  },
  {
    name: "Liqueurs",
    slug: "liqueurs",
    description: "Liqueurs et digestifs",
    image_url: "🍸",
    color: "#F6E8FF", // Rose/lavande clair
    icon: "Beaker"
  },
  {
    name: "Bières",
    slug: "bieres",
    description: "Bières locales et internationales",
    image_url: "🍺",
    color: "#FFFBE0", // Jaune très clair
    icon: "Beer"
  },
  {
    name: "Champagnes",
    slug: "champagnes",
    description: "Champagnes et vins mousseux",
    image_url: "🥂",
    color: "#FFFAE0", // Jaune clair
    icon: "Sparkles"
  },
  {
    name: "Apéritifs & sucreries",
    slug: "aperitifs-sucreries",
    description: "Snacks, biscuits et bonbons",
    image_url: "🍪",
    color: "#FFE9E4" // Rose saumon clair
  },
  {
    name: "Sodas & jus",
    slug: "sodas-jus",
    description: "Boissons non alcoolisées",
    image_url: "🍹",
    color: "#E8F5FF" // Bleu très clair
  },
  {
    name: "Dépannage",
    slug: "depannage",
    description: "Tout ce qu'il faut pour les urgences",
    image_url: "💸",
    color: "#E8FFEF" // Vert menthe très clair
  }
];
