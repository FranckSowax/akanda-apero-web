'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function AnimationTest() {
  const [showOverlay, setShowOverlay] = useState(false);

  const testOrder = {
    orderNumber: 'CMD-TEST-001',
    customerName: 'Test Client',
    totalAmount: 42.50,
    created_at: new Date().toISOString(),
    items: [
      { name: 'Mojito Test', quantity: 1 },
      { name: 'Planche Test', quantity: 1 }
    ]
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">🧪 Test Animation Overlay</h2>
        
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            showOverlay 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {showOverlay ? '❌ Fermer Overlay' : '✅ Afficher Overlay'}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          Test de l'animation Framer Motion corrigée
        </p>
      </div>

      {/* Test Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.85)' }}
            onClick={() => setShowOverlay(false)}
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

              {/* Contenu */}
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className="inline-block mb-4"
                  >
                    <ShoppingBag size={48} className="text-green-500 mx-auto" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    🎉 Test Animation !
                  </h2>
                  <p className="text-gray-600">
                    Animation Framer Motion corrigée
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Commande Test</p>
                    <p className="font-semibold text-gray-800">{testOrder.orderNumber}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-semibold text-gray-800">{testOrder.customerName}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="font-semibold text-gray-800">{testOrder.totalAmount.toFixed(2)} €</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowOverlay(false)}
                  className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  ✅ Animation OK !
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
