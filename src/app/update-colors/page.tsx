'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Loader2, Check, AlertCircle, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { categories } from '../../scripts/categoryData';
import Link from 'next/link';

export default function UpdateColorsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<{success: string[], errors: string[]}>({
    success: [],
    errors: []
  });

  // Mettre à jour les couleurs automatiquement au chargement de la page
  useEffect(() => {
    updateCategoryColors();
  }, []);

  const updateCategoryColors = async () => {
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

      // 2. Mettre à jour chaque catégorie avec la couleur correspondante
      for (const category of categories) {
        try {
          // Trouver la catégorie correspondante dans Supabase
          const matchingCategory = allCategories.find(
            c => c.slug === category.slug || 
                c.name.toLowerCase() === category.name.toLowerCase()
          );

          if (matchingCategory) {
            // Mettre à jour la couleur et l'icône
            const { error: updateError } = await supabase
              .from('categories')
              .update({
                color: category.color,
                icon: category.icon
              })
              .eq('id', matchingCategory.id);
            
            if (updateError) {
              errorResults.push(`Erreur mise à jour ${category.name}: ${updateError.message}`);
            } else {
              successResults.push(`✅ Couleur mise à jour pour: ${category.name} (${category.color})`);
            }
          } else {
            errorResults.push(`Catégorie non trouvée: ${category.name}`);
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

  // Afficher un aperçu des couleurs
  const ColorPreview = ({ name, color }: { name: string, color: string }) => (
    <div className="flex items-center gap-2 p-2 rounded-md bg-white shadow-sm">
      <div 
        className="h-6 w-6 rounded-full border border-gray-200" 
        style={{ backgroundColor: color }} 
      />
      <span className="text-sm font-medium">{name}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="flex items-center justify-center mb-4">
          <span className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full">
            <Palette className="h-10 w-10" />
          </span>
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Mise à jour des couleurs</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Mise à jour des couleurs en cours...</p>
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
                {results.errors.length === 0 ? 'Mise à jour réussie!' : 'Mise à jour terminée avec des avertissements'}
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
          <>
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-lg text-gray-600 mb-6 text-center">
                Cette page va mettre à jour les couleurs des catégories selon le nouveau schéma de couleurs.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full mb-6">
                {categories.map((cat, idx) => (
                  <ColorPreview key={idx} name={cat.name} color={cat.color} />
                ))}
              </div>
              
              <Button 
                size="lg" 
                onClick={updateCategoryColors}
                className="px-8 bg-blue-500 hover:bg-blue-600"
              >
                Mettre à jour les couleurs
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
