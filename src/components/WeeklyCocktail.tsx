'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useWeeklyCocktail } from '../hooks/useWeeklyCocktail';
import { useAppContext } from '../context/AppContext';
import { useCartModalContext } from '../context/CartModalContext';

// Fonction pour formater le prix
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

// Fonction pour convertir un cocktail en produit pour le panier
const convertCocktailToProduct = (cocktail: any) => ({
  id: parseInt(cocktail.id) || Math.floor(Math.random() * 10000),
  name: cocktail.name,
  description: cocktail.description || '',
  price: cocktail.base_price,
  imageUrl: cocktail.image_url || '/images/cocktail-placeholder.jpg',
  currency: 'FCFA',
  categorySlug: 'cocktails-maison',
  stock: 100
});

export default function WeeklyCocktail() {
  const { cocktail, loading, error } = useWeeklyCocktail();
  const { addToCart } = useAppContext();
  const { openCart } = useCartModalContext();
  
  // États pour les sélecteurs
  const [guestCount, setGuestCount] = useState(4);
  const [duration, setDuration] = useState(2);
  
  // Fonction pour calculer le prix synchronisé
  const calculateSynchronizedPrice = (basePrice: number, guests: number, hours: number) => {
    // Prix de base pour 1 personne pendant 1 heure
    const pricePerPersonPerHour = basePrice;
    // Calcul du prix total : prix de base × nombre de personnes × durée
    return pricePerPersonPerHour * guests * hours;
  };
  
  // Prix synchronisé calculé
  const synchronizedPrice = cocktail ? calculateSynchronizedPrice(cocktail.base_price, guestCount, duration) : 0;

  const handleAddToCart = () => {
    if (!cocktail) return;
    
    // Créer le produit avec le prix synchronisé
    const product = {
      ...convertCocktailToProduct(cocktail),
      price: synchronizedPrice,
      name: `${cocktail.name} (${guestCount} pers. × ${duration}h)`
    };
    addToCart(product, 1);
    openCart();
  };

  if (loading) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl p-6 shadow-xl text-white mt-6 sm:mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black mb-2">LE COCKTAIL DE LA SEMAINE 🍸</h2>
          <p className="text-white/80 text-sm">Chargement...</p>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </motion.div>
    );
  }

  if (error || !cocktail) {
    return null;
  }

  return (
    <motion.div 
      className="bg-white rounded-3xl p-6 shadow-xl mt-6 sm:mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      {/* Header intégré dans le module */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black mb-2 text-gray-900">LE COCKTAIL DE LA SEMAINE 🍸</h2>
        <p className="text-gray-600 text-sm">Faites vous livrer l'alcool, tous les ingredients, suivez la recette et trinquez !!</p>
      </div>
      
      {/* Main Content - 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Colonne 1 - Image du cocktail */}
        <div className="space-y-4">
          {/* Image du Cocktail */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              {cocktail.image_url ? (
                <Image 
                  src={cocktail.image_url} 
                  alt={cocktail.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              {/* Fallback emoji si pas d'image */}
              <div className={`${cocktail.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-8xl bg-gradient-to-br from-gray-100 to-gray-200`}>
                {cocktail.emoji || '🍸'}
              </div>
            </div>
            
            {/* Badge "Cocktail de la semaine" */}
            <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              SEMAINE
            </div>
          </div>
        </div>
        
        {/* Colonne 2 - Informations du cocktail */}
        <div className="space-y-4">
          {/* Nom et Badges */}
          <div>
            <h3 className="text-2xl lg:text-3xl font-black mb-3 text-gray-900">{cocktail.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {cocktail.is_featured && (
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  VEDETTE
                </span>
              )}
              <span className="bg-blue-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                {cocktail.category?.toUpperCase() || 'COCKTAIL'}
              </span>
              {cocktail.alcohol_percentage && (
                <span className="bg-red-400 text-red-900 px-3 py-1 rounded-full text-xs font-bold">
                  {cocktail.alcohol_percentage}% ALC
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {cocktail.description || 'Un délicieux cocktail préparé avec soin'}
            </p>
          </div>
          
          {/* Prix et Statistiques */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-black text-gray-900">{formatPrice(synchronizedPrice)}</div>
                <div className="text-xs text-gray-500">Prix pour {guestCount} personne{guestCount > 1 ? 's' : ''} × {duration}h</div>
                <div className="text-xs text-gray-400 mt-1">Base: {formatPrice(cocktail.base_price)}</div>
              </div>
              
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-lg mb-1">⏱️</div>
                  <div className="text-xs font-semibold text-gray-600">TEMPS</div>
                  <div className="text-sm font-bold text-gray-900">{cocktail.preparation_time_minutes || 5}min</div>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-1">⭐</div>
                  <div className="text-xs font-semibold text-gray-600">NIVEAU</div>
                  <div className="text-sm font-bold text-gray-900">{cocktail.difficulty_level || 1}/5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Colonne 3 - Sélecteurs et Actions */}
        <div className="space-y-4">
          {/* Sélecteurs Nombre de personnes et Durée */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            {/* Sélecteur Nombre de personnes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👥 Nombre de personnes
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition-colors shadow-sm"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-black text-gray-900">{guestCount}</div>
                  <div className="text-xs text-gray-500">invité{guestCount > 1 ? 's' : ''}</div>
                </div>
                <button
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Sélecteur Durée */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⏰ Durée de l'événement
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition-colors shadow-sm"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-black text-gray-900">{duration}</div>
                  <div className="text-xs text-gray-500">heure{duration > 1 ? 's' : ''}</div>
                </div>
                <button
                  onClick={() => setDuration(duration + 1)}
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Bouton d'ajout au panier */}
          <motion.button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🛒 Ajouter au panier
          </motion.button>
        </div>
        
      </div>
      
      {/* Notice de disponibilité */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-900">
          <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
            <span className="text-green-900 text-xs font-bold">✓</span>
          </div>
          <span className="text-sm font-medium">
            Disponible sur notre page cocktails maison
          </span>
        </div>
      </div>
    </motion.div>
  );
}
