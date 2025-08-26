'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Promotion } from '../../types/promotions';
import PromotionCountdown from './PromotionCountdown';

interface PromotionCardProps {
  promotion: Promotion;
  showCountdown?: boolean;
  className?: string;
  onExpired?: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  showCountdown = true,
  className = '',
  onExpired
}) => {
  const discountText = promotion.discount_percentage 
    ? `-${promotion.discount_percentage}%`
    : promotion.discount_amount 
    ? `-${promotion.discount_amount} FCFA`
    : '';

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${promotion.background_color}, ${promotion.background_color}dd)`,
    color: promotion.text_color
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl p-6 text-white relative overflow-hidden ${className}`}
      style={backgroundStyle}
    >
      {/* Effet de fond décoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <div className="relative z-10">
        {/* En-tête */}
        <div className="flex items-center space-x-2 mb-2">
          <h2 className="text-2xl font-black">{promotion.title}</h2>
          {promotion.is_featured && (
            <span className="bg-yellow-400 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              HOT
            </span>
          )}
        </div>

        {/* Description */}
        {promotion.description && (
          <p className="text-sm mb-4 opacity-90">
            {promotion.description}
          </p>
        )}

        {/* Compte à rebours */}
        {showCountdown && (
          <div className="bg-white/20 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <PromotionCountdown 
              endDate={promotion.end_date}
              onExpired={onExpired}
            />
            <div className="text-sm font-bold mt-2">
              {discountText} {promotion.title.toLowerCase().includes('cocktail') ? 'sur tous les cocktails' : 'sur la sélection'}
            </div>
          </div>
        )}

        {/* Image de la promotion */}
        {promotion.image_url && (
          <div className="mb-4">
            <Image
              src={promotion.image_url}
              alt={promotion.title}
              width={400}
              height={200}
              className="w-full h-32 object-cover rounded-xl opacity-90 hover:opacity-100 transition-opacity duration-300"
              onError={(e) => {
                // Fallback en cas d'erreur d'image
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Code promo */}
        {promotion.promo_code && (
          <div className="bg-white/20 rounded-xl p-3 mb-4 backdrop-blur-sm">
            <div className="text-xs font-semibold mb-1 opacity-90">
              CODE PROMO
            </div>
            <div className="font-black text-lg tracking-wider">
              {promotion.promo_code}
            </div>
            {promotion.min_order_amount && (
              <div className="text-xs opacity-75 mt-1">
                Commande min. {promotion.min_order_amount} FCFA
              </div>
            )}
          </div>
        )}

        {/* Informations sur les utilisations */}
        {promotion.max_uses && (
          <div className="text-xs opacity-75 mb-4">
            {promotion.current_uses}/{promotion.max_uses} utilisations
            <div className="w-full bg-white/20 rounded-full h-1 mt-1">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((promotion.current_uses / promotion.max_uses) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        <button className="w-full bg-yellow-400 text-red-600 px-4 py-3 rounded-full font-black hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          {promotion.promo_code ? `UTILISER ${promotion.promo_code}` : 'VOIR LA PROMO'}
        </button>
      </div>
    </motion.div>
  );
};

export default PromotionCard;
