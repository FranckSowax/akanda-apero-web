// Test simple de l'API Orders
// À exécuter dans la console du navigateur

console.log('🧪 Test simple API Orders');

// Test GET - Récupérer les commandes
async function testGetOrders() {
  try {
    console.log('📋 Test GET /api/orders...');
    const response = await fetch('/api/orders');
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ API GET fonctionne');
    } else {
      console.log('❌ Erreur API GET:', result.error);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

// Lancer le test
testGetOrders();
