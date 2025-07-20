// Script de diagnostic corrigé pour les images de cocktails
// À exécuter dans la console du navigateur (F12 > Console)

console.log('=== DIAGNOSTIC IMAGES COCKTAILS (VERSION CORRIGÉE) ===');

// Fonction pour accéder au client Supabase depuis la page
function getSupabaseClient() {
  // Essayer différentes façons d'accéder au client Supabase
  if (typeof window !== 'undefined') {
    // Méthode 1: Si le client est exposé globalement
    if (window.supabase) {
      return window.supabase;
    }
    
    // Méthode 2: Essayer d'accéder via les modules React
    const reactFiberKey = Object.keys(document.querySelector('#__next') || {}).find(key => key.startsWith('__reactFiber'));
    if (reactFiberKey) {
      // Essayer d'extraire le client depuis le contexte React
      console.log('Tentative d\'extraction depuis React...');
    }
  }
  
  return null;
}

// Version simplifiée qui utilise fetch directement
async function diagnoseImageIssueSimple() {
  console.log('\n=== DIAGNOSTIC SIMPLIFIÉ ===');
  
  try {
    // 1. Vérifier si on peut accéder au client Supabase
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
      console.log('✅ Client Supabase trouvé');
      return diagnoseWithSupabase(supabaseClient);
    }
    
    console.log('⚠️ Client Supabase non accessible directement');
    console.log('💡 Diagnostic alternatif...');
    
    // 2. Diagnostic alternatif en analysant le DOM
    return diagnoseDOMImages();
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

async function diagnoseWithSupabase(supabase) {
  try {
    // Rechercher le cocktail Mojito
    console.log('\n2. Recherche du cocktail Mojito...');
    const { data: cocktails, error: cocktailError } = await supabase
      .from('cocktails_maison')
      .select('*')
      .ilike('name', '%mojito%');

    if (cocktailError) {
      console.error('❌ Erreur cocktails:', cocktailError);
    } else if (cocktails && cocktails.length > 0) {
      console.log('✅ Cocktail Mojito trouvé:', cocktails[0]);
      analyzeCocktail(cocktails[0], 'cocktail');
      return;
    }

    // Chercher dans les mocktails
    const { data: mocktails, error: mocktailError } = await supabase
      .from('mocktails')
      .select('*')
      .ilike('name', '%mojito%');

    if (mocktailError) {
      console.error('❌ Erreur mocktails:', mocktailError);
    } else if (mocktails && mocktails.length > 0) {
      console.log('✅ Mocktail Mojito trouvé:', mocktails[0]);
      analyzeCocktail(mocktails[0], 'mocktail');
      return;
    }

    console.log('❌ Aucun Mojito trouvé dans la base');
    
  } catch (error) {
    console.error('❌ Erreur Supabase:', error);
  }
}

function diagnoseDOMImages() {
  console.log('\n3. Diagnostic des images dans le DOM...');
  
  // Analyser les images dans l'admin
  const adminImages = document.querySelectorAll('table img, [class*="admin"] img');
  console.log(`Trouvé ${adminImages.length} images dans l'admin`);
  
  adminImages.forEach((img, index) => {
    console.log(`Image admin ${index + 1}:`, {
      src: img.src,
      alt: img.alt,
      loaded: img.complete && img.naturalWidth > 0,
      dimensions: img.complete ? `${img.naturalWidth}x${img.naturalHeight}` : 'Non chargée',
      visible: img.offsetWidth > 0 && img.offsetHeight > 0
    });
    
    // Marquer visuellement les images problématiques
    if (!img.complete || img.naturalWidth === 0) {
      img.style.border = '3px solid red';
      img.style.backgroundColor = 'rgba(255,0,0,0.1)';
      img.title = 'IMAGE NON CHARGÉE - ' + img.src;
    } else {
      img.style.border = '2px solid green';
      img.title = 'IMAGE OK - ' + img.src;
    }
  });
  
  // Analyser les URLs des images
  const imageUrls = Array.from(adminImages).map(img => img.src).filter(src => src);
  console.log('\n4. Analyse des URLs d\'images:');
  
  imageUrls.forEach((url, index) => {
    console.log(`URL ${index + 1}:`, url);
    analyzeImageUrl(url);
    testImageAccessibility(url, index + 1);
  });
  
  return imageUrls;
}

function analyzeCocktail(cocktail, type) {
  console.log(`\n3. Analyse du ${type} ${cocktail.name}:`);
  console.log('ID:', cocktail.id);
  console.log('Nom:', cocktail.name);
  console.log('Image URL:', cocktail.image_url);
  
  if (!cocktail.image_url) {
    console.log('❌ Aucune URL d\'image enregistrée !');
    console.log('💡 L\'image n\'a pas été sauvegardée en base de données');
    return;
  }
  
  console.log('✅ URL d\'image présente');
  testImageAccessibility(cocktail.image_url, 'Mojito');
  analyzeImageUrl(cocktail.image_url);
}

function testImageAccessibility(imageUrl, label = '') {
  console.log(`\n5. Test d'accessibilité ${label}...`);
  
  const img = new Image();
  const testLabel = label || imageUrl.split('/').pop();
  
  img.onload = function() {
    console.log(`✅ ${testLabel} - Image accessible:`, {
      dimensions: `${this.naturalWidth}x${this.naturalHeight}`,
      size: `${Math.round(this.naturalWidth * this.naturalHeight * 4 / 1024)}KB estimé`
    });
    
    // Afficher l'image de test
    showTestImage(imageUrl, testLabel, true);
  };
  
  img.onerror = function() {
    console.log(`❌ ${testLabel} - Image inaccessible`);
    console.log('💡 Causes possibles:');
    console.log('   - Permissions bucket Supabase');
    console.log('   - URL incorrecte');
    console.log('   - Image supprimée');
    console.log('   - Problème CORS');
    
    showTestImage(imageUrl, testLabel, false);
  };
  
  img.src = imageUrl;
}

function showTestImage(imageUrl, label, success) {
  // Créer un conteneur de test
  let testContainer = document.getElementById('image-test-container');
  if (!testContainer) {
    testContainer = document.createElement('div');
    testContainer.id = 'image-test-container';
    testContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: white;
      border: 2px solid ${success ? 'green' : 'red'};
      border-radius: 8px;
      padding: 10px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(testContainer);
  }
  
  const testDiv = document.createElement('div');
  testDiv.style.cssText = 'margin-bottom: 10px; padding: 5px; border-bottom: 1px solid #eee;';
  
  if (success) {
    testDiv.innerHTML = `
      <div style="font-weight: bold; color: green;">✅ ${label}</div>
      <img src="${imageUrl}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px; margin-top: 5px;" />
      <div style="font-size: 10px; color: #666; margin-top: 2px;">Image chargée avec succès</div>
    `;
  } else {
    testDiv.innerHTML = `
      <div style="font-weight: bold; color: red;">❌ ${label}</div>
      <div style="width: 100px; height: 60px; background: #f0f0f0; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; margin-top: 5px; border-radius: 4px;">
        <span style="font-size: 20px;">🚫</span>
      </div>
      <div style="font-size: 10px; color: #666; margin-top: 2px;">Échec du chargement</div>
    `;
  }
  
  testContainer.appendChild(testDiv);
  
  // Supprimer après 10 secondes
  setTimeout(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  }, 10000);
}

