// Script pour ajouter les nouveaux cocktails détox et mettre à jour les existants
// À exécuter avec Node.js : node scripts/add_detox_cocktails.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Nouveaux cocktails détox
const newDetoxCocktails = [
  {
    name: 'Green Detox',
    description: 'Cocktail détox rafraîchissant aux légumes verts, riche en vitamines et minéraux',
    emoji: '🥒',
    recipe: '1. Coupe concombre et pomme en morceaux. 2. Mixe-les avec épinards, jus de citron et eau dans un blender. 3. Filtre légèrement si nécessaire et sers frais.',
    base_price: 2500,
    category: 'detox',
    alcohol_percentage: 0,
    preparation_time_minutes: 10,
    difficulty_level: 1,
    image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=500&fit=crop',
    is_active: true,
    is_featured: false
  },
  {
    name: 'Menthe-Citron Detox',
    description: 'Boisson détox rafraîchissante à la menthe et citron, parfaite pour stimuler la digestion',
    emoji: '🌿',
    recipe: '1. Presse le citron dans un verre, ajoute la menthe et écrase légèrement. 2. Complète avec eau pétillante, miel et glaçons. 3. Remue doucement avant dégustation.',
    base_price: 2000,
    category: 'detox',
    alcohol_percentage: 0,
    preparation_time_minutes: 5,
    difficulty_level: 1,
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=500&fit=crop',
    is_active: true,
    is_featured: false
  },
  {
    name: 'Citrus Immunity',
    description: 'Cocktail détox aux agrumes et gingembre pour renforcer l\'immunité',
    emoji: '🍊',
    recipe: '1. Mélange tous les jus d\'agrumes avec le gingembre râpé. 2. Complète avec l\'eau fraîche. 3. Serre immédiatement avec des glaçons.',
    base_price: 2800,
    category: 'detox',
    alcohol_percentage: 0,
    preparation_time_minutes: 8,
    difficulty_level: 1,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&h=500&fit=crop',
    is_active: true,
    is_featured: false
  },
  {
    name: 'Avocado Colada',
    description: 'L\'exotisme au naturel - Cocktail détox alcoolisé à l\'avocat et ananas',
    emoji: '🥑',
    recipe: '1. Mets tous les ingrédients dans un blender. 2. Mixe jusqu\'à texture parfaitement lisse. 3. Verse dans un grand verre et décore avec un quartier d\'ananas.',
    base_price: 4500,
    category: 'detox',
    alcohol_percentage: 12,
    preparation_time_minutes: 8,
    difficulty_level: 2,
    image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=500&fit=crop',
    is_active: true,
    is_featured: false
  },
  {
    name: 'Avo-Gin Detox',
    description: 'Fraîcheur & équilibre - Cocktail détox au gin et avocat',
    emoji: '🥑',
    recipe: '1. Mixe l\'avocat avec le gin, citron vert, sirop d\'agave dans un blender jusqu\'à obtention d\'une crème lisse. 2. Verse le mélange dans un verre rempli de glaçons. 3. Complète doucement avec l\'eau pétillante. 4. Décore avec des feuilles de menthe et une rondelle de citron vert.',
    base_price: 4200,
    category: 'detox',
    alcohol_percentage: 10,
    preparation_time_minutes: 10,
    difficulty_level: 2,
    image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=500&fit=crop',
    is_active: true,
    is_featured: false
  }
];

// Nouveau mocktail
const newMocktail = {
  name: 'Avo-Banane Smoothie',
  description: 'Douceur crémeuse & saine - Smoothie détox pour enfants à l\'avocat et banane',
  emoji: '🥑',
  recipe: '1. Place l\'avocat et la banane dans un blender. 2. Verse le lait d\'amande et le miel. 3. Mixe jusqu\'à obtenir une texture onctueuse. 4. Sers immédiatement avec des glaçons.',
  base_price: 2200,
  preparation_time_minutes: 5,
  image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&h=500&fit=crop',
  is_active: true,
  alcohol_percentage: 0,
  difficulty_level: 1,
  is_featured: false
};

// Mises à jour des recettes existantes
const recipeUpdates = {
  margarita: {
    recipe: '1. Humidifie le bord du verre, trempe-le dans du sel. 2. Secoue tequila, triple sec et citron dans un shaker. 3. Verse sur glaçons dans le verre, décore d\'une rondelle de citron.',
    preparation_time_minutes: 5,
    difficulty_level: 1
  },
  mojito: {
    recipe: '1. Mets le citron, le sucre et la menthe dans un verre. 2. Utilise le muddler pour presser doucement. 3. Ajoute le rhum, des glaçons, puis l\'eau gazeuse. 4. Remue avec la cuillère et garnis d\'un brin de menthe fraîche.',
    preparation_time_minutes: 5,
    difficulty_level: 1
  }
};

