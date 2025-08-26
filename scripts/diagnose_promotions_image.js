// Script de diagnostic pour vérifier l'upload et la sauvegarde des images dans les promotions
// Exécuter dans la console du navigateur sur la page admin des promotions

(function() {
    console.log('🔍 DIAGNOSTIC PROMOTIONS IMAGE_URL 🔍');
    
    // 1. Vérifier les données récupérées depuis Supabase
    console.log('📊 Vérification des promotions récupérées...');
    
    // Récupérer les promotions via fetch direct
    fetch('/api/promotions')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Promotions récupérées:', data);
            
            if (data.data && data.data.length > 0) {
                data.data.forEach((promo, index) => {
                    console.log(`🎯 Promotion ${index + 1}: ${promo.title}`);
                    console.log(`   - image_url: ${promo.image_url}`);
                    console.log(`   - image_url type: ${typeof promo.image_url}`);
                    console.log(`   - image_url length: ${promo.image_url?.length || 0}`);
                    console.log(`   - image_url null?: ${promo.image_url === null}`);
                    console.log(`   - image_url empty?: ${promo.image_url === ''}`);
                });
            } else {
                console.log('⚠️ Aucune promotion trouvée');
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors de la récupération:', error);
        });

    // 2. Vérifier l'upload d'image via Supabase Storage
    console.log('📁 Vérification du bucket Supabase...');
    
    // Vérifier les permissions du bucket
    fetch('https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/', {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                console.log('✅ Bucket promotions accessible');
            } else {
                console.log('❌ Bucket promotions non accessible:', response.status);
            }
        })
        .catch(error => {
            console.error('❌ Erreur bucket:', error);
        });

    // 3. Fonction de test pour créer une promotion avec image
    window.testPromotionImage = async function() {
        console.log('🧪 Test création promotion avec image...');
        
        const testPromotion = {
            title: 'TEST PROMO IMAGE',
            description: 'Test promotion avec image',
            discount_percentage: 20,
            image_url: 'https://mcdpzoisorbnhkjhljaj.supabase.co/storage/v1/object/public/promotions/test-image.jpg',
            background_color: '#ff0000',
            text_color: '#ffffff',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            is_featured: true
        };

        try {
            const response = await fetch('/api/promotions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPromotion)
            });
            
            const result = await response.json();
            console.log('✅ Promotion créée:', result);
            console.log('📸 Image URL:', result.image_url);
            
            return result;
        } catch (error) {
            console.error('❌ Erreur création:', error);
        }
    };

    // 4. Fonction de vérification des données Supabase
    window.checkSupabaseData = async function() {
        console.log('🔍 Vérification directe Supabase...');
        
        // Utiliser Supabase client directement si disponible
        if (window.supabase) {
            const { data, error } = await window.supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                return;
            }

            console.log('✅ Données Supabase:', data);
            data.forEach(promo => {
                console.log(`📸 ${promo.title}: image_url = ${promo.image_url}`);
            });
        } else {
            console.log('⚠️ Supabase client non disponible');
        }
    };

    console.log('🚀 Scripts de diagnostic chargés !');
    console.log('📋 Commandes disponibles:');
    console.log('   - testPromotionImage() : Créer une promotion test');
    console.log('   - checkSupabaseData() : Vérifier les données directement');
    
})();
