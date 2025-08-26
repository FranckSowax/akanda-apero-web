import { NavigationLinks } from '../types/supabase';

/**
 * Service pour générer les liens de navigation vers différentes applications de cartes
 */
export class NavigationService {
  /**
   * Génère les liens de navigation pour une adresse donnée
   */
  static generateNavigationLinks(
    latitude: number,
    longitude: number,
    address?: string
  ): NavigationLinks {
    const coords = `${latitude},${longitude}`;
    
    return {
      waze: `https://waze.com/ul?ll=${coords}&navigate=yes`,
      google_maps: `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
      apple_maps: `http://maps.apple.com/?daddr=${coords}`,
      coordinates: {
        latitude,
        longitude,
        address: address || `${latitude}, ${longitude}`
      }
    };
  }

  /**
   * Génère un lien Waze spécifique
   */
  static getWazeLink(latitude: number, longitude: number): string {
    return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  }

  /**
   * Génère un lien Google Maps spécifique
   */
  static getGoogleMapsLink(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  /**
   * Génère un lien Apple Maps spécifique
   */
  static getAppleMapsLink(latitude: number, longitude: number): string {
    return `http://maps.apple.com/?daddr=${latitude},${longitude}`;
  }

  /**
   * Ouvre le lien de navigation dans une nouvelle fenêtre/onglet
   */
  static openNavigation(link: string): void {
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  /**
   * Détecte le système d'exploitation et ouvre l'application de navigation appropriée
   */
  static openBestNavigation(latitude: number, longitude: number): void {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS - Préférer Apple Maps
      this.openNavigation(this.getAppleMapsLink(latitude, longitude));
    } else if (userAgent.includes('android')) {
      // Android - Préférer Waze ou Google Maps
      this.openNavigation(this.getWazeLink(latitude, longitude));
    } else {
      // Desktop - Google Maps
      this.openNavigation(this.getGoogleMapsLink(latitude, longitude));
    }
  }

  /**
   * Calcule la distance entre deux points GPS (formule de Haversine)
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const earthRadius = 6371; // Rayon de la Terre en km
    
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return earthRadius * c;
  }

  /**
   * Convertit les degrés en radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Formate la distance pour l'affichage
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }

  /**
   * Valide les coordonnées GPS
   */
  static isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }

  /**
   * Génère un lien de partage de localisation
   */
  static generateShareLink(latitude: number, longitude: number, address?: string): string {
    const coords = `${latitude},${longitude}`;
    const text = address ? `Ma position: ${address}` : `Ma position: ${coords}`;
    
    return `https://www.google.com/maps/place/${coords}/@${coords},17z?entry=ttu`;
  }
}
