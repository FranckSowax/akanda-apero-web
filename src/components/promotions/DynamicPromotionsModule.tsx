'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFeaturedPromotions } from '../../hooks/usePromotions';
import PromotionCard from './PromotionCard';

const DynamicPromotionsModule: React.FC = () => {
  const { promotions, loading, error, refetch } = useFeaturedPromotions();

  // État pour le compte à rebours
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  // Gestion des promotions expirées
  const handlePromotionExpired = () => {
    refetch(); // Recharger les promotions pour supprimer les expirées
  };

  // Calculer le temps restant
  const calculateTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const difference = end.getTime() - now.getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, expired: false };
  };

  // Mettre à jour le compte à rebours toutes les secondes
  useEffect(() => {
    if (promotions && promotions.length > 0) {
      const featured = promotions[0];
      if (featured && featured.end_date) {
        const interval = setInterval(() => {
          setTimeRemaining(calculateTimeRemaining(featured.end_date));
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [promotions]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl p-6 text-white relative overflow-hidden h-96 flex flex-col`}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-xl font-black truncate">PROMOTIONS</h2>
            <span className="bg-yellow-400 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse flex-shrink-0">
              PROMO
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">Chargement des offres spéciales...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl p-6 text-white relative overflow-hidden h-96 flex flex-col`}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-xl font-black truncate">PROMOTIONS</h2>
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
      </motion.div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl p-6 text-white relative overflow-hidden h-96 flex flex-col`}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center space-x-2 mb-3">
            <h2 className="text-xl font-black truncate">PROMOTIONS</h2>
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
      </motion.div>
    );
  }

  // Afficher la première promotion mise en avant
  const featuredPromotion = promotions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`bg-gradient-to-br ${featuredPromotion.background_color || 'from-red-500 via-orange-500 to-pink-500'} rounded-3xl p-6 ${featuredPromotion.text_color || 'text-white'} relative overflow-hidden min-h-[500px] flex flex-col shadow-2xl hover:shadow-3xl transition-all duration-300`}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header avec titre et badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black truncate flex-1">{featuredPromotion.title}</h2>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-bounce">
            HOT
          </span>
        </div>
        {/* Compteur animé coloré moderne */}
        {!timeRemaining.expired && (
          <motion.div 
            className="mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <p className="text-sm opacity-90 mb-3 text-center font-semibold">Temps restant</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: timeRemaining.days, label: 'Jours', color: 'from-red-400 to-orange-400' },
                  { value: timeRemaining.hours, label: 'Heures', color: 'from-orange-400 to-yellow-400' },
                  { value: timeRemaining.minutes, label: 'Min', color: 'from-yellow-400 to-green-400' },
                  { value: timeRemaining.seconds, label: 'Sec', color: 'from-green-400 to-blue-400' }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="text-center"
                    animate={{
                      scale: item.value < 10 ? [1, 1.1, 1] : 1,
                      rotate: item.value < 10 ? [0, -2, 0] : 0
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className={`bg-gradient-to-br ${item.color} rounded-xl p-3 shadow-lg`}>
                      <div className="text-2xl font-black">{item.value}</div>
                      <div className="text-sm opacity-75">{item.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Progress bar animée colorée */}
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((timeRemaining.days * 24 + timeRemaining.hours) * 60 + timeRemaining.minutes) / 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        {/* Description moderne */}
        <motion.div 
          className="mb-4 flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-base opacity-90 leading-relaxed">
            {featuredPromotion.description}
          </p>
        </motion.div>

        {/* Code promo moderne */}
        {featuredPromotion.code && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-red-600 px-4 py-3 rounded-xl font-bold text-center text-base shadow-lg">
              CODE: {featuredPromotion.code}
            </div>
          </motion.div>
        )}}

        {/* Détails promotion moderne */}
        <motion.div 
          className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="opacity-90 font-semibold text-lg">Remise</span>
            <span className="text-2xl font-black">
              {featuredPromotion.discount_type === 'percentage' 
                ? `${featuredPromotion.discount_value}%` 
                : `${featuredPromotion.discount_value}€`}
            </span>
          </div>
          
          {featuredPromotion.min_order_amount > 0 && (
            <div className="flex justify-between items-center text-base">
              <span className="opacity-75">Min. commande</span>
              <span className="font-bold">{featuredPromotion.min_order_amount}€</span>
            </div>
          )}
        </motion.div>

        {/* Image carrée en pleine largeur */}
        {featuredPromotion.image_url && (
          <motion.div 
            className="mb-4 relative flex-grow"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <img
                src={featuredPromotion.image_url}
                alt={featuredPromotion.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Overlay gradient subtil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
          </motion.div>
        )}
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
      </div>
    </motion.div>
  );
};

export default DynamicPromotionsModule;
