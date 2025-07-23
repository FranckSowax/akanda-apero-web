-- 🧪 Tables A/B Testing - Akanda Apéro
-- 
-- Schéma complet pour les tests A/B avec tracking et analytics

-- Table principale des tests A/B
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_audience JSONB NOT NULL DEFAULT '{"percentage": 100}',
    metrics JSONB NOT NULL DEFAULT '{"primary": "conversion_rate", "secondary": []}',
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table des variantes de test
CREATE TABLE IF NOT EXISTS ab_test_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant_id VARCHAR(100) NOT NULL, -- ID unique dans le contexte du test
    name VARCHAR(255) NOT NULL,
    weight DECIMAL(5,2) NOT NULL DEFAULT 50.00 CHECK (weight >= 0 AND weight <= 100),
    config JSONB NOT NULL DEFAULT '{}',
    is_control BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(test_id, variant_id)
);

-- Table des assignations utilisateurs
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Peut être un ID anonyme ou utilisateur connecté
    test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant_id VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    UNIQUE(user_id, test_id),
    FOREIGN KEY (test_id, variant_id) REFERENCES ab_test_variants(test_id, variant_id)
);

-- Table des conversions
CREATE TABLE IF NOT EXISTS ab_test_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant_id VARCHAR(100) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) DEFAULT 1.00,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    session_id VARCHAR(255),
    properties JSONB DEFAULT '{}',
    FOREIGN KEY (test_id, variant_id) REFERENCES ab_test_variants(test_id, variant_id)
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_dates ON ab_tests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test_id ON ab_test_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_lookup ON ab_test_variants(test_id, variant_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_lookup ON ab_test_assignments(user_id, test_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_user ON ab_test_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test ON ab_test_conversions(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_metric ON ab_test_conversions(test_id, metric);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_timestamp ON ab_test_conversions(timestamp);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ab_tests_updated_at 
    BEFORE UPDATE ON ab_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_conversions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ab_tests
CREATE POLICY "ab_tests_select_policy" ON ab_tests
    FOR SELECT USING (true); -- Lecture publique pour les tests actifs

CREATE POLICY "ab_tests_insert_policy" ON ab_tests
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- Seuls les utilisateurs connectés peuvent créer

CREATE POLICY "ab_tests_update_policy" ON ab_tests
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "ab_tests_delete_policy" ON ab_tests
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Politiques RLS pour ab_test_variants
CREATE POLICY "ab_test_variants_select_policy" ON ab_test_variants
    FOR SELECT USING (true);

CREATE POLICY "ab_test_variants_insert_policy" ON ab_test_variants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ab_tests 
            WHERE ab_tests.id = test_id 
            AND (ab_tests.created_by = auth.uid() OR auth.uid() IS NOT NULL)
        )
    );

CREATE POLICY "ab_test_variants_update_policy" ON ab_test_variants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM ab_tests 
            WHERE ab_tests.id = test_id 
            AND ab_tests.created_by = auth.uid()
        )
    );

CREATE POLICY "ab_test_variants_delete_policy" ON ab_test_variants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ab_tests 
            WHERE ab_tests.id = test_id 
            AND ab_tests.created_by = auth.uid()
        )
    );

-- Politiques RLS pour ab_test_assignments
CREATE POLICY "ab_test_assignments_select_policy" ON ab_test_assignments
    FOR SELECT USING (true); -- Lecture publique pour les stats

CREATE POLICY "ab_test_assignments_insert_policy" ON ab_test_assignments
    FOR INSERT WITH CHECK (true); -- Insertion publique pour l'assignation

CREATE POLICY "ab_test_assignments_update_policy" ON ab_test_assignments
    FOR UPDATE USING (false); -- Pas de modification des assignations

CREATE POLICY "ab_test_assignments_delete_policy" ON ab_test_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ab_tests 
            WHERE ab_tests.id = test_id 
            AND ab_tests.created_by = auth.uid()
        )
    );

-- Politiques RLS pour ab_test_conversions
CREATE POLICY "ab_test_conversions_select_policy" ON ab_test_conversions
    FOR SELECT USING (true); -- Lecture publique pour les stats

CREATE POLICY "ab_test_conversions_insert_policy" ON ab_test_conversions
    FOR INSERT WITH CHECK (true); -- Insertion publique pour le tracking

CREATE POLICY "ab_test_conversions_update_policy" ON ab_test_conversions
    FOR UPDATE USING (false); -- Pas de modification des conversions

CREATE POLICY "ab_test_conversions_delete_policy" ON ab_test_conversions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ab_tests 
            WHERE ab_tests.id = test_id 
            AND ab_tests.created_by = auth.uid()
        )
    );

-- Fonctions utilitaires pour les calculs statistiques

