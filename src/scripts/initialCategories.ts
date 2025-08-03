import { supabase } from '../lib/supabase/client';

// Définition des catégories avec leurs codes couleur
const categories = [
  {
    name: "Meilleures Ventes",
    slug: "meilleures-ventes",
    description: "Nos produits les plus populaires",
    image_url: "🔥",
    color: "#FFEED8" // Orange clair
  },
  {
    name: "Formules",
    slug: "formules",
    description: "Packs et combos spéciaux",
    image_url: "🎁",
    color: "#EEDBFF" // Violet clair
  },
  {
    name: "Alcools",
    slug: "alcools",
    description: "Spiritueux et boissons fortes",
    image_url: "🥃",
    color: "#FFF8D8" // Beige/doré
  },
  {
    name: "Vins",
    slug: "vins",
    description: "Sélection de vins fins",
    image_url: "🍷",
    color: "#FFE5E5" // Rose
  },
  {
    name: "Liqueurs",
    slug: "liqueurs",
    description: "Liqueurs et digestifs",
    image_url: "🍸",
    color: "#F9E5FF" // Rose clair
  },
  {
    name: "Bières",
    slug: "bieres",
    description: "Bières locales et internationales",
    image_url: "🍺",
    color: "#FFFBD8" // Jaune clair
  },
  {
    name: "Champagnes",
    slug: "champagnes",
    description: "Champagnes et vins mousseux",
    image_url: "🥂",
    color: "#FFF6E5" // Beige clair
  },
  {
    name: "Apéritifs & sucreries",
    slug: "aperitifs-sucreries",
    description: "Snacks, amuse-bouches et confiseries",
    image_url: "🍫",
    color: "#FFE8CC" // Orange/beige
  },
  {
    name: "Sodas & jus",
    slug: "sodas-jus",
    description: "Boissons sans alcool",
    image_url: "🥤",
    color: "#E5F0FF" // Bleu clair
  },
  {
    name: "Dépannage",
    slug: "depannage",
    description: "Articles essentiels et accessoires",
    image_url: "🛒",
    color: "#E5FFEF" // Vert clair
  }
];

// Fonction pour insérer ou mettre à jour les catégories
export async function initCategories() {
  // Initializing categories
  
  for (const category of categories) {
    // Vérifier si la catégorie existe déjà (par slug)
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('slug', category.slug)
      .single();
    
    if (existingCategory) {
      // Mettre à jour la catégorie existante
      const { error: updateError } = await supabase
        .from('categories')
        .update(category)
        .eq('id', existingCategory.id);
      
      if (updateError) {
        console.error(`Erreur lors de la mise à jour de la catégorie ${category.name}:`, updateError);
      } else {
        // Category updated
      }
    } else {
      // Créer une nouvelle catégorie
      const { error: insertError } = await supabase
        .from('categories')
        .insert(category);
      
      if (insertError) {
        console.error(`Erreur lors de la création de la catégorie ${category.name}:`, insertError);
      } else {
        // Category created
      }
    }
  }
  
  // Categories initialization completed
}

// Exécution directe
if (typeof window === 'undefined') {
  initCategories()
    .catch(console.error)
    .finally(() => {
      if (typeof process !== 'undefined') {
        process.exit(0);
      }
    });
}
