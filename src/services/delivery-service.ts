// Utilisation du serveur MCP Supabase pour les opérations sur les livraisons
const mcpClient = {
  async readResource(name: string) {
    try {
      console.log('🌐 Appel API MCP pour:', name);
      const response = await fetch('/api/mcp/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', resource: name })
      });
      
      console.log('📡 Statut réponse HTTP:', response.status);
      
      if (!response.ok) {
        console.error('❌ Erreur HTTP:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}` };
      }
      
      const result = await response.json();
      console.log('📦 Réponse JSON reçue:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur réseau MCP:', error);
      return { success: false, error: error.message };
    }
  },
  
  async createResource(name: string, data: any) {
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', resource: name, data })
    });
    return response.json();
  },
  
  async updateResource(name: string, params: any, data: any) {
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', resource: name, params, data })
    });
    return response.json();
  },
  
  async deleteResource(name: string, params: any) {
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: name, params })
    });
    return response.json();
  }
};

export interface Livraison {
  id: string;
  order_id: string;
  numero_commande: string;
  nom_client: string;
  telephone_client?: string;
  adresse_livraison: string;
  quartier?: string;
  latitude?: number;
  longitude?: number;
  type_livraison: 'standard' | 'express' | 'programmee';
  lien_waze?: string;
  montant_livraison: number;
  statut_livraison: 'en_attente' | 'recherche_chauffeur' | 'affecte' | 'en_route_pickup' | 'recupere' | 'en_livraison' | 'livre' | 'annule';
  chauffeur_id?: string;
  affecte_a?: string;
  recupere_a?: string;
  livre_a?: string;
  temps_estime_pickup?: number;
  temps_estime_livraison?: number;
  distance_km?: number;
  notes_chauffeur?: string;
  notes_admin?: string;
  notes_livraison?: string;
  created_at: string;
  updated_at: string;
}

