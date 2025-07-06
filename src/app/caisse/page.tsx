'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, X, Calculator, Printer } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  variety: string;
  pricePerKg: number;
  category: string;
  icon: string;
}

interface CartItem {
  id: string;
  name: string;
  pricePerKg: number;
  weight: number;
  totalPrice: number;
}

const products: Product[] = [
  // Piments
  { id: 'piment-demon', name: 'Piment', variety: 'Demon', pricePerKg: 2000, category: 'piments', icon: '🌶️' },
  { id: 'piment-shamsi', name: 'Piment', variety: 'Shamsi', pricePerKg: 2000, category: 'piments', icon: '🌶️' },
  { id: 'piment-avenir', name: 'Piment', variety: 'Avenir', pricePerKg: 4000, category: 'piments', icon: '🌶️' },
  { id: 'piment-king', name: 'Piment', variety: 'The King', pricePerKg: 4000, category: 'piments', icon: '🌶️' },
  
  // Poivrons
  { id: 'poivron-yolo', name: 'Poivron', variety: 'Yolo Wander', pricePerKg: 2000, category: 'poivrons', icon: '🫑' },
  { id: 'poivron-conti', name: 'Poivron', variety: 'De Conti', pricePerKg: 2500, category: 'poivrons', icon: '🫑' },
  { id: 'poivron-nobili', name: 'Poivron', variety: 'Nobili', pricePerKg: 2500, category: 'poivrons', icon: '🫑' },
  
  // Tomates
  { id: 'tomate-padma', name: 'Tomate', variety: 'Padma', pricePerKg: 1500, category: 'tomates', icon: '🍅' },
  { id: 'tomate-anita', name: 'Tomate', variety: 'Anita', pricePerKg: 1500, category: 'tomates', icon: '🍅' },
  
  // Aubergines
  { id: 'aubergine-africaine', name: 'Aubergine Blanche', variety: 'Africaine', pricePerKg: 1000, category: 'aubergines', icon: '🍆' },
  { id: 'aubergine-bonika', name: 'Aubergine Violette', variety: 'Bonika', pricePerKg: 1000, category: 'aubergines', icon: '🍆' },
  { id: 'aubergine-ping', name: 'Aubergine Chinoise', variety: 'Ping Tung', pricePerKg: 2000, category: 'aubergines', icon: '🍆' },
  
  // Fruits
  { id: 'mangue-kent', name: 'Mangue', variety: 'Kent', pricePerKg: 3000, category: 'fruits', icon: '🥭' },
  { id: 'ananas-cayenne', name: 'Ananas', variety: 'Cayenne', pricePerKg: 2500, category: 'fruits', icon: '🍍' },
  { id: 'banane-plantain', name: 'Banane', variety: 'Plantain', pricePerKg: 1500, category: 'fruits', icon: '🍌' },
  { id: 'papaye-solo', name: 'Papaye', variety: 'Solo', pricePerKg: 2000, category: 'fruits', icon: '🧡' },
  { id: 'avocat-hass', name: 'Avocat', variety: 'Hass', pricePerKg: 4000, category: 'fruits', icon: '🥑' },
  { id: 'orange-valencia', name: 'Orange', variety: 'Valencia', pricePerKg: 1800, category: 'fruits', icon: '🍊' },
  { id: 'citron-vert', name: 'Citron', variety: 'Vert', pricePerKg: 2200, category: 'fruits', icon: '🍋' },
  
  // Autres Légumes
  { id: 'chou-aventy', name: 'Chou', variety: 'Aventy', pricePerKg: 1000, category: 'autres', icon: '🥬' },
  { id: 'gombo-kirikou', name: 'Gombo', variety: 'Kirikou', pricePerKg: 2000, category: 'autres', icon: '🌿' },
  { id: 'concombre-murano', name: 'Concombre', variety: 'Murano', pricePerKg: 1000, category: 'autres', icon: '🥒' },
  { id: 'ciboulette', name: 'Ciboulette', variety: '', pricePerKg: 600, category: 'autres', icon: '🌿' },
];

const categories = {
  piments: { title: '🌶️ PIMENTS', color: 'from-red-50 to-red-100', textColor: 'text-red-700', borderColor: 'border-red-300' },
  poivrons: { title: '🫑 POIVRONS', color: 'from-green-50 to-green-100', textColor: 'text-green-700', borderColor: 'border-green-300' },
  tomates: { title: '🍅 TOMATES', color: 'from-red-50 to-red-100', textColor: 'text-red-600', borderColor: 'border-red-300' },
  aubergines: { title: '🍆 AUBERGINES', color: 'from-purple-50 to-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300' },
  fruits: { title: '🍎 FRUITS', color: 'from-orange-50 to-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-300' },
  autres: { title: '🥒 AUTRES LÉGUMES', color: 'from-green-50 to-green-100', textColor: 'text-green-700', borderColor: 'border-green-300' }
};

