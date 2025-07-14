'use client';

import { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestDatabasePage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setCreatedOrderId(null);

    const testResults: TestResult[] = [];

    // Test 1: Connexion Base de Données
    try {
      const dbResponse = await fetch('/api/test-db-connection');
      const dbData = await dbResponse.json();
      
      if (dbResponse.ok && dbData.success) {
        testResults.push({
          name: 'Connexion Base de Données',
          status: 'success',
          message: 'Connexion réussie',
          details: dbData
        });
      } else {
        testResults.push({
          name: 'Connexion Base de Données',
          status: 'error',
          message: dbData.error || 'Erreur de connexion',
          details: dbData
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Connexion Base de Données',
        status: 'error',
        message: 'Erreur de connexion',
        details: error
      });
    }

    setResults([...testResults]);

    // Test 2: Création Commande Test
    try {
      const testOrder = {
        customerInfo: {
          email: 'test.database@akanda-apero.com',
          first_name: 'Test',
          last_name: 'Database',
          phone: '+24177999888'
        },
        deliveryInfo: {
          address: 'Adresse Test Libreville, Gabon',
          district: 'Libreville',
          additionalInfo: 'Test de vérification base de données',
          location: {
            lat: 0.3901,
            lng: 9.4544,
            hasLocation: true
          },
          deliveryOption: 'delivery'
        },
        paymentInfo: {
          method: 'cash'
        },
        items: [
          {
            id: 1,
            name: 'Produit Test Database',
            price: 5000,
            quantity: 2,
            imageUrl: '/test.jpg'
          }
        ],
        totalAmount: 12000,
        subtotal: 10000,
        deliveryCost: 2000,
        discount: 0
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCreatedOrderId(data.order.id);
        testResults.push({
          name: 'Création Commande Test',
          status: 'success',
          message: `Commande créée avec succès (${data.order.order_number})`,
          details: data.order
        });
      } else {
        testResults.push({
          name: 'Création Commande Test',
          status: 'error',
          message: data.error || 'Erreur lors de la création',
          details: data
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Création Commande Test',
        status: 'error',
        message: 'Erreur lors de la création',
        details: error
      });
    }

    setResults([...testResults]);

    // Test 3: Récupération Commande (si créée)
    if (createdOrderId) {
      try {
        const response = await fetch(`/api/orders?id=${createdOrderId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          testResults.push({
            name: 'Récupération Commande',
            status: 'success',
            message: 'Commande récupérée avec succès',
            details: data.order
          });
        } else {
          testResults.push({
            name: 'Récupération Commande',
            status: 'error',
            message: data.error || 'Erreur lors de la récupération',
            details: data
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Récupération Commande',
          status: 'error',
          message: 'Erreur lors de la récupération',
          details: error
        });
      }

      setResults([...testResults]);

      // Test 4: Changement Statut
      try {
        const response = await fetch(`/api/orders?id=${createdOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Confirmée' })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          testResults.push({
            name: 'Changement Statut',
            status: 'success',
            message: 'Statut mis à jour avec succès',
            details: data.order
          });
        } else {
          testResults.push({
            name: 'Changement Statut',
            status: 'error',
            message: data.error || 'Erreur lors du changement de statut',
            details: data
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Changement Statut',
          status: 'error',
          message: 'Erreur lors du changement de statut',
          details: error
        });
      }
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🔍 Test de la Base de Données
        </h1>
        <p style={{ color: '#6b7280' }}>
          Vérification de l'intégration Supabase et des API Akanda Apéro
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={runTests}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          {isRunning ? '⏳' : '▶️'} 
          {isRunning ? 'Tests en cours...' : 'Lancer les Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>
                  {getStatusIcon(result.status)}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  {result.name}
                </h3>
                <span
                  style={{
                    backgroundColor: getStatusColor(result.status),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
              
              <p style={{ margin: '0.5rem 0', color: '#374151' }}>
                {result.message}
              </p>
              
              {result.details && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '0.875rem' }}>
                    Voir les détails
                  </summary>
                  <pre style={{
                    backgroundColor: '#f3f4f6',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    marginTop: '0.5rem'
                  }}>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '2px dashed #d1d5db'
        }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            🚀 Prêt pour les tests
          </p>
          <p>
            Cliquez sur "Lancer les Tests" pour vérifier votre base de données
          </p>
        </div>
      )}
    </div>
  );
}
