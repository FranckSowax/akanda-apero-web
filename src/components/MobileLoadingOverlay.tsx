'use client';

import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface MobileLoadingOverlayProps {
  isVisible: boolean;
  status: 'loading' | 'success' | 'error';
  message?: string;
  onClose?: () => void;
}

export default function MobileLoadingOverlay({ 
  isVisible, 
  status, 
  message,
  onClose 
}: MobileLoadingOverlayProps) {
  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-blue-500" />,
          title: 'Traitement en cours...',
          subtitle: message || 'Veuillez patienter pendant que nous traitons votre commande',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: 'Commande réussie !',
          subtitle: message || 'Votre commande a été créée avec succès',
          bgColor: 'bg-green-50',
          textColor: 'text-green-900'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-500" />,
          title: 'Erreur',
          subtitle: message || 'Une erreur est survenue lors du traitement',
          bgColor: 'bg-red-50',
          textColor: 'text-red-900'
        };
      default:
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-gray-500" />,
          title: 'Traitement...',
          subtitle: message || 'Veuillez patienter',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-900'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`mx-4 max-w-sm w-full ${config.bgColor} rounded-2xl p-8 shadow-2xl border border-white/20`}>
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {config.icon}
          </div>
          
          {/* Title */}
          <h3 className={`text-xl font-bold ${config.textColor}`}>
            {config.title}
          </h3>
          
          {/* Subtitle */}
          <p className={`text-sm ${config.textColor} opacity-80 leading-relaxed`}>
            {config.subtitle}
          </p>
          
          {/* Action buttons */}
          {status === 'error' && onClose && (
            <button
              onClick={onClose}
              className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Réessayer
            </button>
          )}
          
          {status === 'success' && onClose && (
            <button
              onClick={onClose}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