// Fonction de formatage simple pour éviter les erreurs d'hydratation
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function CaissePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weight, setWeight] = useState('1');
  const [mounted, setMounted] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemsCount = cart.length;

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  const getPriceCategory = (price: number) => {
    if (price <= 1000) return 'eco';
    if (price <= 2000) return 'standard';
    return 'premium';
  };

  const getPriceColorClass = (price: number) => {
    const category = getPriceCategory(price);
    switch (category) {
      case 'eco': return 'border-green-400 hover:bg-green-50 text-green-700';
      case 'standard': return 'border-yellow-400 hover:bg-yellow-50 text-yellow-700';
      case 'premium': return 'border-red-400 hover:bg-red-50 text-red-700';
      default: return 'border-gray-300';
    }
  };

  const openWeightModal = (product: Product) => {
    console.log('🔥 Ouverture modal pour:', product.name, product.variety);
    setSelectedProduct(product);
    setWeight('1');
    setShowWeightModal(true);
  };

  const closeWeightModal = () => {
    setShowWeightModal(false);
    setSelectedProduct(null);
  };

  const confirmWeight = () => {
    if (!selectedProduct) return;
    
    const weightNum = parseFloat(weight);
    if (weightNum <= 0) {
      alert('Veuillez saisir un poids valide');
      return;
    }

    const totalPrice = selectedProduct.pricePerKg * weightNum;
    const existingItem = cart.find(item => item.id === selectedProduct.id);

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === selectedProduct.id 
          ? { ...item, weight: item.weight + weightNum, totalPrice: item.totalPrice + totalPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        id: selectedProduct.id,
        name: `${selectedProduct.name} ${selectedProduct.variety}`.trim(),
        pricePerKg: selectedProduct.pricePerKg,
        weight: weightNum,
        totalPrice: totalPrice
      }]);
    }

    closeWeightModal();
  };

  const adjustWeight = (id: string, adjustment: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newWeight = Math.max(0.1, Math.round((item.weight + adjustment) * 10) / 10);
        return {
          ...item,
          weight: newWeight,
          totalPrice: item.pricePerKg * newWeight
        };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Voulez-vous vraiment vider le panier ?')) {
      setCart([]);
    }
  };

  const processCheckout = () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    const itemsList = cart.map(item => 
      `• ${item.name}: ${item.weight}kg = ${item.totalPrice.toLocaleString()} FCFA`
    ).join('\n');

    const receipt = `
🧾 TICKET DE CAISSE
==================

${itemsList}

==================
TOTAL: ${totalAmount.toLocaleString()} FCFA
==================

Merci de votre achat !
    `;

    if (confirm(`Confirmer la vente ?\n\n${receipt}`)) {
      alert('Vente enregistrée avec succès !');
      setCart([]);
    }
  };

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWeightModal();
      if (e.key === 'Enter' && showWeightModal) confirmWeight();
      if (e.ctrlKey && e.key === 'c') { e.preventDefault(); clearCart(); }
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); processCheckout(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showWeightModal, cart]);

  const popularProducts = products.filter(p => 
    ['tomate-padma', 'piment-demon', 'mangue-kent'].includes(p.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">🛒 Caisse Fruits & Légumes</h1>
            <div className="flex gap-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                Total: {mounted ? formatPrice(totalAmount) : '0'} FCFA
              </div>
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                {itemsCount} articles
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panier - Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Panier
              </h3>
              <button 
                onClick={clearCart}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Vider
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Panier vide</p>
                  <small>Sélectionnez des produits</small>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-xl p-4 mb-3 border-l-4 border-green-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.weight}kg × {mounted ? formatPrice(item.pricePerKg) : '0'} = {mounted ? formatPrice(item.totalPrice) : '0'} FCFA
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustWeight(item.id, -0.1)}
                          className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 bg-white rounded font-medium">
                          {item.weight}kg
                        </span>
                        <button
                          onClick={() => adjustWeight(item.id, 0.1)}
                          className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="text-xl font-bold text-green-700 mb-4 text-center">
                Total: {mounted ? formatPrice(totalAmount) : '0'} FCFA
              </div>
              <button
                onClick={processCheckout}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Encaisser
              </button>
            </div>
          </div>
        </div>

        {/* Produits - Main Area */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
            {/* Accès Rapide */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🔥 Accès Rapide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => openWeightModal(product)}
                    className="bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border-2 border-purple-300 rounded-2xl p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="text-4xl mb-2">{product.icon}</div>
                    <div className="font-semibold text-gray-800">
                      {product.name} {product.variety}
                    </div>
                    <div className="text-purple-700 font-bold">
                      {mounted ? formatPrice(product.pricePerKg) : '0'} FCFA/kg
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Catégories de Produits */}
            {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
              const categoryProducts = products.filter(p => p.category === categoryKey);
              
              return (
                <section key={categoryKey} className="mb-8">
                  <h3 className={`text-xl font-bold mb-4 p-4 rounded-xl bg-gradient-to-r ${categoryInfo.color} ${categoryInfo.textColor} ${categoryInfo.borderColor} border-l-4`}>
                    {categoryInfo.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => openWeightModal(product)}
                        className={`bg-white border-2 rounded-2xl p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg ${getPriceColorClass(product.pricePerKg)}`}
                      >
                        <div className="text-3xl mb-2">{product.icon}</div>
                        <div className="font-semibold text-gray-800 text-sm mb-1">
                          {product.variety || product.name}
                        </div>
                        <div className="font-bold">
                          {mounted ? formatPrice(product.pricePerKg) : '0'}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Poids */}
      {showWeightModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              ⚖️ Poids du produit
            </h3>
            <p className="text-center text-gray-600 mb-6">
              {selectedProduct.name} {selectedProduct.variety} - {mounted ? formatPrice(selectedProduct.pricePerKg) : '0'} FCFA/kg
            </p>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Poids (kg):
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                min="0.1"
                max="100"
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-center text-xl focus:border-green-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={closeWeightModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmWeight}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Ajouter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
