"use client";

import React, { useEffect, useState } from 'react';

interface ParallaxSectionProps {
  imageUrl: string;
  imageAlt: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

// Composant responsive avec effet parallax adaptatif
// L'effet parallax est désactivé sur mobile pour une meilleure performance
export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  imageUrl,
  imageAlt,
  children,
  className = '',
  minHeight = '300px', // Hauteur minimale par défaut
}) => {
  // État pour détecter si le client-side rendering est actif
  const [isClient, setIsClient] = useState(false);

  // État pour détecter si c'est un appareil mobile
  const [isMobile, setIsMobile] = useState(false);

  // Marquer quand le rendu côté client est actif
  useEffect(() => {
    setIsClient(true);
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Vérifie lors du chargement initial
    checkIfMobile();
    
    // Vérifie lors du redimensionnement de la fenêtre
    window.addEventListener('resize', checkIfMobile);
    
    // Nettoyage lors du démontage du composant
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Par défaut, utiliser un style pour le rendu serveur
  const backgroundStyle = {
    position: 'relative' as const,
    backgroundImage: `url('${imageUrl}')`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundOrigin: 'border-box',
    minHeight: minHeight,
    height: '450px',
  };

  // Ajouter les propriétés spécifiques au client seulement après le premier rendu
  const clientSideStyle = isClient ? {
    ...backgroundStyle,
    backgroundAttachment: isMobile ? 'scroll' : 'fixed',
    height: isMobile ? '300px' : '450px',
  } : backgroundStyle;

  return (
    <section className={`w-full py-0 my-0 ${className}`}>
      <div 
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={clientSideStyle}
        aria-label={imageAlt}
      >
        {/* Superposition sombre */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Contenu avec padding responsive */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8 lg:px-12 max-w-full md:max-w-3xl lg:max-w-4xl">
          {children}
        </div>
      </div>
    </section>
  );
};

export default ParallaxSection;