async function addDetoxCocktails() {
  console.log('🚀 Début de l\'ajout des cocktails détox...\n');

  try {
    // 1. Ajouter les nouveaux cocktails détox
    console.log('📝 Ajout des cocktails détox...');
    
    for (const cocktail of newDetoxCocktails) {
      // Vérifier si le cocktail existe déjà
      const { data: existing } = await supabase
        .from('cocktails_maison')
        .select('id')
        .eq('name', cocktail.name)
        .single();

      if (existing) {
        console.log(`⚠️  ${cocktail.name} existe déjà, mise à jour...`);
        const { error } = await supabase
          .from('cocktails_maison')
          .update(cocktail)
          .eq('name', cocktail.name);
        
        if (error) {
          console.error(`❌ Erreur mise à jour ${cocktail.name}:`, error.message);
        } else {
          console.log(`✅ ${cocktail.name} mis à jour`);
        }
      } else {
        const { error } = await supabase
          .from('cocktails_maison')
          .insert(cocktail);
        
        if (error) {
          console.error(`❌ Erreur ajout ${cocktail.name}:`, error.message);
        } else {
          console.log(`✅ ${cocktail.name} ajouté`);
        }
      }
    }

    // 2. Ajouter le nouveau mocktail
    console.log('\n📝 Ajout du nouveau mocktail...');
    
    const { data: existingMocktail } = await supabase
      .from('mocktails')
      .select('id')
      .eq('name', newMocktail.name)
      .single();

    if (existingMocktail) {
      console.log(`⚠️  ${newMocktail.name} existe déjà, mise à jour...`);
      const { error } = await supabase
        .from('mocktails')
        .update(newMocktail)
        .eq('name', newMocktail.name);
      
      if (error) {
        console.error(`❌ Erreur mise à jour ${newMocktail.name}:`, error.message);
      } else {
        console.log(`✅ ${newMocktail.name} mis à jour`);
      }
    } else {
      const { error } = await supabase
        .from('mocktails')
        .insert(newMocktail);
      
      if (error) {
        console.error(`❌ Erreur ajout ${newMocktail.name}:`, error.message);
      } else {
        console.log(`✅ ${newMocktail.name} ajouté`);
      }
    }

    // 3. Mettre à jour les recettes existantes
    console.log('\n📝 Mise à jour des recettes existantes...');
    
    // Margarita
    const { error: margaritaError } = await supabase
      .from('cocktails_maison')
      .update(recipeUpdates.margarita)
      .ilike('name', '%margarita%');
    
    if (margaritaError) {
      console.error('❌ Erreur mise à jour Margarita:', margaritaError.message);
    } else {
      console.log('✅ Recette Margarita mise à jour');
    }

    // Mojito
    const { error: mojitoError } = await supabase
      .from('cocktails_maison')
      .update(recipeUpdates.mojito)
      .ilike('name', '%mojito%');
    
    if (mojitoError) {
      console.error('❌ Erreur mise à jour Mojito:', mojitoError.message);
    } else {
      console.log('✅ Recette Mojito mise à jour');
    }

    // 4. Vérification des données ajoutées
    console.log('\n🔍 Vérification des données...');
    
    const { data: detoxCocktails } = await supabase
      .from('cocktails_maison')
      .select('name, category, price, alcohol_percentage')
      .eq('category', 'detox');
    
    console.log('\n📊 Cocktails détox en base:');
    detoxCocktails?.forEach(cocktail => {
      console.log(`  - ${cocktail.name} (${cocktail.alcohol_percentage}% alcool) - ${cocktail.price} XAF`);
    });

    const { data: mocktails } = await supabase
      .from('mocktails')
      .select('name, price')
      .eq('name', newMocktail.name);
    
    if (mocktails?.length > 0) {
      console.log('\n🥤 Nouveau mocktail ajouté:');
      console.log(`  - ${mocktails[0].name} - ${mocktails[0].price} XAF`);
    }

    console.log('\n🎉 Tous les cocktails détox ont été ajoutés avec succès !');
    console.log('\n💡 Vous pouvez maintenant voir la nouvelle catégorie "Detox" sur la page cocktails maison.');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  addDetoxCocktails().then(() => {
    console.log('\n✨ Script terminé avec succès !');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { addDetoxCocktails };
