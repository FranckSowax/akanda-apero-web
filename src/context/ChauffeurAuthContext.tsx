'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ChauffeurAuthContextType {
  chauffeurId: string | null;
  chauffeurToken: string | null;
  chauffeurNom: string | null;
  chauffeur: { id: string; nom: string; telephone?: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
  setChauffeurAuth: (token: string, id: string, nom: string) => void;
  clearChauffeurAuth: () => void;
  logout: () => void;
  refreshAuth: () => void;
}

const ChauffeurAuthContext = createContext<ChauffeurAuthContextType | undefined>(undefined);

export function ChauffeurAuthProvider({ children }: { children: React.ReactNode }) {
  const [chauffeurId, setChauffeurId] = useState<string | null>(null);
  const [chauffeurToken, setChauffeurToken] = useState<string | null>(null);
  const [chauffeurNom, setChauffeurNom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!(chauffeurId && chauffeurToken);

  // Fonction pour définir l'authentification chauffeur
  const setChauffeurAuth = (token: string, id: string, nom: string) => {
    console.log('🔐 ChauffeurAuth - Setting auth:', { id, nom });
    localStorage.setItem('chauffeur_token', token);
    localStorage.setItem('chauffeur_id', id);
    localStorage.setItem('chauffeur_nom', nom);
    
    setChauffeurToken(token);
    setChauffeurId(id);
    setChauffeurNom(nom);
  };

  // Fonction pour effacer l'authentification chauffeur
  const clearChauffeurAuth = () => {
    console.log('🚪 ChauffeurAuth - Clearing auth');
    localStorage.removeItem('chauffeur_token');
    localStorage.removeItem('chauffeur_id');
    localStorage.removeItem('chauffeur_nom');
    
    setChauffeurToken(null);
    setChauffeurId(null);
    setChauffeurNom(null);
  };

  // Fonction pour rafraîchir l'état d'authentification
  const refreshAuth = () => {
    console.log('🔄 ChauffeurAuth - Refreshing auth state');
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('chauffeur_token');
      const id = localStorage.getItem('chauffeur_id');
      const nom = localStorage.getItem('chauffeur_nom');
      
      console.log('🔍 ChauffeurAuth - Found in localStorage:', { 
        hasToken: !!token, 
        hasId: !!id, 
        hasNom: !!nom 
      });
      
      setChauffeurToken(token);
      setChauffeurId(id);
      setChauffeurNom(nom);
    }
    setLoading(false);
  };

  // Initialisation et écoute des changements
  useEffect(() => {
    console.log('🚀 ChauffeurAuth - Initializing...');
    refreshAuth();

    // Écouter les changements de localStorage (autres onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('chauffeur_')) {
        console.log('🔄 ChauffeurAuth - Storage change detected:', e.key);
        refreshAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('🔍 ChauffeurAuth - State updated:', {
      chauffeurId,
      chauffeurNom,
      isAuthenticated,
      loading
    });
  }, [chauffeurId, chauffeurNom, isAuthenticated, loading]);

  // Créer l'objet chauffeur pour compatibilité
  const chauffeur = chauffeurId && chauffeurNom ? {
    id: chauffeurId,
    nom: chauffeurNom,
    telephone: ''
  } : null;

  // Alias pour logout
  const logout = clearChauffeurAuth;

  const value = {
    chauffeurId,
    chauffeurToken,
    chauffeurNom,
    chauffeur,
    isAuthenticated,
    loading,
    setChauffeurAuth,
    clearChauffeurAuth,
    logout,
    refreshAuth
  };

  return (
    <ChauffeurAuthContext.Provider value={value}>
      {children}
    </ChauffeurAuthContext.Provider>
  );
}

export function useChauffeurAuth() {
  const context = useContext(ChauffeurAuthContext);
  if (context === undefined) {
    throw new Error('useChauffeurAuth must be used within a ChauffeurAuthProvider');
  }
  return context;
}
