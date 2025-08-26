'use client';

import { useState } from 'react';
import { useOrderNotificationsPolling } from '../../../hooks/useOrderNotificationsPolling';
import { OrderNotificationOverlay } from '../../../components/OrderNotificationOverlay';
import { supabase } from '../../../lib/supabase';

export default function TestPollingPage() {
  const { newOrder, dismissNotification, isPolling, togglePolling, lastOrderId } = useOrderNotificationsPolling();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Créer une commande de test
  const createTestOrder = async () => {
    setIsCreatingOrder(true);
    try {
      console.log('🧪 Création d\'une commande de test avec polling...');
      
      // Créer ou récupérer un client de test
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          email: 'polling-test@example.com',
          first_name: 'Polling',
          last_name: 'Test',
          phone: '+33123456789',
          full_name: 'Polling Test'
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (customerError) {
        console.error('❌ Erreur client:', customerError);
        return;
      }

      // Créer la commande
      const orderNumber = `POLLING-TEST-${Date.now()}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer.id,
          total_amount: 25000,
          subtotal: 25000,
          status: 'Nouvelle',
          payment_status: 'En attente',
          delivery_option: 'pickup',
          payment_method: 'cash',
          gps_latitude: -0.3976,
          gps_longitude: 9.4673
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erreur commande:', orderError);
        return;
      }

      console.log('✅ Commande créée:', order);

      // Ajouter quelques articles de test
      const testItems = [
        { name: 'Jack Daniels 70cl', price: 25000, quantity: 1 },
        { name: 'Coca Cola 33cl', price: 1000, quantity: 2 }
      ];

      for (const item of testItems) {
        await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: '00000000-0000-0000-0000-000000000001', // ID fictif
            quantity: item.quantity,
            unit_price: item.price
          });
      }

      console.log('✅ Articles ajoutés à la commande');

    } catch (err) {
      console.error('❌ Erreur lors de la création:', err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔄 Test Polling Notifications</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Contrôles</h2>
          
          <div className="space-y-4">
            {/* Statut du polling */}
            <div className="flex items-center justify-between">
              <span>Polling actif:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isPolling ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isPolling ? 'Actif' : 'Inactif'}</span>
              </div>
            </div>

            {/* Dernière commande */}
            <div className="flex items-center justify-between">
              <span>Dernière commande:</span>
              <span className="text-sm text-gray-600 font-mono">
                {lastOrderId ? lastOrderId.substring(0, 8) + '...' : 'Aucune'}
              </span>
            </div>

            {/* Boutons de contrôle */}
            <div className="space-y-2">
              <button
                onClick={togglePolling}
                className={`w-full px-4 py-2 rounded font-medium ${
                  isPolling 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isPolling ? '⏸️ Arrêter Polling' : '▶️ Démarrer Polling'}
              </button>

              <button
                onClick={createTestOrder}
                disabled={isCreatingOrder}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium disabled:opacity-50"
              >
                {isCreatingOrder ? '⏳ Création...' : '🧪 Créer Commande Test'}
              </button>
              
              {newOrder && (
                <button
                  onClick={dismissNotification}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
                >
                  🔇 Tester Arrêt du Son
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Méthode:</strong> Polling toutes les 5 secondes
            </div>
            <div>
              <strong>Avantage:</strong> Fonctionne même si Realtime est désactivé
            </div>
            <div>
              <strong>Inconvénient:</strong> Plus de requêtes à la base de données
            </div>
            <div>
              <strong>Son:</strong> Zen tone (doux et harmonieux)
            </div>
            <div>
              <strong>Vibration:</strong> Activée sur mobile
            </div>
          </div>

          {/* Statut de la notification */}
          {newOrder && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800 font-medium">🔔 Notification Active</div>
              <div className="text-green-600 text-sm">
                Commande: {newOrder.orderNumber}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Le polling démarre automatiquement au chargement de la page</li>
          <li>2. Cliquez sur "Créer Commande Test" pour déclencher une notification</li>
          <li>3. La notification apparaîtra dans les 5 secondes maximum</li>
          <li>4. Le son zen et la vibration se déclencheront automatiquement</li>
          <li>5. Cliquez sur l'overlay pour fermer la notification</li>
        </ol>
      </div>

      {/* Overlay de notification */}
      {newOrder && (
        <OrderNotificationOverlay
          isVisible={true}
          orderData={{
            id: newOrder.id,
            orderNumber: newOrder.orderNumber,
            customerName: newOrder.customerName,
            totalAmount: newOrder.totalAmount,
            items: newOrder.items,
            timestamp: newOrder.timestamp
          }}
          onDismiss={dismissNotification}
        />
      )}
    </div>
  );
}
