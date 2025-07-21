// Script de diagnostic pour vérifier les order_items et les données de vente
// Exécuter avec: node diagnose_order_items.js

console.log('🔍 Diagnostic des données de vente (order_items)...\n');

// Simuler un test avec fetch direct vers Supabase
const testOrderItems = async () => {
  try {
    // Test 1: Vérifier si la table order_items existe et contient des données
    console.log('📊 Test 1: Vérification de la table order_items');
    
    // Test 2: Vérifier les commandes existantes
    console.log('📋 Test 2: Vérification des commandes (orders)');
    
    // Test 3: Vérifier les produits
    console.log('📦 Test 3: Vérification des produits');
    
    console.log('\n💡 Solutions possibles:');
    console.log('1. Créer des données de test dans order_items');
    console.log('2. Vérifier la structure de la table order_items');
    console.log('3. Ajouter un fallback avec des produits populaires');
    console.log('4. Créer des commandes de test avec order_items');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testOrderItems();
