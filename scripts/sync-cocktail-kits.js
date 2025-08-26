// Script pour synchroniser les kits de cocktails de démo avec Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration de Supabase
const supabaseUrl = 'https://biytvfkueftyprxxibzm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpeXR2Zmt1ZWZ0eXByeHhpYnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3NzI0MDAsImV4cCI6MjAzMDM0ODQwMH0.zRUL3Q-0PPD8k5NuUPJYOAhQFHvRqxX7MkMWSxDPy9M';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour générer un slug à partir d'un nom
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '');        // Enlever les tirets au début et à la fin
};

// Données des cocktails du site de démo
const cocktails = [
  {
    name: "Kit Mojito Royal",
    image: "https://imgur.com/7tXcRY2.jpg",
    description: "Un cocktail rafraîchissant à base de rhum blanc, menthe fraîche, citron vert et sucre de canne, avec une touche de champagne pour l'élégance.",
    ingredients: ["Rhum blanc", "Menthe fraîche", "Citron vert", "Sucre de canne", "Champagne"],
    difficulty: "Facile",
    basePrice: 9800,
    perPersonPrice: 4500,
    category: "Rhum",
    isPopular: true
  },
  {
    name: "Kit Old Fashioned",
    image: "https://imgur.com/hr8w6tp.jpg",
    description: "Ce cocktail classique combine whisky bourbon, sucre, angostura bitters et zeste d'orange pour une expérience riche et complexe.",
    ingredients: ["Bourbon", "Sucre", "Angostura bitters", "Zeste d'orange"],
    difficulty: "Moyen",
    basePrice: 12500,
    perPersonPrice: 5800,
    category: "Whisky",
    isPopular: true
  },
  {
    name: "Kit Gin Tonic Deluxe",
    image: "https://imgur.com/DmkfqHC.jpg",
    description: "Une version élaborée du Gin Tonic classique avec des botaniques premium, baies de genévrier, zestes d'agrumes et tonic artisanal.",
    ingredients: ["Gin premium", "Tonic artisanal", "Baies de genévrier", "Zestes d'agrumes", "Concombre"],
    difficulty: "Facile",
    basePrice: 10500,
    perPersonPrice: 4800,
    category: "Gin",
    isNew: true
  },
  {
    name: "Kit Margarita Passion",
    image: "https://imgur.com/nLqbdNf.jpg",
    description: "Une version exotique de la Margarita classique, enrichie de fruits de la passion pour une expérience gustative unique.",
    ingredients: ["Tequila silver", "Triple sec", "Fruits de la passion", "Citron vert", "Sel fin"],
    difficulty: "Moyen",
    basePrice: 11800,
    perPersonPrice: 5200,
    category: "Tequila"
  },
  {
    name: "Kit Moscow Mule Premium",
    image: "https://imgur.com/EoM9zRi.jpg",
    description: "Un cocktail vif et épicé qui mélange vodka, ginger beer artisanal et citron vert frais pour une explosion de saveurs.",
    ingredients: ["Vodka premium", "Ginger beer artisanal", "Citron vert", "Menthe fraîche", "Sirop de gingembre"],
    difficulty: "Facile",
    basePrice: 9500,
    perPersonPrice: 4200,
    category: "Vodka"
  },
  {
    name: "Kit Virgin Colada",
    image: "https://imgur.com/k7MbdX9.jpg",
    description: "Version sans alcool de la Piña Colada, parfaite pour toute la famille. Goûtez aux saveurs tropicales de l'ananas et de la noix de coco.",
    ingredients: ["Jus d'ananas", "Lait de coco", "Sirop de sucre de canne", "Ananas frais", "Glace pilée"],
    difficulty: "Facile",
    basePrice: 7500,
    perPersonPrice: 3500,
    category: "Sans alcool",
    isNew: true
  }
];

// Fonction pour insérer un cocktail kit et ses ingrédients
async function insertCocktailKit(cocktail) {
  try {
    console.log(`Ajout du kit: ${cocktail.name}...`);
    
    // Convertir l'URL de l'image si nécessaire (par exemple pour Imgur)
    let imageUrl = cocktail.image;
    if (imageUrl.match(/https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/)) {
      const imgurId = imageUrl.match(/https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/)[1];
      imageUrl = `https://i.imgur.com/${imgurId}.jpg`;
    }
    
    // Insérer le kit de cocktail
    const { data: kitData, error: kitError } = await supabase
      .from('cocktail_kits')
      .insert({
        name: cocktail.name,
        slug: generateSlug(cocktail.name),
        description: cocktail.description,
        image_url: imageUrl,
        price: cocktail.basePrice,
        is_available: true,
        difficulty: cocktail.difficulty || 'Facile',
        additional_person_price: cocktail.perPersonPrice || 0,
        stock_status: 'En stock',
        is_new: cocktail.isNew || false,
        is_popular: cocktail.isPopular || false,
        category_id: null  // À remplacer par l'ID réel de la catégorie si nécessaire
      })
      .select()
      .single();
    
    if (kitError) {
      throw kitError;
    }
    
    console.log(`Kit ajouté avec succès: ${kitData.id}`);
    
    // Ajouter les ingrédients
    if (cocktail.ingredients && cocktail.ingredients.length > 0) {
      const ingredientPromises = cocktail.ingredients.map(async (ingredient, index) => {
        const { data: ingData, error: ingError } = await supabase
          .from('cocktail_kit_ingredients')
          .insert({
            cocktail_kit_id: kitData.id,
            name: ingredient,
            quantity: 1,
            unit: ''
          });
        
        if (ingError) {
          console.error(`Erreur lors de l'ajout de l'ingrédient ${ingredient}:`, ingError);
        } else {
          console.log(`Ingrédient ajouté: ${ingredient}`);
        }
      });
      
      await Promise.all(ingredientPromises);
    }
    
    return kitData;
  } catch (error) {
    console.error(`Erreur lors de l'ajout du kit ${cocktail.name}:`, error);
    return null;
  }
}

// Fonction principale pour insérer tous les cocktails
async function syncCocktailKits() {
  console.log("Début de la synchronisation des kits de cocktails...");
  
  for (const cocktail of cocktails) {
    await insertCocktailKit(cocktail);
  }
  
  console.log("Synchronisation terminée!");
}

// Exécuter la synchronisation
syncCocktailKits()
  .catch(error => {
    console.error("Erreur lors de la synchronisation:", error);
  });
