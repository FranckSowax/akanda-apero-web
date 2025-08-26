// Utilisation du serveur MCP Supabase pour les opérations sur les problèmes
const mcpClient = {
  async readResource(name: string) {
    // Simulation d'appel MCP - à remplacer par l'implémentation réelle
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read', resource: name })
    });
    return response.json();
  },
  
  async createResource(name: string, body: any) {
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', resource: name, body })
    });
    return response.json();
  },
  
  async updateResource(name: string, params: any, body: any) {
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', resource: name, params, body })
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
  },
  
  async executeSQL(query: string) {
    const response = await fetch('/api/mcp/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'execute', resource: 'sql', body: { query } })
    });
    return response.json();
  }
};

export interface Problem {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  problem_type: 'livraison' | 'produit' | 'service' | 'paiement' | 'autre';
  problem_description: string;
  urgency_level: 'faible' | 'normale' | 'haute' | 'critique';
  status: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  reported_by_customer: boolean;
  admin_notes?: string;
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CreateProblemData {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  problem_type: 'livraison' | 'produit' | 'service' | 'paiement' | 'autre';
  problem_description: string;
  urgency_level: 'faible' | 'normale' | 'haute' | 'critique';
  reported_by_customer: boolean;
  admin_notes?: string;
}

export interface UpdateProblemData {
  status?: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  admin_notes?: string;
  resolution_notes?: string;
  assigned_to?: string;
  urgency_level?: 'faible' | 'normale' | 'haute' | 'critique';
}

export class ProblemsService {
  /**
   * Récupère tous les problèmes avec filtres optionnels
   */
  static async getProblems(filters?: {
    status?: string;
    urgency_level?: string;
    problem_type?: string;
    order_id?: string;
  }): Promise<{ data: Problem[] | null; error: any }> {
    try {
      const response = await mcpClient.readResource('problemes');
      if (!response.success) {
        return { data: null, error: response.message };
      }
      
      let problems = response.data || [];

      // Appliquer les filtres côté client
      if (filters?.status && filters.status !== 'all') {
        problems = problems.filter((p: Problem) => p.status === filters.status);
      }
      if (filters?.urgency_level && filters.urgency_level !== 'all') {
        problems = problems.filter((p: Problem) => p.urgency_level === filters.urgency_level);
      }
      if (filters?.problem_type && filters.problem_type !== 'all') {
        problems = problems.filter((p: Problem) => p.problem_type === filters.problem_type);
      }
      if (filters?.order_id) {
        problems = problems.filter((p: Problem) => p.order_id === filters.order_id);
      }

      return { data: problems, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des problèmes:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupère un problème par son ID
   */
  static async getProblemById(id: string): Promise<{ data: Problem | null; error: any }> {
    try {
      const response = await mcpClient.readResource('problemes');
      if (!response.success) {
        return { data: null, error: response.message };
      }
      
      const problem = response.data?.find((p: Problem) => p.id === id) || null;
      return { data: problem, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du problème:', error);
      return { data: null, error };
    }
  }

  /**
   * Crée un nouveau problème
   */
  static async createProblem(problemData: CreateProblemData): Promise<{ data: Problem | null; error: any }> {
    try {
      const response = await mcpClient.createResource('problemes', {
        ...problemData,
        status: 'nouveau'
      });
      
      if (!response.success) {
        return { data: null, error: response.message };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la création du problème:', error);
      return { data: null, error };
    }
  }

  /**
   * Met à jour un problème
   */
  static async updateProblem(id: string, updates: UpdateProblemData): Promise<{ data: Problem | null; error: any }> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Si le statut passe à résolu ou fermé, marquer la date de résolution
      if (updates.status === 'resolu' || updates.status === 'ferme') {
        updateData.resolved_at = new Date().toISOString();
      }

      const response = await mcpClient.updateResource('problemes', { id }, updateData);
      
      if (!response.success) {
        return { data: null, error: response.message };
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du problème:', error);
      return { data: null, error };
    }
  }

  /**
   * Supprime un problème
   */
  static async deleteProblem(id: string): Promise<{ error: any }> {
    try {
      const response = await mcpClient.deleteResource('problemes', { id });
      
      if (!response.success) {
        return { error: response.message };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du problème:', error);
      return { error };
    }
  }

  /**
   * Récupère les statistiques des problèmes
   */
  static async getProblemsStats(): Promise<{
    data: {
      total: number;
      nouveau: number;
      en_cours: number;
      resolu: number;
      ferme: number;
      by_type: Record<string, number>;
      by_urgency: Record<string, number>;
    } | null;
    error: any;
  }> {
    try {
      const response = await mcpClient.readResource('problemes');
      
      if (!response.success) {
        return { data: null, error: response.message };
      }
      
      const problems = response.data || [];

      const stats = {
        total: problems.length,
        nouveau: problems.filter((p: Problem) => p.status === 'nouveau').length,
        en_cours: problems.filter((p: Problem) => p.status === 'en_cours').length,
        resolu: problems.filter((p: Problem) => p.status === 'resolu').length,
        ferme: problems.filter((p: Problem) => p.status === 'ferme').length,
        by_type: {} as Record<string, number>,
        by_urgency: {} as Record<string, number>
      };

      // Compter par type
      problems.forEach((problem: Problem) => {
        stats.by_type[problem.problem_type] = (stats.by_type[problem.problem_type] || 0) + 1;
      });

      // Compter par urgence
      problems.forEach((problem: Problem) => {
        stats.by_urgency[problem.urgency_level] = (stats.by_urgency[problem.urgency_level] || 0) + 1;
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupère les problèmes récents (dernières 24h)
   */
  static async getRecentProblems(): Promise<{ data: Problem[] | null; error: any }> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await mcpClient.readResource('problemes');
      
      if (!response.success) {
        return { data: null, error: response.message };
      }
      
      const recentProblems = (response.data || []).filter((p: Problem) => 
        new Date(p.created_at) >= yesterday
      ).sort((a: Problem, b: Problem) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return { data: recentProblems, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des problèmes récents:', error);
      return { data: null, error };
    }
  }

  /**
   * Marque un problème comme assigné à un utilisateur
   */
  static async assignProblem(problemId: string, userId: string): Promise<{ data: Problem | null; error: any }> {
    return this.updateProblem(problemId, {
      assigned_to: userId,
      status: 'en_cours'
    });
  }

  /**
   * Résout un problème avec des notes de résolution
   */
  static async resolveProblem(problemId: string, resolutionNotes: string): Promise<{ data: Problem | null; error: any }> {
    return this.updateProblem(problemId, {
      status: 'resolu',
      resolution_notes: resolutionNotes
    });
  }
}
