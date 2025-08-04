'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Clock, User, Euro } from 'lucide-react';


interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
  timestamp: string;
}

interface OrderNotificationOverlayProps {
  isVisible: boolean;
  orderData?: OrderData;
  onDismiss: () => void;
}

export default function OrderNotificationOverlay({
  isVisible,
  orderData,
  onDismiss
}: OrderNotificationOverlayProps) {
  const handleDismiss = () => {
    // Le hook parent se charge d'arrêter le son
    onDismiss();
  };

  if (!orderData) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.85)' }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animation de "pop" séparée */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: "easeInOut"
              }}
              className="absolute inset-0 pointer-events-none"
            />
            {/* Bouton fermer */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Animation de pulsation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full"
            />

            {/* Titre principal */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block mb-4"
              >
                <ShoppingBag size={48} className="text-green-500 mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Nouvelle Commande !
              </h2>
              <p className="text-gray-600">
                Une commande vient d'être passée
              </p>
            </div>

            {/* Détails de la commande */}
            <div className="space-y-4">
              {/* Numéro de commande */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">#</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commande</p>
                  <p className="font-semibold text-gray-800">{orderData.orderNumber}</p>
                </div>
              </div>

              {/* Client */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold text-gray-800">{orderData.customerName}</p>
                </div>
              </div>

              {/* Montant */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Euro size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant</p>
                  <p className="font-semibold text-gray-800">{orderData.totalAmount.toFixed(2)} €</p>
                </div>
              </div>

              {/* Articles */}
              {orderData.items.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Articles ({orderData.items.length})</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {orderData.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                    ))}
                    {orderData.items.length > 3 && (
                      <p className="text-xs text-gray-400 italic">
                        +{orderData.items.length - 3} autres articles...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Heure */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reçue à</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(orderData.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton d'action */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDismiss}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
            >
              ✅ J'ai vu la commande
            </motion.button>

            {/* Instructions */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Cliquez n'importe où pour fermer cette notification
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { OrderNotificationOverlay };
