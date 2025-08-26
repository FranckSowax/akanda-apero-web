'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from './button';
import { NavigationService } from '../../services/navigationService';
import { NavigationLinks as NavigationLinksType } from '../../types/supabase';

interface NavigationLinksProps {
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
  showCoordinates?: boolean;
}

export const NavigationLinks: React.FC<NavigationLinksProps> = ({
  latitude,
  longitude,
  address,
  className = '',
  showCoordinates = true
}) => {
  // Valider les coordonnées
  if (!NavigationService.isValidCoordinates(latitude, longitude)) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <MapPin className="inline w-4 h-4 mr-1" />
        Coordonnées GPS non disponibles
      </div>
    );
  }

  const navigationLinks = NavigationService.generateNavigationLinks(latitude, longitude, address);

  const handleOpenWaze = () => {
    NavigationService.openNavigation(navigationLinks.waze);
  };

  const handleOpenGoogleMaps = () => {
    NavigationService.openNavigation(navigationLinks.google_maps);
  };

  const handleOpenAppleMaps = () => {
    NavigationService.openNavigation(navigationLinks.apple_maps);
  };

  const handleOpenBestNavigation = () => {
    NavigationService.openBestNavigation(latitude, longitude);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Coordonnées GPS */}
      {showCoordinates && (
        <div className="text-xs bg-green-50 border border-green-200 text-green-700 p-2 rounded">
          <div className="font-semibold flex items-center mb-1">
            <MapPin className="w-3 h-3 mr-1" />
            Position GPS
          </div>
          <div className="font-mono">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
          {address && (
            <div className="mt-1 text-green-600">{address}</div>
          )}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex flex-wrap gap-2">
        {/* Bouton navigation automatique */}
        <Button
          onClick={handleOpenBestNavigation}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Navigation className="w-4 h-4 mr-1" />
          Naviguer
        </Button>

        {/* Bouton Waze */}
        <Button
          onClick={handleOpenWaze}
          size="sm"
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <div className="w-4 h-4 mr-1 text-purple-600">🚗</div>
          Waze
        </Button>

        {/* Bouton Google Maps */}
        <Button
          onClick={handleOpenGoogleMaps}
          size="sm"
          variant="outline"
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Google Maps
        </Button>

        {/* Bouton Apple Maps (sur iOS) */}
        {navigator.userAgent.toLowerCase().includes('iphone') || 
         navigator.userAgent.toLowerCase().includes('ipad') ? (
          <Button
            onClick={handleOpenAppleMaps}
            size="sm"
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Apple Maps
          </Button>
        ) : null}
      </div>

      {/* Liens directs (pour copier-coller) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
          Liens directs
        </summary>
        <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
          <div>
            <strong>Waze:</strong>
            <br />
            <code className="text-xs bg-gray-100 p-1 rounded break-all">
              {navigationLinks.waze}
            </code>
          </div>
          <div>
            <strong>Google Maps:</strong>
            <br />
            <code className="text-xs bg-gray-100 p-1 rounded break-all">
              {navigationLinks.google_maps}
            </code>
          </div>
        </div>
      </details>
    </div>
  );
};

// Composant simplifié pour affichage en ligne
export const InlineNavigationLinks: React.FC<NavigationLinksProps> = ({
  latitude,
  longitude,
  address,
  className = ''
}) => {
  if (!NavigationService.isValidCoordinates(latitude, longitude)) {
    return (
      <span className={`text-gray-500 text-sm ${className}`}>
        GPS non disponible
      </span>
    );
  }

  const handleOpenBestNavigation = () => {
    NavigationService.openBestNavigation(latitude, longitude);
  };

  return (
    <Button
      onClick={handleOpenBestNavigation}
      size="sm"
      variant="ghost"
      className={`text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto ${className}`}
    >
      <Navigation className="w-3 h-3 mr-1" />
      Naviguer
    </Button>
  );
};
