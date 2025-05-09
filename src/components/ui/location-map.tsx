'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { MapPin, Loader2, Navigation } from 'lucide-react';

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialAddress?: string;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCM7mN8C6w1r6g0NKF2mRVKbHckDNScw_E';

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect, initialAddress }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [address, setAddress] = useState(initialAddress || '');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Charger le script Google Maps
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    
    document.head.appendChild(script);
    
    return () => {
      // Nettoyer le script si le composant est démonté avant le chargement
      if (document.head.contains(script) && !window.google?.maps) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Initialiser la carte une fois que le script est chargé
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Coordonnées par défaut (centre de Libreville)
    const defaultLocation = { lat: 0.3924, lng: 9.4536 };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    
    const markerInstance = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });
    
    // Utiliser le geocoder pour obtenir l'adresse à partir des coordonnées
    const geocoder = new window.google.maps.Geocoder();
    const infoWindow = new window.google.maps.InfoWindow();
    
    // Fonction pour obtenir l'adresse à partir des coordonnées
    const getAddressFromCoordinates = (lat: number, lng: number) => {
      setLoading(true);
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        setLoading(false);
        if (status === 'OK' && results && results[0]) {
          const newAddress = results[0].formatted_address;
          setAddress(newAddress);
          infoWindow.setContent(`<div><strong>Position sélectionnée</strong><br>${newAddress}</div>`);
          infoWindow.open(mapInstance, markerInstance);
          
          // Informer le parent du changement de localisation
          onLocationSelect({ lat, lng, address: newAddress });
        } else {
          console.error('Geocoder failed due to: ' + status);
        }
      });
    };
    
    // Écouter les événements de clic sur la carte
    mapInstance.addListener('click', (e: any) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        markerInstance.setPosition(e.latLng);
        getAddressFromCoordinates(lat, lng);
      }
    });
    
    // Écouter les événements de fin de glissement du marqueur
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        getAddressFromCoordinates(position.lat(), position.lng());
      }
    });
    
    // Si une adresse initiale est fournie, essayer de la géocoder
    if (initialAddress) {
      geocoder.geocode({ address: initialAddress }, (results: any, status: string) => {
        if (status === 'OK' && results && results[0] && results[0].geometry) {
          const location = results[0].geometry.location;
          mapInstance.setCenter(location);
          markerInstance.setPosition(location);
          
          // Informer le parent du changement de localisation
          onLocationSelect({ 
            lat: location.lat(), 
            lng: location.lng(), 
            address: initialAddress 
          });
        }
      });
    }
    
    setMap(mapInstance);
    setMarker(markerInstance);
  }, [mapLoaded, onLocationSelect, initialAddress]);
  
  // Fonction pour obtenir la position actuelle de l'utilisateur
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas prise en charge par votre navigateur');
      return;
    }
    
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        if (map && marker) {
          const currentLocation = new window.google.maps.LatLng(lat, lng);
          map.setCenter(currentLocation);
          map.setZoom(17); // Zoom plus proche quand on utilise la géolocalisation
          marker.setPosition(currentLocation);
          
          // Obtenir l'adresse correspondante
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
            setLoadingGeo(false);
            if (status === 'OK' && results && results[0]) {
              const newAddress = results[0].formatted_address;
              setAddress(newAddress);
              
              // Informer le parent du changement de localisation
              onLocationSelect({ lat, lng, address: newAddress });
            } else {
              console.error('Geocoder failed due to: ' + status);
              onLocationSelect({ lat, lng, address: 'Position actuelle' });
            }
          });
        }
      },
      (error) => {
        setLoadingGeo(false);
        alert(`Erreur de géolocalisation: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Sélectionnez votre position</h3>
        <Button 
          onClick={handleGetCurrentLocation} 
          variant="outline" 
          size="sm"
          disabled={loadingGeo || !mapLoaded}
          className="flex items-center gap-1 text-sm"
        >
          {loadingGeo ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Localisation...</span>
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              <span>Ma position</span>
            </>
          )}
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-[250px] rounded-md border border-gray-200 bg-gray-100 relative"
      />
      
      <div className="flex items-start gap-2 mt-2">
        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
          {loading ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Chargement de l'adresse...</span>
            </div>
          ) : address ? (
            <p className="text-sm text-gray-700">{address}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">Cliquez sur la carte pour sélectionner votre position</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { LocationMap };

// Ajouter la déclaration pour TypeScript
declare global {
  interface Window {
    google: any;
  }
}
