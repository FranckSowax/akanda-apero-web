'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

export default function TestAPICompletePage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, error: 0 });

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...update } : test));
  };

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
    return tests.length;
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const index = addTest({ name: testName, status: 'pending', message: 'En cours...' });
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTest(index, {
        status: 'success',
        message: 'Réussi',
        data: result,
        duration
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(index, {
        status: 'error',
        message: error.message || 'Erreur inconnue',
        data: error,
        duration
      });
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    setSummary({ total: 0, success: 0, error: 0 });

    const testData = {
      customerInfo: {
        email: `test-${Date.now()}@akanda-apero.com`,
        first_name: 'Test',
        last_name: 'User',
        phone: '+241000000'
      },
      items: [
        {
          id: 'test-product-1',
          name: 'Produit Test 1',
          price: 15.50,
          quantity: 2
        },
        {
          id: 'test-product-2',
          name: 'Produit Test 2',
          price: 8.75,
          quantity: 1
        }
      ],
      deliveryInfo: {
        address: 'Test Address, Libreville',
        district: 'Libreville',
        additionalInfo: 'Notes de test',
        deliveryOption: 'standard',
        location: {
          lat: -0.3976,
          lng: 9.4673
        }
      },
      paymentInfo: {
        method: 'mobile_money'
      },
      subtotal: 39.75,
      deliveryCost: 5.00,
      discount: 2.00,
      totalAmount: 42.75
    };

    let createdOrderId: string | null = null;

    try {
      // Test 1: Vérifier la structure de la base de données
      await runTest('1. Vérification structure DB', async () => {
        const response = await fetch('/api/orders?limit=1');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { structure: 'OK', pagination: data.pagination };
      });

      // Test 2: Créer une première commande
      const order1 = await runTest('2. Création commande #1', async () => {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`${response.status}: ${error.error || 'Erreur inconnue'}`);
        }
        const result = await response.json();
        if (result.success && result.order?.id) {
          createdOrderId = result.order.id;
          console.log('🔍 Debug: Order ID capturé:', createdOrderId);
        } else {
          console.log('⚠️ Debug: Pas d\'ID dans la réponse:', result);
        }
        return result;
      });

      // Test 3: Créer une deuxième commande avec le même client
      await runTest('3. Création commande #2 (même client)', async () => {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...testData,
            items: [{ id: 'test-product-3', name: 'Produit Test 3', price: 12.00, quantity: 1 }],
            subtotal: 12.00,
            totalAmount: 17.00
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`${response.status}: ${error.error}`);
        }
        return await response.json();
      });

      // Test 4: Récupérer toutes les commandes
      await runTest('4. Récupération toutes commandes', async () => {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.orders || data.orders.length === 0) {
          throw new Error('Aucune commande trouvée');
        }
        return { count: data.orders.length, orders: data.orders };
      });

      // Test 5: Récupérer commandes avec filtres
      await runTest('5. Filtrage par email', async () => {
        const response = await fetch(`/api/orders?customer_email=${encodeURIComponent(testData.customerInfo.email)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { count: data.orders.length, filtered: true };
      });

      // Test 6: Récupérer commandes avec pagination
      await runTest('6. Pagination (limit=1)', async () => {
        const response = await fetch('/api/orders?limit=1&offset=0');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { 
          count: data.orders.length, 
          pagination: data.pagination,
          hasMore: data.pagination.hasMore 
        };
      });

      // Test 7: Vérifier les liens GPS
      await runTest('7. Vérification liens GPS', async () => {
        const response = await fetch('/api/orders?limit=1');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const order = data.orders[0];
        if (!order.waze_link || !order.google_maps_link) {
          throw new Error('Liens GPS manquants');
        }
        return { 
          waze: order.waze_link.includes('waze.com'),
          google: order.google_maps_link.includes('google.com')
        };
      });

      // Test 8: Vérifier les données complètes
      await runTest('8. Vérification données complètes', async () => {
        const response = await fetch('/api/orders?limit=1');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const order = data.orders[0];
        
        const requiredFields = [
          'id', 'order_number', 'customer_id', 'total_amount', 'status',
          'payment_status', 'gps_latitude', 'gps_longitude',
          'customer_first_name', 'customer_email', 'items_count'
        ];
        
        const missingFields = requiredFields.filter(field => !order[field]);
        if (missingFields.length > 0) {
          throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
        }
        
        return { allFieldsPresent: true, orderNumber: order.order_number };
      });

      // Test 9: Test de mise à jour (PATCH)
      if (createdOrderId) {
        await runTest('9. Mise à jour commande', async () => {
          const response = await fetch(`/api/orders?id=${createdOrderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Confirmée',
              payment_status: 'Payé'
            })
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status}: ${error.error || 'Erreur PATCH'}`);
          }
          const result = await response.json();
          return { updated: true, orderId: createdOrderId, result };
        });
      } else {
        // Si pas d'ID, on fait un test alternatif
        await runTest('9. Test PATCH (sans ID préalable)', async () => {
          // Récupérer une commande existante pour la tester
          const getResponse = await fetch('/api/orders?limit=1');
          if (!getResponse.ok) throw new Error('Impossible de récupérer une commande');
          
          const getData = await getResponse.json();
          if (!getData.orders || getData.orders.length === 0) {
            throw new Error('Aucune commande disponible pour le test PATCH');
          }
          
          const testOrderId = getData.orders[0].id;
          const response = await fetch(`/api/orders?id=${testOrderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Confirmée'
            })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status}: ${error.error || 'Erreur PATCH'}`);
          }
          
          return { updated: true, orderId: testOrderId };
        });
      }

      // Test 10: Test de performance
      await runTest('10. Test performance (5 requêtes)', async () => {
        const startTime = Date.now();
        const promises = Array(5).fill(null).map(() => 
          fetch('/api/orders?limit=1').then(r => r.json())
        );
        await Promise.all(promises);
        const duration = Date.now() - startTime;
        return { duration, avgPerRequest: duration / 5 };
      });

    } catch (error) {
      console.error('Erreur lors des tests:', error);
    }

    // Calculer le résumé
    const finalTests = tests.length > 0 ? tests : [];
    const successCount = finalTests.filter(t => t.status === 'success').length;
    const errorCount = finalTests.filter(t => t.status === 'error').length;
    
    setSummary({
      total: finalTests.length,
      success: successCount,
      error: errorCount
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Tests Complets API Orders
            </h1>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isRunning ? '⏳ Tests en cours...' : '🚀 Lancer tous les tests'}
            </button>
          </div>

          {/* Résumé */}
          {summary.total > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-700">{summary.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">{summary.success}</div>
                <div className="text-sm text-green-600">Réussis</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-700">{summary.error}</div>
                <div className="text-sm text-red-600">Échoués</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {summary.total > 0 ? Math.round((summary.success / summary.total) * 100) : 0}%
                </div>
                <div className="text-sm text-blue-600">Succès</div>
              </div>
            </div>
          )}

          {/* Liste des tests */}
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  test.status === 'success'
                    ? 'bg-green-50 border-green-400'
                    : test.status === 'error'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStatusIcon(test.status)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className={`text-sm ${getStatusColor(test.status)}`}>
                        {test.message}
                        {test.duration && ` (${test.duration}ms)`}
                      </p>
                    </div>
                  </div>
                </div>
                
                {test.data && test.status === 'success' && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {test.data && test.status === 'error' && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {tests.length === 0 && !isRunning && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🧪</div>
              <p>Cliquez sur "Lancer tous les tests" pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
