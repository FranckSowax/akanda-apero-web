'use client';

import { useState } from 'react';

export default function TestWhatsAppDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testWhatsAppConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'GET'
      });
      const data = await response.json();
      setResult({ type: 'config', data });
    } catch (error) {
      setResult({ type: 'error', error: error.message });
    }
    setLoading(false);
  };

  const testWhatsAppSend = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: '00da4968-9713-437f-b9f1-55162e499221',
          phone: '33624576620',
          status: 'Prête',
          orderNumber: 'CMD-20250805-0006',
          customerName: 'FRANCK SOWAX',
          totalAmount: 25000
        })
      });
      const data = await response.json();
      setResult({ type: 'send', data, status: response.status });
    } catch (error) {
      setResult({ type: 'error', error: error.message });
    }
    setLoading(false);
  };

  const testOrderUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders?id=00da4968-9713-437f-b9f1-55162e499221', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'En livraison'
        })
      });
      const data = await response.json();
      setResult({ type: 'order_update', data, status: response.status });
    } catch (error) {
      setResult({ type: 'error', error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Test Debug WhatsApp</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testWhatsAppConfig}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : '1. Tester Configuration WhatsApp'}
        </button>
        
        <button
          onClick={testWhatsAppSend}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : '2. Tester Envoi WhatsApp Direct'}
        </button>
        
        <button
          onClick={testOrderUpdate}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : '3. Tester Mise à Jour Commande'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Résultat du test :</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
