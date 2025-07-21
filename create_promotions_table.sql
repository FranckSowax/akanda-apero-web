-- Script SQL pour créer la table promotions dans Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Création de la table promotions
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
    value DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_purchase DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled', 'expired')),
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_products TEXT[], -- Array de product IDs
    applicable_categories TEXT[], -- Array de category IDs
    is_stackable BOOLEAN DEFAULT false,
    is_first_order_only BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promotions_updated_at 
    BEFORE UPDATE ON promotions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security) pour l'admin
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés (admin)
CREATE POLICY "Allow all operations for authenticated users" ON promotions
    FOR ALL USING (auth.role() = 'authenticated');

-- Politique pour permettre la lecture publique des promotions actives (pour l'application)
CREATE POLICY "Allow public read for active promotions" ON promotions
    FOR SELECT USING (status = 'active' AND start_date <= NOW() AND end_date >= NOW());

-- Insertion de quelques promotions d'exemple
INSERT INTO promotions (name, code, description, type, value, min_purchase, status, start_date, end_date, applicable_products, applicable_categories) VALUES
('Bienvenue Akanda', 'WELCOME20', 'Remise de bienvenue de 20% pour les nouveaux clients', 'percentage', 20.00, 15000, 'active', NOW(), NOW() + INTERVAL '3 months', '{}', '{}'),
('Happy Hour', 'HAPPY15', 'Réduction de 15% sur les cocktails pendant les heures creuses', 'percentage', 15.00, NULL, 'active', NOW(), NOW() + INTERVAL '2 months', '{}', '{"cocktails"}'),
('Livraison Gratuite', 'FREESHIP', 'Livraison gratuite pour les commandes de plus de 25000 FCFA', 'free_shipping', 0.00, 25000, 'active', NOW(), NOW() + INTERVAL '1 month', '{}', '{}'),
('Weekend Special', 'WEEKEND10', 'Réduction de 10% le weekend sur les spiritueux', 'percentage', 10.00, NULL, 'scheduled', NOW() + INTERVAL '1 week', NOW() + INTERVAL '3 months', '{}', '{"spiritueux", "vins"}'),
('Fête des Mères', 'MAMAN5000', 'Réduction fixe de 5000 FCFA pour la fête des mères', 'fixed_amount', 5000.00, 30000, 'scheduled', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '1 month', '{}', '{"vins", "champagnes"}')
ON CONFLICT (code) DO NOTHING;

-- Commentaires pour documentation
COMMENT ON TABLE promotions IS 'Table des promotions et codes de réduction';
COMMENT ON COLUMN promotions.type IS 'Type de promotion: percentage, fixed_amount, free_shipping';
COMMENT ON COLUMN promotions.value IS 'Valeur de la promotion (pourcentage ou montant fixe)';
COMMENT ON COLUMN promotions.status IS 'Statut: active, inactive, scheduled, expired';
COMMENT ON COLUMN promotions.applicable_products IS 'Array des IDs de produits concernés (vide = tous)';
COMMENT ON COLUMN promotions.applicable_categories IS 'Array des IDs de catégories concernées (vide = toutes)';
