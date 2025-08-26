'use client';

import React, { useEffect, useState } from 'react';
import { MigrationService } from '../../services/migration-service';

export default function ProblemeTableInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTable = async () => {
      console.log('🚀 Initialisation de la table problemes...');
      
      // Créer la table si nécessaire
      const tableResult = await MigrationService.createProblemeTable();
      
      if (tableResult.success) {
        console.log('✅ Table problemes initialisée avec succès');
        
        // Créer les politiques RLS permissives
        console.log('🔐 Création des politiques RLS permissives...');
        const policiesResult = await MigrationService.createProblemesPolicies();
        
        if (policiesResult.success) {
          console.log('✅ Politiques RLS permissives créées avec succès');
          setIsInitialized(true);
        } else {
          console.error('❌ Erreur lors de la création des politiques RLS:', policiesResult.error);
          setError('Impossible de créer les politiques RLS pour la table problemes.');
        }
      } else {
        console.error('❌ Erreur lors de l\'initialisation de la table problemes:', tableResult.error);
        setError('Impossible de créer la table problemes. Veuillez la créer manuellement dans Supabase.');
      }
    };

    initializeTable();
  }, []);

  // Ce composant ne rend rien visuellement
  if (error) {
    console.warn('ProblemeTableInitializer:', error);
  }

  return null;
}
