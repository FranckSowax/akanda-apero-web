// Solutions pour corriger l'affichage des images de cocktails
// À exécuter dans la console après le diagnostic

console.log('=== SOLUTIONS POUR CORRIGER L\'AFFICHAGE DES IMAGES ===');

// Solution 1: Corriger les permissions du bucket Supabase
async function fixBucketPermissions() {
  console.log('\n1. Instructions pour corriger les permissions du bucket:');
  console.log('📋 Dans votre dashboard Supabase:');
  console.log('   1. Allez dans Storage > Buckets');
  console.log('   2. Cliquez sur le bucket "images"');
  console.log('   3. Allez dans Settings');
  console.log('   4. Activez "Public bucket" si ce n\'est pas fait');
  console.log('   5. Ou ajoutez une politique RLS pour permettre l\'accès public aux images');
  
  console.log('\n📝 Politique RLS recommandée:');
  console.log(`
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
  `);
}

// Solution 2: Forcer la mise à jour de l'état React
async function forceStateUpdate() {
  console.log('\n2. Forcer la mise à jour de l\'état React...');
  
  // Déclencher un événement de rechargement
  if (typeof window !== 'undefined') {
    // Simuler un rechargement des données
    const event = new CustomEvent('reloadCocktails');
    window.dispatchEvent(event);
    
    // Forcer un re-render en modifiant le localStorage
    const timestamp = Date.now();
    localStorage.setItem('cocktail-refresh', timestamp.toString());
    
    console.log('✅ Événement de rechargement déclenché');
    console.log('💡 Rechargez la page pour voir les changements');
  }
}

// Solution 3: Corriger l'URL de l'image si elle est malformée
async function fixImageUrl(cocktailId, correctImageUrl) {
  console.log('\n3. Correction de l\'URL d\'image...');
  
  try {
    const { supabase } = await import('/src/lib/supabase/client.ts');
    
    const { data, error } = await supabase
      .from('cocktails_maison')
      .update({ image_url: correctImageUrl })
      .eq('id', cocktailId)
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
    } else {
      console.log('✅ URL d\'image mise à jour:', data);
      forceStateUpdate();
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Solution 4: Tester et corriger l'affichage dans l'admin
function testAdminImageDisplay() {
  console.log('\n4. Test de l\'affichage dans l\'admin...');
  
  // Chercher les images dans le tableau admin
  const adminImages = document.querySelectorAll('table img');
  console.log(`Trouvé ${adminImages.length} images dans le tableau admin`);
  
  adminImages.forEach((img, index) => {
    console.log(`Image ${index + 1}:`, {
      src: img.src,
      loaded: img.complete && img.naturalWidth > 0,
      dimensions: `${img.naturalWidth}x${img.naturalHeight}`
    });
    
    // Ajouter une bordure rouge aux images qui ne chargent pas
    if (!img.complete || img.naturalWidth === 0) {
      img.style.border = '2px solid red';
      img.title = 'Image non chargée';
    } else {
      img.style.border = '2px solid green';
      img.title = 'Image OK';
    }
  });
}

// Solution 5: Corriger l'affichage sur la page publique
function testPublicPageDisplay() {
  console.log('\n5. Test de l\'affichage sur la page publique...');
  
  // Si on est sur la page cocktails-maison
  if (window.location.pathname.includes('cocktails-maison')) {
    const publicImages = document.querySelectorAll('.cocktail-card img, .mocktail-card img');
    console.log(`Trouvé ${publicImages.length} images sur la page publique`);
    
    publicImages.forEach((img, index) => {
      console.log(`Image publique ${index + 1}:`, {
        src: img.src,
        loaded: img.complete && img.naturalWidth > 0
      });
    });
  } else {
    console.log('💡 Naviguez vers /cocktails-maison pour tester l\'affichage public');
  }
}

// Solution 6: Régénérer l'URL publique Supabase
async function regeneratePublicUrl(filePath) {
  console.log('\n6. Régénération de l\'URL publique...');
  
  try {
    const { supabase } = await import('/src/lib/supabase/client.ts');
    
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    console.log('Nouvelle URL publique:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('❌ Erreur lors de la régénération:', error);
  }
}

// Solution 7: Upload de test
async function testImageUpload() {
  console.log('\n7. Test d\'upload d\'image...');
  
  // Créer une image de test (1x1 pixel rouge)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 1, 1);
  
  canvas.toBlob(async (blob) => {
    try {
      const { supabase } = await import('/src/lib/supabase/client.ts');
      
      const fileName = `test-${Date.now()}.png`;
      const filePath = `cocktails/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, blob);
      
      if (error) {
        console.error('❌ Erreur d\'upload de test:', error);
      } else {
        console.log('✅ Upload de test réussi:', data);
        
        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        console.log('URL de test:', urlData.publicUrl);
        
        // Tester l'affichage
        const testImg = document.createElement('img');
        testImg.src = urlData.publicUrl;
        testImg.style.cssText = 'position:fixed;top:60px;right:10px;width:50px;height:50px;border:2px solid blue;z-index:9999;';
        testImg.title = 'Test upload';
        document.body.appendChild(testImg);
        
        setTimeout(() => {
          if (testImg.parentNode) {
            testImg.parentNode.removeChild(testImg);
          }
          // Supprimer le fichier de test
          supabase.storage.from('images').remove([filePath]);
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Erreur lors du test d\'upload:', error);
    }
  }, 'image/png');
}

// Instructions d'utilisation
console.log('\n=== FONCTIONS DISPONIBLES ===');
console.log('fixBucketPermissions() - Instructions pour corriger les permissions');
console.log('forceStateUpdate() - Force la mise à jour de l\'état React');
console.log('fixImageUrl(id, url) - Corrige l\'URL d\'une image spécifique');
console.log('testAdminImageDisplay() - Teste l\'affichage dans l\'admin');
console.log('testPublicPageDisplay() - Teste l\'affichage sur la page publique');
console.log('regeneratePublicUrl(path) - Régénère une URL publique');
console.log('testImageUpload() - Teste l\'upload d\'une image');

// Exposer les fonctions
window.fixBucketPermissions = fixBucketPermissions;
window.forceStateUpdate = forceStateUpdate;
window.fixImageUrl = fixImageUrl;
window.testAdminImageDisplay = testAdminImageDisplay;
window.testPublicPageDisplay = testPublicPageDisplay;
window.regeneratePublicUrl = regeneratePublicUrl;
window.testImageUpload = testImageUpload;

console.log('\n💡 Commencez par: testAdminImageDisplay()');
testAdminImageDisplay();
