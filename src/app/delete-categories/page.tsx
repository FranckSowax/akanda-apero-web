'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Loader2, Check, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import Link from 'next/link';

export default function DeleteCategoriesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<{success: string[], errors: string[]}>({
    success: [],
    errors: []
  });

  const categoriesToDelete = ["bestseller", "meilleures-ventes", "package-test", "pack-test", "test", "best-sellers"];

  // Supprimer les catégories automatiquement au chargement de la page
  useEffect(() => {
    deleteCategories();
  }, []);

  const deleteCategories = async () => {
    setIsLoading(true);
    const successResults: string[] = [];
    const errorResults: string[] = [];

    try {
      // 1. Récupérer toutes les catégories
      const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, slug');
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des catégories: ${fetchError.message}`);
      }

      // 2. Filtrer les catégories à supprimer
      const categoriesToRemove = allCategories.filter(cat => 
        categoriesToDelete.includes(cat.slug) || 
        cat.name.toLowerCase().includes('test') ||
        cat.name.toLowerCase().includes('bestseller') ||
        cat.name.toLowerCase().includes('best seller') ||
        cat.name.toLowerCase().includes('meilleures ventes')
      );

      // 3. Supprimer les associations product_categories pour ces catégories
      for (const category of categoriesToRemove) {
        try {
          // Vérifier s'il y a des produits associés
          const { data: associatedProducts } = await supabase
            .from('product_categories')
            .select('product_id')
            .eq('category_id', category.id);

          if (associatedProducts && associatedProducts.length > 0) {
            // Supprimer les associations
            const { error: deleteAssocError } = await supabase
              .from('product_categories')
              .delete()
              .eq('category_id', category.id);
            
            if (deleteAssocError) {
              errorResults.push(`Erreur lors de la suppression des associations pour ${category.name}: ${deleteAssocError.message}`);
            } else {
              successResults.push(`✅ Associations supprimées pour la catégorie: ${category.name}`);
            }
          }

          // Supprimer la catégorie
          const { error: deleteCatError } = await supabase
            .from('categories')
            .delete()
            .eq('id', category.id);

          if (deleteCatError) {
            errorResults.push(`Erreur lors de la suppression de ${category.name}: ${deleteCatError.message}`);
          } else {
            successResults.push(`✅ Catégorie supprimée: ${category.name}`);
          }
        } catch (categoryError) {
          const errorMessage = categoryError instanceof Error ? categoryError.message : String(categoryError);
          errorResults.push(`Erreur pour ${category.name}: ${errorMessage}`);
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
          <span className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-full">
            <Trash2 className="h-10 w-10" />
          </span>
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Suppression des Catégories</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Suppression des catégories en cours...</p>
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
                {results.errors.length === 0 ? 'Suppression réussie!' : 'Suppression terminée avec des avertissements'}
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
              Cette page va automatiquement supprimer les catégories "Best seller", "Meilleures Ventes", "Package test" et similaires.
            </p>
            <Button 
              size="lg" 
              onClick={deleteCategories}
              className="px-8 bg-red-500 hover:bg-red-600"
            >
              Démarrer la suppression
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
