'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ClientOnlyProps {
  children: React.ReactNode;
  loader?: React.ReactNode;
}

/**
 * Composant qui permet d'éviter les erreurs d'hydratation en affichant le contenu
 * uniquement lorsque l'application est chargée côté client.
 */
export function ClientOnly({ 
  children, 
  loader = (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
      <span className="ml-2 text-gray-600">Chargement...</span>
    </div>
  )
}: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return loader;
  }

  return <>{children}</>;
}
