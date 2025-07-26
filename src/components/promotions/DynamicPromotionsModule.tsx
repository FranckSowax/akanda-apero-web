'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useFeaturedPromotions } from '../../hooks/usePromotions';
import PromotionCard from './PromotionCard';

const DynamicPromotionsModule: React.FC = () => {
  const { promotions, loading, error, refetch } = useFeaturedPromotions();

  // Gestion des promotions expirées
  const handlePromotionExpired = () => {
    refetch(); // Recharger les promotions pour supprimer les expirées
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-black">PROMOTIONS</h2>
            <span className="bg-yellow-400 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              HOT
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">Chargement des offres spéciales...</p>
          
          {/* Skeleton loader */}
          <div className="space-y-4">
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm animate-pulse">
              <div className="h-4 bg-white/30 rounded mb-2"></div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/30 rounded-lg p-3 aspect-square"></div>
                ))}
              </div>
              <div className="h-4 bg-white/30 rounded"></div>
            </div>
            <div className="h-32 bg-white/20 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-yellow-400/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-black">PROMOTIONS</h2>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ERREUR
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">
            Impossible de charger les promotions
          </p>
          <button 
            onClick={refetch}
            className="w-full bg-yellow-400 text-red-600 px-4 py-3 rounded-full font-black hover:bg-yellow-300 transition-all duration-300"
          >
            RÉESSAYER
          </button>
        </div>
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-black">PROMOTIONS</h2>
            <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              BIENTÔT
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">
            Aucune promotion active pour le moment
          </p>
          <p className="text-xs opacity-75 mb-4">
            Revenez bientôt pour découvrir nos offres spéciales !
          </p>
          <button className="w-full bg-yellow-400 text-red-600 px-4 py-3 rounded-full font-black hover:bg-yellow-300 transition-all duration-300">
            VOIR TOUS LES PRODUITS
          </button>
        </div>
      </div>
    );
  }

  // Afficher la première promotion mise en avant
  const featuredPromotion = promotions[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PromotionCard
        promotion={featuredPromotion}
        showCountdown={true}
        onExpired={handlePromotionExpired}
        className="shadow-2xl hover:shadow-3xl transition-shadow duration-300"
      />
      
      {/* Indicateur s'il y a plusieurs promotions */}
      {promotions.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {promotions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === 0 
                  ? 'bg-orange-400 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DynamicPromotionsModule;