export interface Chauffeur {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  vehicule_type?: string;
  vehicule_plaque?: string;
  disponible: boolean;
  latitude?: number;
  longitude?: number;
  vitesse?: number;
  direction?: number;
  derniere_position?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Service pour la gestion des livraisons via MCP
const DeliveryService = {
  // Récupérer toutes les livraisons avec filtres optionnels
  async getLivraisons(filters?: {
    statut?: string;
    chauffeur_id?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<{ data: Livraison[] | null; error: any }> {
    try {
      console.log('Récupération des livraisons via MCP...');
      const response = await mcpClient.readResource('livraisons');
      if (!response.success) {
        return { data: null, error: response.error || response.message };
      }
      
      let livraisons = response.data || [];
      
      // Appliquer les filtres côté client
      if (filters?.statut && filters.statut !== 'all') {
        livraisons = livraisons.filter((l: Livraison) => l.statut_livraison === filters.statut);
      }
      if (filters?.chauffeur_id) {
        livraisons = livraisons.filter((l: Livraison) => l.chauffeur_id === filters.chauffeur_id);
      }
      
      return { data: livraisons, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons:', error);
      return { data: null, error };
    }
  },

  // Récupérer tous les chauffeurs
  async getChauffeurs(): Promise<{ data: Chauffeur[] | null; error: any }> {
    try {
      console.log('🔍 Récupération des chauffeurs via MCP...');
      const response = await mcpClient.readResource('chauffeurs');
      console.log('🔗 Réponse MCP brute:', response);
      
      if (!response || !response.success) {
        console.error('❌ MCP Error:', response?.message || 'Réponse MCP invalide');
        return { data: null, error: response?.message || 'Erreur MCP' };
      }
      
      console.log('📋 Données chauffeurs reçues:', response.data?.length || 0, 'chauffeurs');
      return { data: response.data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des chauffeurs:', error);
      return { data: null, error };
    }
  },

  // Mettre à jour le statut d'une livraison
  async updateLivraisonStatus(
    livraisonId: string, 
    newStatus: Livraison['statut_livraison'],
    additionalData?: Partial<Livraison>
  ): Promise<{ data: Livraison | null; error: any }> {
    try {
      console.log(`Mise à jour statut livraison ${livraisonId} vers ${newStatus}`);
      
      const updateData: any = { 
        statut_livraison: newStatus,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      // Ajouter des timestamps selon le statut
      if (newStatus === 'affecte') {
        updateData.affecte_a = new Date().toISOString();
      } else if (newStatus === 'recupere') {
        updateData.recupere_a = new Date().toISOString();
      } else if (newStatus === 'livre') {
        updateData.livre_a = new Date().toISOString();
      }

      const response = await mcpClient.updateResource('livraisons', { id: livraisonId }, updateData);
      
      if (!response.success) {
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { data: null, error };
    }
  },

  // Assigner une livraison à un chauffeur
  async assignerChauffeur(
    livraisonId: string, 
    chauffeurId: string
  ): Promise<{ data: Livraison | null; error: any }> {
    try {
      console.log(`Assignation livraison ${livraisonId} au chauffeur ${chauffeurId}`);
      
      const updateData = {
        chauffeur_id: chauffeurId,
        statut_livraison: 'affecte' as const,
        affecte_a: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await mcpClient.updateResource('livraisons', { id: livraisonId }, updateData);
      
      if (!response.success) {
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      return { data: null, error };
    }
  },

  // Mettre à jour le statut d'un chauffeur
  async updateChauffeurStatus(
    chauffeurId: string, 
    disponible: boolean
  ): Promise<{ data: Chauffeur | null; error: any }> {
    try {
      console.log(`Mise à jour statut chauffeur ${chauffeurId} vers ${disponible ? 'disponible' : 'occupé'}`);
      
      const updateData = {
        disponible,
        updated_at: new Date().toISOString()
      };

      const response = await mcpClient.updateResource('chauffeurs', { id: chauffeurId }, updateData);
      
      if (!response.success) {
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut chauffeur:', error);
      return { data: null, error };
    }
  },

  // Créer un nouveau chauffeur
  async createChauffeur(chauffeurData: Partial<Chauffeur>): Promise<{ data: Chauffeur | null; error: any }> {
    try {
      console.log('Création d\'un nouveau chauffeur via MCP...');
      
      const newChauffeur = {
        ...chauffeurData,
        statut: 'hors_ligne',
        disponible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await mcpClient.createResource('chauffeurs', newChauffeur);
      
      if (!response.success) {
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la création du chauffeur:', error);
      return { data: null, error };
    }
  },

  // Mettre à jour un chauffeur
  async updateChauffeur(
    chauffeurId: string, 
    chauffeurData: Partial<Chauffeur>
  ): Promise<{ data: Chauffeur | null; error: any }> {
    try {
      console.log(`Mise à jour chauffeur ${chauffeurId}`);
      
      const updateData = {
        ...chauffeurData,
        updated_at: new Date().toISOString()
      };

      const response = await mcpClient.updateResource('chauffeurs', { id: chauffeurId }, updateData);
      
      if (!response.success) {
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chauffeur:', error);
      return { data: null, error };
    }
  },

  // Supprimer un chauffeur
  async deleteChauffeur(chauffeurId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log(`Suppression chauffeur ${chauffeurId}`);

      const response = await mcpClient.deleteResource('chauffeurs', { id: chauffeurId });
      
      if (!response.success) {
        return { data: null, error: response.error };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du chauffeur:', error);
      return { data: null, error };
    }
  },

  // Récupérer les statistiques des livraisons
  async getStatistiques(): Promise<{ data: any | null; error: any }> {
    try {
      console.log('Récupération des statistiques de livraison...');
      
      const livraisonsResponse = await this.getLivraisons();
      if (livraisonsResponse.error) {
        return { data: null, error: livraisonsResponse.error };
      }
      
      const livraisons = livraisonsResponse.data || [];
      
      const stats = {
        total_livraisons: livraisons.length,
        en_attente: livraisons.filter(l => l.statut_livraison === 'en_attente').length,
        affectees: livraisons.filter(l => l.statut_livraison === 'affecte').length,
        en_cours: livraisons.filter(l => ['en_route_pickup', 'recupere', 'en_livraison'].includes(l.statut_livraison)).length,
        livrees: livraisons.filter(l => l.statut_livraison === 'livre').length,
        annulees: livraisons.filter(l => l.statut_livraison === 'annule').length,
        montant_total: livraisons.reduce((sum, l) => sum + (l.montant_livraison || 0), 0)
      };
      
      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { data: null, error };
    }
  }
};

export default DeliveryService;
