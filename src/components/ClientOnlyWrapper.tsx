'use client';

import React, { useEffect, useState } from 'react';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Composant pour éviter les erreurs d'hydratation
 * Affiche le contenu seulement côté client
 */
export default function ClientOnlyWrapper({ 
  children, 
  fallback = null 
}: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
