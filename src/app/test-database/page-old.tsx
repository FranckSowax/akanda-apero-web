'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Play, Database, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

export default function TestDatabasePage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTests(prev => [...prev, result]);
  };

  const clearTests = () => {
    setTests([]);
  };

  const runDatabaseTests = async () => {
    setIsRunning(true);
    clearTests();

    // Test 1: Vérifier la connexion à la base de données
    addTestResult({
      name: 'Connexion Base de Données',
      status: 'pending',
      message: 'Test de connexion en cours...'
    });

    try {
      const response = await fetch('/api/test-db-connection');
      const result = await response.json();
      
      if (response.ok) {
        addTestResult({
          name: 'Connexion Base de Données',
          status: 'success',
          message: 'Connexion réussie',
          details: result
        });
      } else {
        addTestResult({
          name: 'Connexion Base de Données',
          status: 'error',
          message: result.error || 'Erreur de connexion'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Connexion Base de Données',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }

    // Test 2: Créer une commande test
    addTestResult({
      name: 'Création Commande Test',
      status: 'pending',
      message: 'Création d\'une commande test...'
    });

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrder)
      });

      const result = await response.json();

      if (response.ok) {
        addTestResult({
          name: 'Création Commande Test',
          status: 'success',
          message: `Commande créée avec succès: ${result.order_number}`,
          details: result
        });

        // Test 3: Récupérer la commande créée
        await testGetOrder(result.id);
        
        // Test 4: Changer le statut de la commande
        await testUpdateOrderStatus(result.id);

      } else {
        addTestResult({
          name: 'Création Commande Test',
          status: 'error',
          message: result.error || 'Erreur lors de la création'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Création Commande Test',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }

    setIsRunning(false);
  };

  const testGetOrder = async (orderId: string) => {
    addTestResult({
      name: 'Récupération Commande',
      status: 'pending',
      message: 'Récupération de la commande...'
    });

    try {
      const response = await fetch(`/api/orders?id=${orderId}`);
      const result = await response.json();

      if (response.ok) {
        addTestResult({
          name: 'Récupération Commande',
          status: 'success',
          message: 'Commande récupérée avec succès',
          details: result
        });
      } else {
        addTestResult({
          name: 'Récupération Commande',
          status: 'error',
          message: result.error || 'Erreur lors de la récupération'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Récupération Commande',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }
  };

  const testUpdateOrderStatus = async (orderId: string) => {
    addTestResult({
      name: 'Changement Statut',
      status: 'pending',
      message: 'Changement du statut de la commande...'
    });

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Confirmée' })
      });

      const result = await response.json();

      if (response.ok) {
        addTestResult({
          name: 'Changement Statut',
          status: 'success',
          message: 'Statut changé avec succès',
          details: result
        });
      } else {
        addTestResult({
          name: 'Changement Statut',
          status: 'error',
          message: result.error || 'Erreur lors du changement de statut'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'Changement Statut',
        status: 'error',
        message: `Erreur: ${error}`
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8 text-blue-600" />
          Test de la Base de Données
        </h1>
        <p className="text-gray-600">
          Vérification complète de l'intégration base de données et API
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <Button 
          onClick={runDatabaseTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? 'Tests en cours...' : 'Lancer les Tests'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={clearTests}
          disabled={isRunning}
        >
          Effacer les Résultats
        </Button>
      </div>

      {tests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Résultats des Tests</h2>
          
          {tests.map((test, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    {test.name}
                  </CardTitle>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-3">
                  {test.message}
                </CardDescription>
                
                {test.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      Voir les détails
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Cliquez sur "Lancer les Tests" pour vérifier la base de données
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
