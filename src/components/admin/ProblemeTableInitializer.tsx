'use client';

import React, { useEffect, useState } from 'react';
import { MigrationService } from '../../services/migration-service';

export default function ProblemeTableInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTable = async () => {
      try {
        // Tester d'abord si la table existe
        const testResult = await MigrationService.testProblemeTable();
        
        if (testResult.success) {
          setIsInitialized(true);
          return;
        }

        // Si la table n'existe pas, essayer de la créer
        console.log('Table problemes non trouvée, tentative de création...');
        const createResult = await MigrationService.createProblemeTable();
        
        if (createResult.success) {
          setIsInitialized(true);
          console.log('Table problemes initialisée avec succès');
        } else {
          setError('Impossible de créer la table problemes. Veuillez la créer manuellement dans Supabase.');
          console.error('Erreur lors de la création de la table:', createResult.error);
        }
      } catch (err) {
        setError('Erreur lors de l\'initialisation de la table problemes');
        console.error('Erreur:', err);
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
