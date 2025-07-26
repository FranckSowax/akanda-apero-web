// Test simple pour vérifier l'API de création de commande
const testOrderData = {
  customerInfo: {
    email: "test@example.com",
    first_name: "Jean",
    last_name: "Dupont",
    phone: "+24101234567"
  },
  deliveryInfo: {
    address: "123 Rue Test",
    city: "Libreville",
    location: {
      lat: 0.4162,
      lng: 9.4167,
      hasLocation: true
    },
    deliveryOption: "standard"
  },
  paymentInfo: {
    method: "cash"
  },
  items: [
    {
      id: 1,
      name: "Cocktail Test",
      price: 5000,
      quantity: 2,
      imageUrl: "https://example.com/test.jpg"
    }
  ],
  totalAmount: 12000,
  subtotal: 10000,
  deliveryCost: 2000,
  discount: 0
};

async function testCreateOrder() {
  try {
    console.log('🧪 Test de création de commande...');
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    });

    console.log('📡 Réponse:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📋 Résultat:', result);
    
    if (response.ok) {
      console.log('✅ Commande créée avec succès!');
    } else {
      console.error('❌ Erreur:', result);
    }
    
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

// Exécuter le test
testCreateOrder();
