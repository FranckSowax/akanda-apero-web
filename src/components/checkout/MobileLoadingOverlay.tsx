'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface MobileLoadingOverlayProps {
  isVisible: boolean;
  step: 'processing' | 'success' | 'error';
  message?: string;
  onRetry?: () => void;
}

export const MobileLoadingOverlay: React.FC<MobileLoadingOverlayProps> = ({
  isVisible,
  step,
  message,
  onRetry
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
          >
            {/* Processing State */}
            {step === 'processing' && (
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Smartphone className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Finalisation en cours...
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <motion.p
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    ✓ Vérification des informations
                  </motion.p>
                  <motion.p
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    📍 Localisation GPS...
                  </motion.p>
                  <motion.p
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.5 }}
                  >
                    🛒 Création de votre commande...
                  </motion.p>
                </div>
                
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            {/* Success State */}
            {step === 'success' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  🎉 Commande confirmée !
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {message || 'Votre commande a été créée avec succès'}
                </p>
                
                <div className="bg-green-50 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-xs font-medium">
                    📱 Confirmation WhatsApp en cours d'envoi
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {step === 'error' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </motion.div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Erreur de commande
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {message || 'Une erreur est survenue lors de la finalisation'}
                </p>
                
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Réessayer
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileLoadingOverlay;
