'use client';

import React, { useState, useEffect } from 'react';
import { useOrderNotifications } from '../../../hooks/useOrderNotifications';
import { useAudioAlert } from '../../../utils/audioAlert';
import OrderNotificationOverlay from '../../../components/OrderNotificationOverlay';
import AnimationTest from '../../../components/AnimationTest';

export default function TestNotificationsPage() {
  const [testOrder, setTestOrder] = useState<any>(null);
  const [isAudioSupported, setIsAudioSupported] = useState<boolean | null>(null);
  const { playAlert, stopAlert, requestPermission, isSupported } = useAudioAlert();

  // Éviter l'erreur d'hydratation en vérifiant le support audio côté client uniquement
  useEffect(() => {
    setIsAudioSupported(isSupported);
  }, [isSupported]);

  const createTestOrder = async () => {
    const mockOrder = {
      id: 'test-' + Date.now(),
      orderNumber: 'CMD-' + Math.floor(Math.random() * 10000),
      customerName: 'Jean Dupont',
      totalAmount: 45.50,
      created_at: new Date().toISOString(),
      items: [
        { name: 'Mojito Classique', quantity: 2 },
        { name: 'Planche Mixte', quantity: 1 },
        { name: 'Cocktail Maison', quantity: 1 }
      ]
    };
    
    // Afficher l'overlay ET jouer le son zen
    setTestOrder(mockOrder);
    
    // Jouer l'alerte sonore zen
    try {
      await playAlert();
    } catch (error) {
      console.log('Erreur lors de la lecture du son:', error);
    }
  };

  const dismissTest = () => {
    stopAlert();
    setTestOrder(null);
  };

  const testAudio = async () => {
    await playAlert();
  };

  const stopAudio = () => {
    stopAlert();
  };

  const requestAudioPermission = async () => {
    await requestPermission();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test du Système de Notifications
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tests Audio */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🔊 Tests Audio
            </h2>
            
            <div className="space-y-4">
              {/* Information sur le son zen */}
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-medium text-green-800 mb-2">🌿 Son Zen Activé</p>
                <p className="text-xs text-green-700">
                  Mélodie très douce La-Do-Mi style carillon zen (répétée toutes les 6 secondes)
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Support Audio:</span>
                <span className={`font-semibold ${
                  isAudioSupported === null 
                    ? 'text-gray-500' 
                    : isAudioSupported 
                      ? 'text-green-600' 
                      : 'text-red-600'
                }`}>
                  {isAudioSupported === null 
                    ? '⏳ Vérification...' 
                    : isAudioSupported 
                      ? '✅ Supporté' 
                      : '❌ Non supporté'
                  }
                </span>
              </div>

              <button
                onClick={requestAudioPermission}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                🎵 Demander Permission Audio
              </button>

              <button
                onClick={testAudio}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                ▶️ Tester Son d'Alerte
              </button>

              <button
                onClick={stopAudio}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                ⏹️ Arrêter Son
              </button>
            </div>
          </div>

          {/* Tests Overlay */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📱 Tests Overlay
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={createTestOrder}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                🎯 Simuler Nouvelle Commande
              </button>

              <button
                onClick={dismissTest}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                ❌ Fermer Overlay
              </button>

              {testOrder && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Commande Test Active:</strong><br/>
                    {testOrder.orderNumber} - {testOrder.customerName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Animation */}
        <div className="mt-8">
          <AnimationTest />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📋 Instructions de Test
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li>• <strong>Son Zen:</strong> Mélodie très douce et apaisante (La-Do-Mi)</li>
            <li>• <strong>Permission Audio:</strong> Cliquez d'abord pour autoriser l'audio</li>
            <li>• <strong>Test Son:</strong> Vérifiez que l'alerte zen fonctionne</li>
            <li>• <strong>Simulation:</strong> Créez une fausse commande pour tester l'overlay</li>
            <li>• <strong>Intégration:</strong> Le système fonctionne automatiquement dans l'admin</li>
          </ul>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">✅</div>
            <div className="text-sm text-gray-600">Overlay Créé</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">🔊</div>
            <div className="text-sm text-gray-600">Audio Intégré</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">⚡</div>
            <div className="text-sm text-gray-600">Temps Réel</div>
          </div>
        </div>
      </div>

      {/* Overlay de test */}
      <OrderNotificationOverlay
        isVisible={!!testOrder}
        orderData={testOrder}
        onDismiss={dismissTest}
      />
    </div>
  );
}
