'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function TestCocktailValidation() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testCocktailValidation = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // 1. Tester la récupération des cocktails prêts
      console.log('🔍 Test 1: Récupération des cocktails prêts...');
      const { data: readyCocktails, error: readyError } = await supabase
        .from('ready_cocktails')
        .select('id, name, is_active')
        .eq('is_active', true)
        .limit(5);
      
      setResults(prev => [...prev, {
        test: 'Ready Cocktails',
        success: !readyError,
        data: readyCocktails,
        error: readyError?.message
      }]);

      // 2. Tester la vue products_unified
      console.log('🔍 Test 2: Vérification de products_unified...');
      const { data: unifiedProducts, error: unifiedError } = await supabase
        .from('products_unified')
        .select('id, name, source_table')
        .limit(10);
      
      setResults(prev => [...prev, {
        test: 'Products Unified',
        success: !unifiedError,
        data: unifiedProducts,
        error: unifiedError?.message
      }]);

      // 3. Tester avec un ID spécifique de cocktail
      if (readyCocktails && readyCocktails.length > 0) {
        const testCocktailId = readyCocktails[0].id;
        console.log('🔍 Test 3: Validation avec ID cocktail spécifique:', testCocktailId);
        
        // Test dans products_unified
        const { data: unifiedTest, error: unifiedTestError } = await supabase
          .from('products_unified')
          .select('id, name, source_table')
          .eq('id', testCocktailId)
          .single();
        
        setResults(prev => [...prev, {
          test: `Unified Test - ID: ${testCocktailId}`,
          success: !unifiedTestError,
          data: unifiedTest,
          error: unifiedTestError?.message
        }]);

        // Test direct dans ready_cocktails
        const { data: directTest, error: directTestError } = await supabase
          .from('ready_cocktails')
          .select('id, name')
          .eq('id', testCocktailId)
          .eq('is_active', true)
          .single();
        
        setResults(prev => [...prev, {
          test: `Direct Ready Cocktails - ID: ${testCocktailId}`,
          success: !directTestError,
          data: directTest,
          error: directTestError?.message
        }]);
      }

      // 4. Simuler une validation d'article comme dans l'API
      console.log('🔍 Test 4: Simulation validation API...');
      if (readyCocktails && readyCocktails.length > 0) {
        const testItem = {
          id: readyCocktails[0].id,
          name: readyCocktails[0].name,
          price: 10000,
          quantity: 1
        };

        const validationResult = await validateItem(testItem);
        setResults(prev => [...prev, {
          test: 'API Validation Simulation',
          success: validationResult.valid,
          data: validationResult,
          error: validationResult.error
        }]);
      }

    } catch (error) {
      console.error('Erreur lors du test:', error);
      setResults(prev => [...prev, {
        test: 'Global Error',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const validateItem = async (item: any) => {
    try {
      const productId = String(item.id);
      
      // Vérifier dans products_unified d'abord
      let { data: product, error } = await supabase
        .from('products_unified')
        .select('id, name, source_table')
        .eq('id', productId)
        .single();
      
      if (error || !product) {
        // Vérifier dans ready_cocktails
        const { data: readyCocktail, error: cocktailError } = await supabase
          .from('ready_cocktails')
          .select('id, name')
          .eq('id', productId)
          .eq('is_active', true)
          .single();
        
        if (readyCocktail && !cocktailError) {
          product = { 
            id: readyCocktail.id, 
            name: readyCocktail.name, 
            source_table: 'ready_cocktails' 
          };
        }
      }
      
      return {
        valid: !!product,
        product: product,
        originalError: error?.message,
        fallbackUsed: !!(error && product)
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erreur de validation'
      };
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test de Validation des Cocktails</h1>
      
      <button
        onClick={testCocktailValidation}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-6"
      >
        {loading ? 'Test en cours...' : 'Lancer les tests de validation'}
      </button>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? '✅' : '❌'}
              </span>
              <h3 className="font-semibold">{result.test}</h3>
            </div>
            
            {result.error && (
              <p className="text-red-600 text-sm mb-2">Erreur: {result.error}</p>
            )}
            
            {result.data && (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
