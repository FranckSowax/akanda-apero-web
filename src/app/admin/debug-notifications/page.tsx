'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugNotificationsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Capturer les logs de la console
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, ...args: any[]) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = `[${timestamp}] ${type}: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;
      setLogs(prev => [...prev.slice(-50), message]); // Garder seulement les 50 derniers logs
    };

    console.log = (...args) => {
      originalLog(...args);
      if (args.some(arg => String(arg).includes('🔊') || String(arg).includes('📡') || String(arg).includes('🔔'))) {
        addLog('LOG', ...args);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('ERROR', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('WARN', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Tester la connexion Supabase
  const testConnection = async () => {
    try {
      console.log('🧪 Test de connexion Supabase...');
      const { data, error } = await supabase.from('orders').select('count').limit(1);
      
      if (error) {
        console.error('❌ Erreur de connexion:', error);
        setIsConnected(false);
      } else {
        console.log('✅ Connexion Supabase OK');
        setIsConnected(true);
      }
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
      setIsConnected(false);
    }
  };

  // Récupérer la dernière commande
  const getLastOrder = async () => {
    try {
      console.log('🔍 Récupération de la dernière commande...');
      const { data: lastOrder, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }

      if (lastOrder) {
        console.log('✅ Dernière commande:', lastOrder);
        setLastOrderId(lastOrder.id);
      }
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
    }
  };

  // Créer une commande de test
  const createTestOrder = async () => {
    try {
      console.log('🧪 Création d\'une commande de test...');
      
      const testOrder = {
        order_number: `TEST-${Date.now()}`,
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        customer_phone: '+33123456789',
        total_amount: 25000,
        status: 'Nouvelle',
        payment_status: 'En attente',
        delivery_method: 'pickup',
        notes: 'Commande de test pour les notifications'
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([testOrder])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création:', error);
        return;
      }

      console.log('✅ Commande de test créée:', data);
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
    }
  };

  // Tester le canal Realtime
  const testRealtimeChannel = () => {
    console.log('📡 Test du canal Realtime...');
    
    const channel = supabase
      .channel('debug-test')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 Événement Realtime reçu:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut canal debug:', status);
      });

    // Nettoyer après 30 secondes
    setTimeout(() => {
      console.log('🧹 Nettoyage du canal de test');
      supabase.removeChannel(channel);
    }, 30000);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 Debug Notifications</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contrôles */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Tests de Connexion</h2>
            <div className="space-y-2">
              <button
                onClick={testConnection}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🧪 Tester Connexion Supabase
              </button>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Tests des Commandes</h2>
            <div className="space-y-2">
              <button
                onClick={getLastOrder}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                🔍 Récupérer Dernière Commande
              </button>
              
              {lastOrderId && (
                <div className="text-sm text-gray-600">
                  Dernière commande: {lastOrderId}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Tests Realtime</h2>
            <div className="space-y-2">
              <button
                onClick={testRealtimeChannel}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                📡 Tester Canal Realtime
              </button>
              
              <button
                onClick={createTestOrder}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                🔔 Créer Commande Test
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📋 Logs en Temps Réel</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Effacer
            </button>
          </div>
          
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Aucun log pour le moment...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Instructions</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Testez d'abord la connexion Supabase</li>
          <li>2. Récupérez la dernière commande pour initialiser le système</li>
          <li>3. Testez le canal Realtime pour vérifier la connexion</li>
          <li>4. Créez une commande de test pour déclencher une notification</li>
          <li>5. Surveillez les logs pour identifier les problèmes</li>
        </ol>
      </div>
    </div>
  );
}
