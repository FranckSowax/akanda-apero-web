/**
 * Service Whapi pour l'envoi de messages WhatsApp
 * Documentation: https://whapi.cloud/
 */

interface WhapiMessage {
  to: string;
  body: string;
  typing_time?: number;
}

interface WhapiResponse {
  sent: boolean;
  id?: string;
  message?: string;
  error?: string;
}

class WhapiService {
  private baseUrl: string;
  private token: string;
  private isEnabled: boolean;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WHAPI_BASE_URL || 'https://gate.whapi.cloud';
    this.token = process.env.NEXT_PUBLIC_WHAPI_TOKEN || '';
    this.isEnabled = !!this.token;
  }

  /**
   * Envoie un message WhatsApp via l'API Whapi
   */
  async sendMessage(to: string, message: string): Promise<WhapiResponse> {
    if (!this.isEnabled) {
      console.warn('Whapi non configuré - Message non envoyé:', { to, message });
      return { sent: false, error: 'Whapi non configuré' };
    }

    // Nettoyer le numéro de téléphone (supprimer espaces, tirets, etc.)
    const cleanPhone = this.cleanPhoneNumber(to);
    
    try {
      const response = await fetch(`${this.baseUrl}/messages/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          to: cleanPhone,
          body: message,
          typing_time: 2000, // Simulation de frappe pendant 2 secondes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // WhatsApp message sent successfully
        return { sent: true, id: data.id };
      } else {
        console.error('Erreur lors de l\'envoi du message WhatsApp:', data);
        return { sent: false, error: data.message || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error('Erreur réseau lors de l\'envoi WhatsApp:', error);
      return { sent: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Nettoie et formate un numéro de téléphone pour WhatsApp
   */
  private cleanPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si le numéro commence par 0, le remplacer par +241 (Gabon)
    if (cleaned.startsWith('0')) {
      cleaned = '+241' + cleaned.substring(1);
    }
    
    // Si le numéro ne commence pas par +, ajouter +241
    if (!cleaned.startsWith('+')) {
      cleaned = '+241' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Génère les messages de notification selon le statut de la commande
   */
  getStatusMessage(orderNumber: string, status: string, customerName: string): string {
    const messages = {
      'En préparation': `🍷 Bonjour ${customerName},\n\nVotre commande #${orderNumber} est maintenant en préparation chez Akanda Apéro !\n\nNos équipes préparent soigneusement vos produits. Vous recevrez une notification dès qu'elle sera prête.\n\nMerci pour votre confiance ! 🙏`,
      
      'Prête': `✅ Excellente nouvelle ${customerName} !\n\nVotre commande #${orderNumber} est prête et vous attend chez Akanda Apéro !\n\n📍 Vous pouvez venir la récupérer ou nous nous chargeons de la livraison selon votre choix.\n\nÀ très bientôt ! 🚀`,
      
      'En livraison': `🚚 ${customerName}, votre commande est en route !\n\nLe livreur est parti avec votre commande #${orderNumber} et arrivera bientôt à votre adresse.\n\n📱 Il vous contactera quelques minutes avant son arrivée.\n\nMerci de rester disponible ! ⏰`,
      
      'Livrée': `🎉 Parfait ${customerName} !\n\nVotre commande #${orderNumber} a été livrée avec succès !\n\nNous espérons que vous êtes satisfait(e) de vos produits Akanda Apéro.\n\n⭐ N'hésitez pas à nous laisser un avis et à recommander nos services !\n\nÀ bientôt pour de nouvelles commandes ! 🍷✨`
    };

    return messages[status as keyof typeof messages] || 
           `Mise à jour de votre commande #${orderNumber}: ${status}`;
  }

  /**
   * Envoie une notification de changement de statut
   */
  async sendStatusNotification(
    phone: string, 
    orderNumber: string, 
    status: string, 
    customerName: string
  ): Promise<WhapiResponse> {
    const message = this.getStatusMessage(orderNumber, status, customerName);
    return this.sendMessage(phone, message);
  }

  /**
   * Vérifie si le service Whapi est configuré
   */
  isConfigured(): boolean {
    return this.isEnabled;
  }

  /**
   * Teste la connexion à l'API Whapi
   */
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur lors du test de connexion Whapi:', error);
      return false;
    }
  }
}

// Instance singleton du service Whapi
export const whapiService = new WhapiService();

// Types exportés
export type { WhapiMessage, WhapiResponse };
