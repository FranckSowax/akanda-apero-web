'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { categories } from '../../scripts/categoryData';
import { supabase } from '../../lib/supabase/client';

export function CategoryInitializer() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: string[], errors: string[] }>({ success: [], errors: [] });
  const [showResult, setShowResult] = useState(false);

  const initCategories = async () => {
    setIsLoading(true);
    setShowResult(false);
    setResult({ success: [], errors: [] });

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
              // Pas besoin de spécifier color car il est géré côté client
            })
            .eq('id', existingCategory.id);
          
          if (updateError) {
            errorResults.push(`Erreur lors de la mise à jour de ${category.name}: ${updateError.message}`);
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
              // Les colonnes color et icon sont gérées côté client
            });
          
          if (insertError) {
            errorResults.push(`Erreur lors de la création de ${category.name}: ${insertError.message}`);
          } else {
            successResults.push(`✅ Catégorie créée: ${category.name}`);
          }
        }
      }
      
      setResult({ success: successResults, errors: errorResults });
      setShowResult(true);
    } catch (error) {
      setResult({ 
        success: successResults, 
        errors: [...errorResults, `Erreur générale: ${error instanceof Error ? error.message : String(error)}`] 
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Initialisation des Catégories</h2>
      <p className="mb-4 text-gray-600">
        Ce bouton va créer ou mettre à jour toutes les catégories standard dans la base de données.
        Les catégories existantes seront mises à jour, les nouvelles seront créées.
      </p>
      
      <Button 
        onClick={initCategories}
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initialisation en cours...
          </>
        ) : "Initialiser les Catégories"}
      </Button>
      
      {showResult && (
        <div className="mt-4 space-y-2">
          {result.success.length > 0 && (
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Opérations réussies:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-green-700">
                {result.success.map((msg, i) => (
                  <li key={`success-${i}`}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.errors.length > 0 && (
            <div className="bg-red-50 p-3 rounded-md">
              <h3 className="font-medium text-red-800 mb-2">Erreurs:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                {result.errors.map((msg, i) => (
                  <li key={`error-${i}`}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
