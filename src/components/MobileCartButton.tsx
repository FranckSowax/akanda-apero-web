'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/button';

/**
 * Bouton de panier spécifique pour les appareils mobiles
 * Lien direct vers la page du panier au lieu d'utiliser un tiroir latéral
 */
const MobileCartButton: React.FC = () => {
  const { getCartItemsCount } = useAppContext();
  const itemCount = getCartItemsCount();
  
  // Utilisé pour éviter les erreurs d'hydratation
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Link href="/cart" passHref className="block">
      <Button 
        variant="ghost" 
        className="relative p-2 h-auto cursor-pointer" 
        aria-label="Voir le panier"
      >
        <ShoppingBag className="h-6 w-6 text-gray-700 hover:text-gray-900" />
        {isClient && itemCount > 0 && (
          <span 
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f5a623] text-xs font-bold text-white"
          >
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default MobileCartButton;
