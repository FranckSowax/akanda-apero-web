'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Loader2, Check, AlertCircle, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { categories } from '../../scripts/categoryData';
import Link from 'next/link';

export default function InitCategoriesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<{success: string[], errors: string[]}>({
    success: [],
    errors: []
  });

  // Initialiser les catégories automatiquement au chargement de la page
  useEffect(() => {
    initializeCategories();
  }, []);

  const initializeCategories = async () => {
    setIsLoading(true);
    const successResults: string[] = [];
    const errorResults: string[] = [];

    try {
      for (const category of categories) {
        // Vérifier si la catégorie existe déjà (par slug)
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id, slug')
          .eq('slug', category.slug)
          .single();
        
        if (existingCategory) {
          // Mettre à jour la catégorie existante
          const { error: updateError } = await supabase
            .from('categories')
            .update({
              name: category.name,
              description: category.description,
              image_url: category.image_url,
              color: category.color || '#f5a623',
              icon: category.icon || 'Package'
            })
            .eq('id', existingCategory.id);
          
          if (updateError) {
            errorResults.push(`Erreur mise à jour ${category.name}: ${updateError.message}`);
          } else {
            successResults.push(`✅ Catégorie mise à jour: ${category.name}`);
          }
        } else {
          // Créer une nouvelle catégorie
          const { error: insertError } = await supabase
            .from('categories')
            .insert({
              name: category.name,
              slug: category.slug,
              description: category.description,
              image_url: category.image_url,
              color: category.color || '#f5a623',
              icon: category.icon || 'Package'
            });
          
          if (insertError) {
            errorResults.push(`Erreur création ${category.name}: ${insertError.message}`);
          } else {
            successResults.push(`✅ Catégorie créée: ${category.name}`);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errorResults.push(`Erreur générale: ${errorMessage}`);
    } finally {
      setResults({
        success: successResults,
        errors: errorResults
      });
      setIsLoading(false);
      setIsComplete(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="flex items-center justify-center mb-4">
          <span className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-600 rounded-full">
            <Star className="h-10 w-10" />
          </span>
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Initialisation des Catégories</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-[#f5a623] animate-spin mb-4" />
            <p className="text-lg text-gray-600">Initialisation des catégories en cours...</p>
          </div>
        ) : isComplete ? (
          <>
            <div className="flex flex-col items-center justify-center mb-8">
              {results.errors.length === 0 ? (
                <Check className="h-16 w-16 text-green-500 mb-4" />
              ) : (
                <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              )}
              <h2 className="text-2xl font-bold text-center">
                {results.errors.length === 0 ? 'Initialisation réussie!' : 'Initialisation terminée avec des avertissements'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {results.success.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Opérations réussies ({results.success.length})</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    {results.success.map((msg, i) => (
                      <li key={`success-${i}`}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Erreurs ({results.errors.length})</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {results.errors.map((msg, i) => (
                      <li key={`error-${i}`}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <Button asChild className="w-full">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/dashboard">Aller au Dashboard</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-600 mb-6 text-center">
              Cette page va automatiquement initialiser toutes les catégories dans la base de données.
            </p>
            <Button 
              size="lg" 
              onClick={initializeCategories}
              className="px-8"
            >
              Démarrer l'initialisation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