-- Fonction pour calculer le taux de conversion d'une variante
CREATE OR REPLACE FUNCTION get_variant_conversion_rate(
    p_test_id UUID,
    p_variant_id VARCHAR(100),
    p_metric VARCHAR(100) DEFAULT 'conversion_rate'
)
RETURNS DECIMAL AS $$
DECLARE
    participants_count INTEGER;
    conversions_count INTEGER;
    conversion_rate DECIMAL;
BEGIN
    -- Compter les participants
    SELECT COUNT(*) INTO participants_count
    FROM ab_test_assignments
    WHERE test_id = p_test_id AND variant_id = p_variant_id;
    
    -- Compter les conversions
    SELECT COUNT(*) INTO conversions_count
    FROM ab_test_conversions
    WHERE test_id = p_test_id AND variant_id = p_variant_id AND metric = p_metric;
    
    -- Calculer le taux
    IF participants_count > 0 THEN
        conversion_rate := (conversions_count::DECIMAL / participants_count::DECIMAL) * 100;
    ELSE
        conversion_rate := 0;
    END IF;
    
    RETURN ROUND(conversion_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les résultats complets d'un test
CREATE OR REPLACE FUNCTION get_test_results(p_test_id UUID)
RETURNS TABLE (
    variant_id VARCHAR(100),
    variant_name VARCHAR(255),
    participants INTEGER,
    conversions INTEGER,
    conversion_rate DECIMAL,
    is_control BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.variant_id,
        v.name as variant_name,
        COALESCE(a.participants, 0) as participants,
        COALESCE(c.conversions, 0) as conversions,
        get_variant_conversion_rate(p_test_id, v.variant_id) as conversion_rate,
        v.is_control
    FROM ab_test_variants v
    LEFT JOIN (
        SELECT variant_id, COUNT(*) as participants
        FROM ab_test_assignments
        WHERE test_id = p_test_id
        GROUP BY variant_id
    ) a ON v.variant_id = a.variant_id
    LEFT JOIN (
        SELECT variant_id, COUNT(*) as conversions
        FROM ab_test_conversions
        WHERE test_id = p_test_id
        GROUP BY variant_id
    ) c ON v.variant_id = c.variant_id
    WHERE v.test_id = p_test_id
    ORDER BY conversion_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciens tests terminés (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_ab_tests(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Supprimer les tests terminés depuis plus de X jours
    DELETE FROM ab_tests
    WHERE status = 'completed'
    AND end_date < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques rapides des tests actifs
CREATE OR REPLACE VIEW active_ab_tests_stats AS
SELECT 
    t.id,
    t.name,
    t.status,
    t.start_date,
    COUNT(DISTINCT a.user_id) as total_participants,
    COUNT(DISTINCT c.user_id) as total_conversions,
    CASE 
        WHEN COUNT(DISTINCT a.user_id) > 0 
        THEN ROUND((COUNT(DISTINCT c.user_id)::DECIMAL / COUNT(DISTINCT a.user_id)::DECIMAL) * 100, 2)
        ELSE 0 
    END as overall_conversion_rate
FROM ab_tests t
LEFT JOIN ab_test_assignments a ON t.id = a.test_id
LEFT JOIN ab_test_conversions c ON t.id = c.test_id
WHERE t.status IN ('running', 'paused')
GROUP BY t.id, t.name, t.status, t.start_date
ORDER BY t.start_date DESC;

-- Commentaires sur les tables
COMMENT ON TABLE ab_tests IS 'Tests A/B avec configuration et résultats';
COMMENT ON TABLE ab_test_variants IS 'Variantes des tests A/B avec configuration spécifique';
COMMENT ON TABLE ab_test_assignments IS 'Assignations des utilisateurs aux variantes';
COMMENT ON TABLE ab_test_conversions IS 'Conversions trackées pour chaque test';

COMMENT ON FUNCTION get_variant_conversion_rate IS 'Calcule le taux de conversion d''une variante';
COMMENT ON FUNCTION get_test_results IS 'Retourne les résultats complets d''un test';
COMMENT ON FUNCTION cleanup_old_ab_tests IS 'Nettoie les anciens tests terminés';

-- Données de test (optionnel - à supprimer en production)
/*
INSERT INTO ab_tests (name, description, status, target_audience, metrics) VALUES
('Test Bouton CTA', 'Test de la couleur du bouton principal', 'draft', '{"percentage": 50}', '{"primary": "click_rate", "secondary": ["conversion_rate"]}');

INSERT INTO ab_test_variants (test_id, variant_id, name, weight, config, is_control) VALUES
((SELECT id FROM ab_tests WHERE name = 'Test Bouton CTA'), 'control', 'Bouton Bleu (Contrôle)', 50, '{"button_color": "blue"}', true),
((SELECT id FROM ab_tests WHERE name = 'Test Bouton CTA'), 'variant_a', 'Bouton Rouge', 50, '{"button_color": "red"}', false);
*/