function analyzeImageUrl(imageUrl) {
  console.log('\n6. Analyse de l\'URL:');
  console.log('URL complète:', imageUrl);
  
  try {
    const url = new URL(imageUrl);
    console.log('Domaine:', url.hostname);
    console.log('Protocole:', url.protocol);
    console.log('Chemin:', url.pathname);
    
    if (url.hostname.includes('supabase')) {
      console.log('✅ URL Supabase détectée');
      
      // Analyser le chemin Supabase
      const pathParts = url.pathname.split('/');
      console.log('Parties du chemin:', pathParts);
      
      if (pathParts.includes('storage')) {
        const objectIndex = pathParts.indexOf('object');
        if (objectIndex > -1 && pathParts.length > objectIndex + 2) {
          const bucket = pathParts[objectIndex + 2];
          const filePath = pathParts.slice(objectIndex + 3).join('/');
          
          console.log('Bucket:', bucket);
          console.log('Chemin du fichier:', filePath);
          
          if (bucket !== 'images') {
            console.log('⚠️ Bucket inattendu. Attendu: "images", trouvé:', bucket);
          }
        }
      }
    } else {
      console.log('⚠️ URL non-Supabase');
    }
  } catch (e) {
    console.log('❌ URL malformée:', e.message);
  }
}

// Fonction pour obtenir des informations sur les buckets
async function checkSupabaseBuckets() {
  console.log('\n7. Vérification des buckets Supabase...');
  
  // Instructions pour vérifier manuellement
  console.log('📋 Vérifications manuelles à faire:');
  console.log('1. Dashboard Supabase > Storage > Buckets');
  console.log('2. Vérifier que le bucket "images" existe');
  console.log('3. Vérifier que "Public bucket" est activé');
  console.log('4. Ou qu\'une politique RLS permet l\'accès public');
  
  console.log('\n📝 Politique RLS recommandée:');
  console.log('CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = \'images\');');
}

// Fonction pour forcer le rechargement de la page admin
function forceAdminReload() {
  console.log('\n8. Rechargement de la page admin...');
  
  // Déclencher un rechargement des données
  const reloadEvent = new CustomEvent('forceReload');
  window.dispatchEvent(reloadEvent);
  
  // Modifier le localStorage pour déclencher un re-render
  localStorage.setItem('admin-reload-trigger', Date.now().toString());
  
  console.log('✅ Événements de rechargement déclenchés');
  console.log('💡 Si ça ne fonctionne pas, rechargez manuellement la page (F5)');
}

// Instructions et fonctions exposées
console.log('\n=== FONCTIONS DISPONIBLES ===');
console.log('diagnoseImageIssueSimple() - Diagnostic principal');
console.log('diagnoseDOMImages() - Analyser les images dans le DOM');
console.log('checkSupabaseBuckets() - Instructions pour vérifier les buckets');
console.log('forceAdminReload() - Forcer le rechargement des données');

// Exposer les fonctions
window.diagnoseImageIssueSimple = diagnoseImageIssueSimple;
window.diagnoseDOMImages = diagnoseDOMImages;
window.checkSupabaseBuckets = checkSupabaseBuckets;
window.forceAdminReload = forceAdminReload;

console.log('\n🚀 LANCEMENT AUTOMATIQUE DU DIAGNOSTIC...');
diagnoseImageIssueSimple();
