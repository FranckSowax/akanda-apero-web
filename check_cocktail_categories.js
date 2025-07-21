#!/usr/bin/env node

// Script pour examiner les catégories réelles des cocktails dans la base de données
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase (utilise les variables d'environnement)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCocktailCategories() {
  try {
    console.log('🔍 Récupération des catégories de cocktails...\n');
    
    // Récupérer toutes les catégories uniques des cocktails
    const { data: cocktails, error: cocktailsError } = await supabase
      .from('cocktails_maison')
      .select('category, name')
      .not('category', 'is', null);
      
    if (cocktailsError) {
      console.error('❌ Erreur cocktails:', cocktailsError);
      return;
    }
    
    // Récupérer toutes les catégories uniques des mocktails
    const { data: mocktails, error: mocktailsError } = await supabase
      .from('mocktails')
      .select('category, name')
      .not('category', 'is', null);
      
    if (mocktailsError) {
      console.error('❌ Erreur mocktails:', mocktailsError);
      return;
    }
    
    // Analyser les catégories
    const cocktailCategories = new Map();
    const mocktailCategories = new Map();
    
    // Compter les cocktails par catégorie
    (cocktails || []).forEach(cocktail => {
      const category = cocktail.category;
      if (!cocktailCategories.has(category)) {
        cocktailCategories.set(category, []);
      }
      cocktailCategories.get(category).push(cocktail.name);
    });
    
    // Compter les mocktails par catégorie
    (mocktails || []).forEach(mocktail => {
      const category = mocktail.category;
      if (!mocktailCategories.has(category)) {
        mocktailCategories.set(category, []);
      }
      mocktailCategories.get(category).push(mocktail.name);
    });
    
    console.log('📊 CATÉGORIES DE COCKTAILS:');
    console.log('================================');
    for (const [category, items] of cocktailCategories.entries()) {
      console.log(`🍹 ${category} (${items.length} cocktails)`);
      items.forEach(name => console.log(`   - ${name}`));
      console.log('');
    }
    
    console.log('📊 CATÉGORIES DE MOCKTAILS:');
    console.log('================================');
    for (const [category, items] of mocktailCategories.entries()) {
      console.log(`🥤 ${category} (${items.length} mocktails)`);
      items.forEach(name => console.log(`   - ${name}`));
      console.log('');
    }
    
    // Générer la configuration des filtres d'ambiance
    const allCategories = new Set([
      ...cocktailCategories.keys(),
      ...mocktailCategories.keys()
    ]);
    
    console.log('🎯 CONFIGURATION RECOMMANDÉE POUR LES FILTRES:');
    console.log('===============================================');
    
    const filterConfig = generateFilterConfig([...allCategories]);
    console.log(filterConfig);
    
    // Sauvegarder la configuration dans un fichier
    fs.writeFileSync(
      path.join(process.cwd(), 'cocktail_filter_config.json'),
      JSON.stringify({
        categories: [...allCategories],
        cocktailsByCategory: Object.fromEntries(cocktailCategories),
        mocktailsByCategory: Object.fromEntries(mocktailCategories),
        filterConfig: filterConfig
      }, null, 2)
    );
    
    console.log('\n✅ Configuration sauvegardée dans cocktail_filter_config.json');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

function generateFilterConfig(categories) {
  const iconMap = {
    'signature': '✨',
    'classique': '🍸',
    'tropical': '🌴',
    'fruité': '🍓',
    'frais': '🧊',
    'épicé': '🌶️',
    'doux': '🍯',
    'amer': '🌿',
    'local': '🇬🇦',
    'festif': '🎉',
    'romantique': '💕',
    'famille': '🏡',
    'anniversaire': '🎂',
    'sans-alcool': '🚫'
  };
  
  const colorMap = {
    'signature': 'from-purple-100 to-purple-200',
    'classique': 'from-blue-100 to-blue-200',
    'tropical': 'from-green-100 to-green-200',
    'fruité': 'from-pink-100 to-pink-200',
    'frais': 'from-cyan-100 to-cyan-200',
    'épicé': 'from-red-100 to-red-200',
    'doux': 'from-yellow-100 to-yellow-200',
    'amer': 'from-emerald-100 to-emerald-200',
    'local': 'from-orange-100 to-orange-200',
    'festif': 'from-indigo-100 to-indigo-200',
    'romantique': 'from-rose-100 to-rose-200',
    'famille': 'from-teal-100 to-teal-200',
    'anniversaire': 'from-violet-100 to-violet-200',
    'sans-alcool': 'from-gray-100 to-gray-200'
  };
  
  const filters = [
    {
      id: 'all',
      name: 'Tous les cocktails',
      icon: '🍹',
      color: 'from-orange-100 to-orange-200',
      description: 'Tous nos cocktails et mocktails'
    }
  ];
  
  categories.forEach(category => {
    const categoryLower = category.toLowerCase();
    const icon = iconMap[categoryLower] || '🍸';
    const color = colorMap[categoryLower] || 'from-gray-100 to-gray-200';
    
    filters.push({
      id: categoryLower.replace(/\s+/g, '-'),
      name: category,
      icon: icon,
      color: color,
      description: `Cocktails de type ${category.toLowerCase()}`
    });
  });
  
  return filters;
}

// Exécuter le script
getCocktailCategories();
