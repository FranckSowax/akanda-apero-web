import { supabase } from '../lib/supabase/client';

export class MigrationService {
  /**
   * Crée la table problemes si elle n'existe pas
   */
  static async createProblemeTable(): Promise<{ success: boolean; error?: any }> {
    try {
      // Vérifier si la table existe déjà
      const { data: tables, error: checkError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'problemes')
        .eq('table_schema', 'public');

      if (checkError) {
        console.error('Erreur lors de la vérification de la table:', checkError);
      }

      // Si la table existe déjà, ne pas la recréer
      if (tables && tables.length > 0) {
        console.log('La table problemes existe déjà');
        return { success: true };
      }

      // Créer la table via une requête SQL brute
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS problemes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID NOT NULL,
          order_number TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          customer_email TEXT,
          customer_phone TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          problem_type TEXT NOT NULL CHECK (problem_type IN ('livraison', 'produit', 'service', 'paiement', 'autre')),
          problem_description TEXT NOT NULL,
          urgency_level TEXT NOT NULL DEFAULT 'normale' CHECK (urgency_level IN ('faible', 'normale', 'haute', 'critique')),
          status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'resolu', 'ferme')),
          reported_by_customer BOOLEAN NOT NULL DEFAULT false,
          admin_notes TEXT,
          resolution_notes TEXT,
          assigned_to UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          resolved_at TIMESTAMP WITH TIME ZONE
        );

        -- Index pour améliorer les performances
        CREATE INDEX IF NOT EXISTS idx_problemes_order_id ON problemes(order_id);
        CREATE INDEX IF NOT EXISTS idx_problemes_status ON problemes(status);
        CREATE INDEX IF NOT EXISTS idx_problemes_urgency ON problemes(urgency_level);
        CREATE INDEX IF NOT EXISTS idx_problemes_created_at ON problemes(created_at);

        -- Trigger pour mettre à jour automatiquement updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER IF NOT EXISTS update_problemes_updated_at 
            BEFORE UPDATE ON problemes 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `;

      // Exécuter le SQL via rpc si disponible
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });

      if (error) {
        console.error('Erreur lors de la création de la table:', error);
        return { success: false, error };
      }

      console.log('Table problemes créée avec succès');
      return { success: true };

    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      return { success: false, error };
    }
  }

  /**
   * Test de création d'un problème pour vérifier que la table fonctionne
   */
  static async testProblemeTable(): Promise<{ success: boolean; error?: any }> {
    try {
      // Essayer de faire un SELECT simple sur la table
      const { data, error } = await supabase
        .from('problemes')
        .select('count(*)')
        .limit(1);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}
