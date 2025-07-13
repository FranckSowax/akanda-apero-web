'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGetOrders = async () => {
    setLoading(true);
    try {
      console.log('🧪 Test GET /api/orders...');
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      console.log('Status:', response.status);
      console.log('Response:', data);
      
      setResult({
        status: response.status,
        success: response.ok,
        data: data
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
      setResult({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateOrder = async () => {
    setLoading(true);
    try {
      const testOrder = {
        customerInfo: {
          email: 'test@akandaapero.com',
          first_name: 'Test',
          last_name: 'User',
          phone: '+241 07 12 34 56'
        },
        deliveryInfo: {
          address: '123 Test Street',
          district: 'Test District',
          additionalInfo: 'Test info',
          deliveryOption: 'standard',
          location: {
            lat: 0.3936,
            lng: 9.4673,
            hasLocation: true
          }
        },
        paymentInfo: {
          method: 'cash'
        },
        items: [
          {
            id: '1',
            name: 'Test Product',
            price: 10000,
            quantity: 1,
            imageUrl: '/test.jpg'
          }
        ],
        totalAmount: 10000,
        subtotal: 10000,
        deliveryCost: 0,
        discount: 0
      };

      console.log('🧪 Test POST /api/orders...');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrder),
      });
      
      const data = await response.json();
      
      console.log('Status:', response.status);
      console.log('Response:', data);
      
      setResult({
        status: response.status,
        success: response.ok,
        data: data
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
      setResult({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Test API Orders</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests disponibles</h2>
          
          <div className="space-y-4">
            <button
              onClick={testGetOrders}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Test GET /api/orders'}
            </button>
            
            <button
              onClick={testCreateOrder}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 ml-4"
            >
              {loading ? 'Test en cours...' : 'Test POST /api/orders'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Résultat du test</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <strong>Status:</strong> {result.status} - {result.success ? 'SUCCESS' : 'ERROR'}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Réponse complète:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
