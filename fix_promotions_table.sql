-- Script de diagnostic et correction pour la table promotions
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'promotions'
);

-- 2. Si la table existe, vérifier sa structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'promotions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Supprimer la table si elle existe (pour la recréer proprement)
DROP TABLE IF EXISTS promotions CASCADE;

-- 4. Créer la table promotions avec le bon schéma
CREATE TABLE promotions (
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
    applicable_products TEXT[],
    applicable_categories TEXT[],
    is_stackable BOOLEAN DEFAULT false,
    is_first_order_only BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Créer les index
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_type ON promotions(type);

-- 6. Créer le trigger pour updated_at
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

-- 7. Configurer RLS (Row Level Security)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés (admin)
CREATE POLICY "Allow all operations for authenticated users" ON promotions
    FOR ALL USING (auth.role() = 'authenticated');

-- Politique pour permettre la lecture publique des promotions actives
CREATE POLICY "Allow public read for active promotions" ON promotions
    FOR SELECT USING (status = 'active' AND start_date <= NOW() AND end_date >= NOW());

-- 8. Insérer des données de test
INSERT INTO promotions (name, code, description, type, value, min_purchase, status, start_date, end_date, applicable_products, applicable_categories) VALUES
('Bienvenue Akanda', 'WELCOME20', 'Remise de bienvenue de 20% pour les nouveaux clients', 'percentage', 20.00, 15000, 'active', NOW(), NOW() + INTERVAL '3 months', '{}', '{}'),
('Happy Hour', 'HAPPY15', 'Réduction de 15% sur les cocktails pendant les heures creuses', 'percentage', 15.00, NULL, 'active', NOW(), NOW() + INTERVAL '2 months', '{}', '{"cocktails"}'),
('Livraison Gratuite', 'FREESHIP', 'Livraison gratuite pour les commandes de plus de 25000 FCFA', 'free_shipping', 0.00, 25000, 'active', NOW(), NOW() + INTERVAL '1 month', '{}', '{}'),
('Weekend Special', 'WEEKEND10', 'Réduction de 10% le weekend sur les spiritueux', 'percentage', 10.00, NULL, 'scheduled', NOW() + INTERVAL '1 week', NOW() + INTERVAL '3 months', '{}', '{"spiritueux", "vins"}'),
('Fête des Mères', 'MAMAN5000', 'Réduction fixe de 5000 FCFA pour la fête des mères', 'fixed_amount', 5000.00, 30000, 'scheduled', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '1 month', '{}', '{"vins", "champagnes"}')
ON CONFLICT (code) DO NOTHING;

-- 9. Vérifier que tout est bien créé
SELECT 'Table promotions créée avec succès!' as message;
SELECT COUNT(*) as nombre_promotions FROM promotions;

-- 10. Afficher la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'promotions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
