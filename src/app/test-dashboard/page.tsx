'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestDashboard() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Connexion Supabase
      results.push({ test: 'Connexion Supabase', status: 'OK', message: 'Client configuré' });

      // Test 2: Table orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount, customer_name')
        .limit(5);

      if (ordersError) {
        results.push({ 
          test: 'Table orders', 
          status: 'ERROR', 
          message: ordersError.message,
          details: ordersError
        });
      } else {
        results.push({ 
          test: 'Table orders', 
          status: 'OK', 
          message: `${orders?.length || 0} commandes trouvées`,
          data: orders?.slice(0, 2)
        });
      }

      // Test 3: Table products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .limit(5);

      if (productsError) {
        results.push({ 
          test: 'Table products', 
          status: 'ERROR', 
          message: productsError.message,
          details: productsError
        });
      } else {
        results.push({ 
          test: 'Table products', 
          status: 'OK', 
          message: `${products?.length || 0} produits trouvés`,
          data: products?.slice(0, 2)
        });
      }

      // Test 4: Table deliveries
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('id, order_id, status, driver_name')
        .limit(5);

      if (deliveriesError) {
        results.push({ 
          test: 'Table deliveries', 
          status: 'ERROR', 
          message: deliveriesError.message,
          details: deliveriesError
        });
      } else {
        results.push({ 
          test: 'Table deliveries', 
          status: 'OK', 
          message: `${deliveries?.length || 0} livraisons trouvées`,
          data: deliveries?.slice(0, 2)
        });
      }

      // Test 5: Variables d'environnement
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      results.push({
        test: 'Variables environnement',
        status: (supabaseUrl && supabaseKey) ? 'OK' : 'ERROR',
        message: `URL: ${supabaseUrl ? '✅' : '❌'}, Key: ${supabaseKey ? '✅' : '❌'}`
      });

    } catch (error: any) {
      results.push({ 
        test: 'Test général', 
        status: 'ERROR', 
        message: error.message,
        details: error
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Dashboard Supabase</h1>
      
      <button 
        onClick={runTests}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Relancer les tests'}
      </button>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === 'OK' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-semibold ${
                result.status === 'OK' ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.status === 'OK' ? '✅' : '❌'} {result.test}
              </span>
            </div>
            
            <p className="text-gray-700 mb-2">{result.message}</p>
            
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Voir les données ({result.data.length} éléments)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
            
            {result.details && result.status === 'ERROR' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                  Détails de l'erreur
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {testResults.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-8">Aucun test exécuté</p>
      )}
    </div>
  );
}
