// Script de test pour l'API Orders avec GPS
// À exécuter dans la console du navigateur sur localhost:3000

console.log('🧪 Test de l\'API Orders avec GPS - Akanda Apéro');

// Données de test pour une commande avec GPS
const testOrderData = {
  customerInfo: {
    email: 'test@akandaapero.com',
    first_name: 'Jean',
    last_name: 'Dupont',
    phone: '+241 07 12 34 56'
  },
  deliveryInfo: {
    address: '123 Avenue de la Liberté',
    district: 'Libreville Centre',
    additionalInfo: 'Près de la pharmacie centrale',
    deliveryOption: 'standard',
    location: {
      lat: 0.3936,
      lng: 9.4673,
      hasLocation: true
    }
  },
  paymentInfo: {
    method: 'cash',
    email: 'test@akandaapero.com'
  },
  items: [
    {
      id: '1',
      name: 'Whisky Premium',
      price: 25000,
      quantity: 2,
      imageUrl: '/images/whisky.jpg'
    },
    {
      id: '2', 
      name: 'Champagne Rosé',
      price: 35000,
      quantity: 1,
      imageUrl: '/images/champagne.jpg'
    }
  ],
  totalAmount: 85000,
  subtotal: 85000,
  deliveryCost: 0,
  discount: 0
};

// Test 1: Créer une commande
async function testCreateOrder() {
  console.log('📝 Test 1: Création d\'une commande avec GPS...');
  
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Commande créée avec succès:', result.order);
      console.log('📍 GPS:', result.order.gps_latitude, result.order.gps_longitude);
      console.log('🗺️ Lien Waze:', result.order.waze_link);
      return result.order.id;
    } else {
      console.error('❌ Erreur création:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    return null;
  }
}

// Test 2: Récupérer les commandes
async function testGetOrders() {
  console.log('📋 Test 2: Récupération des commandes...');
  
  try {
    const response = await fetch('/api/orders?limit=5');
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ ${result.orders.length} commandes récupérées`);
      console.log('📊 Pagination:', result.pagination);
      
      // Afficher les liens de navigation pour chaque commande
      result.orders.forEach(order => {
        if (order.waze_link) {
          console.log(`🗺️ Commande ${order.order_number}: ${order.waze_link}`);
        }
      });
      
      return result.orders;
    } else {
      console.error('❌ Erreur récupération:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    return [];
  }
}

// Test 3: Mettre à jour le statut d'une commande
async function testUpdateOrder(orderId) {
  if (!orderId) {
    console.log('⚠️ Test 3: Pas d\'ID de commande pour la mise à jour');
    return;
  }
  
  console.log('🔄 Test 3: Mise à jour du statut...');
  
  try {
    const response = await fetch('/api/orders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: orderId,
        status: 'confirmed'
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Statut mis à jour:', result.order.status);
      return true;
    } else {
      console.error('❌ Erreur mise à jour:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    return false;
  }
}

// Test 4: Tester les filtres
async function testFilters() {
  console.log('🔍 Test 4: Test des filtres...');
  
  try {
    // Test filtre par statut
    const response = await fetch('/api/orders?status=pending&limit=3');
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Filtres: ${result.orders.length} commandes en attente`);
      return true;
    } else {
      console.error('❌ Erreur filtres:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests API Orders...\n');
  
  // Test 1: Créer une commande
  const orderId = await testCreateOrder();
  console.log('');
  
  // Test 2: Récupérer les commandes
  await testGetOrders();
  console.log('');
  
  // Test 3: Mettre à jour une commande
  await testUpdateOrder(orderId);
  console.log('');
  
  // Test 4: Tester les filtres
  await testFilters();
  console.log('');
  
  console.log('✅ Tests terminés !');
  console.log('💡 Vérifiez la base de données Supabase pour voir les données.');
}

// Lancer les tests automatiquement
runAllTests();
