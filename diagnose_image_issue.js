// Script de diagnostic pour les images de cocktails
// À exécuter dans la console du navigateur (F12 > Console)

console.log('=== DIAGNOSTIC IMAGES COCKTAILS ===');

async function diagnoseImageIssue() {
  try {
    // 1. Importer le client Supabase
    const { supabase } = await import('/src/lib/supabase/client.ts');
    console.log('✅ Client Supabase importé');

    // 2. Récupérer les données du cocktail Mojito
    console.log('\n2. Recherche du cocktail Mojito...');
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails_maison')
      .select('*')
      .ilike('name', '%mojito%');

    if (cocktailError) {
      console.error('❌ Erreur lors de la récupération des cocktails:', cocktailError);
      return;
    }

    if (!cocktails || cocktails.length === 0) {
      console.log('⚠️ Aucun cocktail Mojito trouvé dans la base');
      
      // Chercher dans les mocktails aussi
      const { data: mocktails, error: mocktailError } = await supabase
        .from('mocktails')
        .select('*')
        .ilike('name', '%mojito%');
      
      if (mocktailError) {
        console.error('❌ Erreur lors de la récupération des mocktails:', mocktailError);
        return;
      }
      
      if (mocktails && mocktails.length > 0) {
        console.log('✅ Mojito trouvé dans les mocktails:', mocktails[0]);
        analyzeCocktail(mocktails[0], 'mocktail');
        return;
      }
      
      console.log('❌ Aucun Mojito trouvé dans cocktails_maison ni mocktails');
      return;
    }

    console.log('✅ Cocktail Mojito trouvé:', cocktails[0]);
    analyzeCocktail(cocktails[0], 'cocktail');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

function analyzeCocktail(cocktail, type) {
  console.log(`\n3. Analyse du ${type} ${cocktail.name}:`);
  console.log('ID:', cocktail.id);
  console.log('Nom:', cocktail.name);
  console.log('Image URL:', cocktail.image_url);
  
  if (!cocktail.image_url) {
    console.log('❌ Aucune URL d\'image enregistrée !');
    console.log('💡 Solution: L\'image n\'a pas été sauvegardée en base. Vérifiez le processus d\'upload.');
    return;
  }
  
  console.log('✅ URL d\'image présente:', cocktail.image_url);
  
  // 4. Tester l'accessibilité de l'image
  testImageAccessibility(cocktail.image_url);
  
  // 5. Analyser l'URL
  analyzeImageUrl(cocktail.image_url);
}

function testImageAccessibility(imageUrl) {
  console.log('\n4. Test d\'accessibilité de l\'image...');
  
  const img = new Image();
  
  img.onload = function() {
    console.log('✅ Image accessible et chargée avec succès');
    console.log('Dimensions:', this.naturalWidth + 'x' + this.naturalHeight);
    
    // Tester l'affichage dans le DOM
    testImageInDOM(imageUrl);
  };
  
  img.onerror = function() {
    console.log('❌ Impossible de charger l\'image');
    console.log('💡 Causes possibles:');
    console.log('   - URL incorrecte');
    console.log('   - Permissions bucket Supabase');
    console.log('   - Problème CORS');
    console.log('   - Image supprimée du storage');
    
    // Tester les permissions du bucket
    testBucketPermissions();
  };
  
  img.src = imageUrl;
}

function analyzeImageUrl(imageUrl) {
  console.log('\n5. Analyse de l\'URL:');
  console.log('URL complète:', imageUrl);
  
  try {
    const url = new URL(imageUrl);
    console.log('Domaine:', url.hostname);
    console.log('Chemin:', url.pathname);
    
    if (url.hostname.includes('supabase')) {
      console.log('✅ URL Supabase détectée');
      
      // Extraire les informations du chemin
      const pathParts = url.pathname.split('/');
      if (pathParts.includes('storage') && pathParts.includes('v1')) {
        const bucketIndex = pathParts.indexOf('object') + 2;
        const bucket = pathParts[bucketIndex];
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        console.log('Bucket:', bucket);
        console.log('Chemin du fichier:', filePath);
        
        if (bucket !== 'images') {
          console.log('⚠️ Le bucket devrait être "images", trouvé:', bucket);
        }
      }
    } else {
      console.log('⚠️ URL non-Supabase détectée');
    }
  } catch (e) {
    console.log('❌ URL malformée:', e.message);
  }
}

function testImageInDOM(imageUrl) {
  console.log('\n6. Test d\'affichage dans le DOM...');
  
  // Créer un élément image de test
  const testImg = document.createElement('img');
  testImg.src = imageUrl;
  testImg.style.cssText = 'position:fixed;top:10px;right:10px;width:100px;height:100px;object-fit:cover;border:2px solid red;z-index:9999;';
  testImg.title = 'Test image Mojito';
  
  testImg.onload = function() {
    console.log('✅ Image affichée dans le DOM avec succès');
    console.log('💡 L\'image fonctionne. Le problème est dans le code d\'affichage.');
    
    // Supprimer l'image de test après 5 secondes
    setTimeout(() => {
      if (testImg.parentNode) {
        testImg.parentNode.removeChild(testImg);
      }
    }, 5000);
  };
  
  testImg.onerror = function() {
    console.log('❌ Échec d\'affichage dans le DOM');
    if (testImg.parentNode) {
      testImg.parentNode.removeChild(testImg);
    }
  };
  
  document.body.appendChild(testImg);
}

async function testBucketPermissions() {
  console.log('\n7. Test des permissions du bucket...');
  
  try {
    const { supabase } = await import('/src/lib/supabase/client.ts');
    
    // Lister les fichiers du bucket images
    const { data, error } = await supabase.storage
      .from('images')
      .list('cocktails', {
        limit: 5,
        offset: 0
      });
    
    if (error) {
      console.log('❌ Erreur d\'accès au bucket:', error);
      console.log('💡 Vérifiez les permissions du bucket "images" dans Supabase');
    } else {
      console.log('✅ Accès au bucket réussi');
      console.log('Fichiers trouvés:', data.length);
      if (data.length > 0) {
        console.log('Premiers fichiers:', data.slice(0, 3).map(f => f.name));
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors du test des permissions:', error);
  }
}

// Fonction pour forcer le rechargement des données
async function forceReloadCocktails() {
  console.log('\n8. Rechargement forcé des données...');
  
  try {
    const { supabase } = await import('/src/lib/supabase/client.ts');
    
    // Récupérer toutes les données fraîches
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails_maison')
      .select('*')
      .order('updated_at', { ascending: false });
    
    const { data: mocktails, error: mocktailError } = await supabase
      .from('mocktails')
      .select('*')
      .order('updated_at', { ascending: false });
    
    console.log('Cocktails:', cocktails?.length || 0);
    console.log('Mocktails:', mocktails?.length || 0);
    
    // Afficher les derniers modifiés
    if (cocktails && cocktails.length > 0) {
      console.log('Dernier cocktail modifié:', cocktails[0].name, cocktails[0].image_url ? '(avec image)' : '(sans image)');
    }
    
    if (mocktails && mocktails.length > 0) {
      console.log('Dernier mocktail modifié:', mocktails[0].name, mocktails[0].image_url ? '(avec image)' : '(sans image)');
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du rechargement:', error);
  }
}

// Instructions d'utilisation
console.log('\n=== INSTRUCTIONS ===');
console.log('1. Pour diagnostiquer le problème: diagnoseImageIssue()');
console.log('2. Pour recharger les données: forceReloadCocktails()');
console.log('3. L\'image de test apparaîtra en haut à droite si elle fonctionne');

// Exposer les fonctions
window.diagnoseImageIssue = diagnoseImageIssue;
window.forceReloadCocktails = forceReloadCocktails;

console.log('\n=== DÉMARRAGE DU DIAGNOSTIC ===');
// Lancer automatiquement le diagnostic
diagnoseImageIssue();
