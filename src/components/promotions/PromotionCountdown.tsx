'use client';

import React from 'react';
import { usePromotionCountdown } from '../../hooks/usePromotions';
import { PromotionCountdownProps } from '../../types/promotions';

const PromotionCountdown: React.FC<PromotionCountdownProps> = ({
  endDate,
  onExpired,
  className = ''
}) => {
  const { countdown, isExpired } = usePromotionCountdown(endDate);

  React.useEffect(() => {
    if (isExpired && onExpired) {
      onExpired();
    }
  }, [isExpired, onExpired]);

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-red-500 font-bold text-sm">
          ⏰ Promotion expirée
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="text-xs font-semibold mb-2 opacity-90">
        PROMO DU JOUR - Se termine dans :
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {/* Jours */}
        <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
          <div className="text-lg sm:text-xl font-black">
            {countdown.days.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-75 font-semibold">
            JOURS
          </div>
        </div>

        {/* Heures */}
        <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
          <div className="text-lg sm:text-xl font-black">
            {countdown.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-75 font-semibold">
            HEURES
          </div>
        </div>

        {/* Minutes */}
        <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
          <div className="text-lg sm:text-xl font-black">
            {countdown.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-75 font-semibold">
            MINUTES
          </div>
        </div>

        {/* Secondes */}
        <div className="bg-white/30 rounded-lg p-2 sm:p-3 text-center aspect-square flex flex-col justify-center">
          <div className="text-lg sm:text-xl font-black animate-pulse">
            {countdown.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-75 font-semibold">
            SECONDES
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionCountdown;
