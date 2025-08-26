'use client';

import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TestRealOrderPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  const createRealOrder = async () => {
    setIsCreating(true);
    setMessage('');

    try {
      // Créer une vraie commande dans la base de données
      const orderData = {
        customerId: 1,
        customerName: 'Client Test',
        customerEmail: 'test@example.com',
        customerPhone: '0123456789',
        totalAmount: 45.50,
        status: 'Nouvelle',
        paymentStatus: 'En attente',
        paymentMethod: 'carte',
        address: '123 Rue Test, Paris',
        items: [
          {
            productId: 1,
            name: 'Mojito Classique',
            quantity: 2,
            price: 12.50,
            subtotal: 25.00
          },
          {
            productId: 2,
            name: 'Planche Apéro',
            quantity: 1,
            price: 20.50,
            subtotal: 20.50
          }
        ],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        throw error;
      }

      setMessage(`✅ Commande créée avec succès ! ID: ${data[0]?.id}`);
      console.log('Nouvelle commande créée:', data[0]);

    } catch (error: any) {
      setMessage(`❌ Erreur: ${error.message}`);
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🧪 Test Commande Réelle (Base de Données)
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-semibold text-blue-800 mb-2">
              📋 Ce que fait ce test :
            </h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Crée une vraie commande dans la base de données Supabase</li>
              <li>• Déclenche le système Realtime pour les notifications</li>
              <li>• Permet de tester le système complet avec de vraies données</li>
              <li>• Vérifie que l'overlay et le son zen fonctionnent</li>
            </ul>
          </div>

          <button
            onClick={createRealOrder}
            disabled={isCreating}
            className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
              isCreating
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isCreating ? '⏳ Création en cours...' : '🚀 Créer Vraie Commande'}
          </button>

          {message && (
            <div className={`p-3 rounded ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Instructions :
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Assurez-vous d'être sur le dashboard admin</li>
              <li>2. Vérifiez que le bouton 🔔 est vert (notifications activées)</li>
              <li>3. Cliquez sur "Créer Vraie Commande"</li>
              <li>4. Retournez au dashboard pour voir la notification</li>
              <li>5. L'overlay vert + son zen devraient apparaître</li>
            </ol>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold text-gray-800 mb-2">
              🔍 Debug Info :
            </h3>
            <p className="text-sm text-gray-600">
              Cette page crée une commande avec le statut "nouvelle" qui devrait 
              déclencher le système Realtime. Si aucune notification n'apparaît, 
              vérifiez la console du navigateur pour les erreurs Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
