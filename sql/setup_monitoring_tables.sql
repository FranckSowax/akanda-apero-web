-- 📊 Setup Monitoring Tables - Akanda Apéro
-- 
-- Ce script crée toutes les tables nécessaires pour le système de monitoring
-- et analytics avancé de l'application Akanda Apéro

-- ========================================
-- 📈 TABLE: analytics_performance
-- ========================================
CREATE TABLE IF NOT EXISTS analytics_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,2) NOT NULL,
    url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_analytics_performance_metric_name ON analytics_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_timestamp ON analytics_performance(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_user_id ON analytics_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_url ON analytics_performance USING HASH(url);

-- ========================================
-- 👤 TABLE: analytics_events
-- ========================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- ========================================
-- 💼 TABLE: analytics_business
-- ========================================
CREATE TABLE IF NOT EXISTS analytics_business (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'sales', 'user', 'product', 'order'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_analytics_business_metric_name ON analytics_business(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_business_category ON analytics_business(category);
CREATE INDEX IF NOT EXISTS idx_analytics_business_timestamp ON analytics_business(timestamp);

-- ========================================
-- 🚨 TABLE: error_logs
-- ========================================
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    stack TEXT,
    url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    fingerprint VARCHAR(100) NOT NULL, -- Pour la déduplication
    user_agent TEXT,
    ip_address INET,
    referer TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_occurrence TIMESTAMPTZ DEFAULT NOW(),
    last_user_agent TEXT,
    last_url TEXT,
    occurrence_count INTEGER DEFAULT 1,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_error_logs_fingerprint ON error_logs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_last_occurrence ON error_logs(last_occurrence);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);

-- ========================================
-- 🔔 TABLE: error_alerts
-- ========================================
CREATE TABLE IF NOT EXISTS error_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_fingerprint VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved'
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_error_alerts_status ON error_alerts(status);
CREATE INDEX IF NOT EXISTS idx_error_alerts_severity ON error_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_error_alerts_timestamp ON error_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_alerts_fingerprint ON error_alerts(error_fingerprint);

-- ========================================
-- 📊 TABLE: monitoring_dashboard_cache
-- ========================================
CREATE TABLE IF NOT EXISTS monitoring_dashboard_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(200) NOT NULL UNIQUE,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes de cache
CREATE INDEX IF NOT EXISTS idx_monitoring_cache_key ON monitoring_dashboard_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_monitoring_cache_expires ON monitoring_dashboard_cache(expires_at);

-- ========================================
-- 🔧 FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour nettoyer les anciennes données (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void AS $$
BEGIN
    -- Supprimer les métriques de performance de plus de 90 jours
    DELETE FROM analytics_performance 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    -- Supprimer les événements utilisateur de plus de 180 jours
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - INTERVAL '180 days';
    
    -- Supprimer les erreurs résolues de plus de 30 jours
    DELETE FROM error_logs 
    WHERE resolved = TRUE AND resolved_at < NOW() - INTERVAL '30 days';
    
    -- Supprimer les alertes résolues de plus de 30 jours
    DELETE FROM error_alerts 
    WHERE status = 'resolved' AND resolved_at < NOW() - INTERVAL '30 days';
    
    -- Nettoyer le cache expiré
    DELETE FROM monitoring_dashboard_cache 
    WHERE expires_at < NOW();
    
    RAISE NOTICE 'Nettoyage des données de monitoring terminé';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les métriques agrégées
CREATE OR REPLACE FUNCTION get_performance_summary(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    metric_name VARCHAR(100),
    avg_value DECIMAL(12,2),
    min_value DECIMAL(12,2),
    max_value DECIMAL(12,2),
    count_values BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.metric_name,
        ROUND(AVG(ap.metric_value), 2) as avg_value,
        MIN(ap.metric_value) as min_value,
        MAX(ap.metric_value) as max_value,
        COUNT(*) as count_values
    FROM analytics_performance ap
    WHERE ap.timestamp BETWEEN start_date AND end_date
    GROUP BY ap.metric_name
    ORDER BY count_values DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 🔒 POLITIQUES DE SÉCURITÉ (RLS)
-- ========================================

-- Activer RLS sur toutes les tables de monitoring
ALTER TABLE analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Politique pour analytics_performance
CREATE POLICY "Les utilisateurs peuvent voir leurs propres métriques de performance"
    ON analytics_performance FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Insertion libre pour les métriques de performance"
    ON analytics_performance FOR INSERT
    WITH CHECK (true);

-- Politique pour analytics_events
CREATE POLICY "Les utilisateurs peuvent voir leurs propres événements"
    ON analytics_events FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Insertion libre pour les événements"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

-- Politique pour analytics_business
CREATE POLICY "Insertion libre pour les métriques business"
    ON analytics_business FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Lecture libre pour les métriques business"
    ON analytics_business FOR SELECT
    USING (true);

-- Politique pour error_logs
CREATE POLICY "Les utilisateurs peuvent voir leurs propres erreurs"
    ON error_logs FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Insertion libre pour les erreurs"
    ON error_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Mise à jour libre pour les erreurs"
    ON error_logs FOR UPDATE
    USING (true);

-- Politique pour error_alerts
CREATE POLICY "Insertion libre pour les alertes d'erreur"
    ON error_alerts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Lecture libre pour les alertes d'erreur"
    ON error_alerts FOR SELECT
    USING (true);

CREATE POLICY "Mise à jour libre pour les alertes d'erreur"
    ON error_alerts FOR UPDATE
    USING (true);

-- Politique pour monitoring_dashboard_cache
CREATE POLICY "Accès libre au cache du dashboard"
    ON monitoring_dashboard_cache FOR ALL
    USING (true);

-- ========================================
-- 📝 COMMENTAIRES ET DOCUMENTATION
-- ========================================

COMMENT ON TABLE analytics_performance IS 'Métriques de performance de l''application (temps de chargement, Web Vitals, etc.)';
COMMENT ON TABLE analytics_events IS 'Événements utilisateur trackés (clics, navigation, actions)';
COMMENT ON TABLE analytics_business IS 'Métriques business (ventes, revenus, conversions)';
COMMENT ON TABLE error_logs IS 'Logs d''erreurs avec déduplication et comptage d''occurrences';
COMMENT ON TABLE error_alerts IS 'Alertes pour les erreurs critiques nécessitant une attention immédiate';
COMMENT ON TABLE monitoring_dashboard_cache IS 'Cache pour les données du dashboard de monitoring';

-- ========================================
-- ✅ VÉRIFICATION DE L'INSTALLATION
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tables de monitoring créées avec succès !';
    RAISE NOTICE '📊 analytics_performance: Métriques de performance';
    RAISE NOTICE '👤 analytics_events: Événements utilisateur';
    RAISE NOTICE '💼 analytics_business: Métriques business';
    RAISE NOTICE '🚨 error_logs: Logs d''erreurs';
    RAISE NOTICE '🔔 error_alerts: Alertes d''erreurs';
    RAISE NOTICE '💾 monitoring_dashboard_cache: Cache dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Fonctions utilitaires disponibles:';
    RAISE NOTICE '   - cleanup_old_monitoring_data(): Nettoie les anciennes données';
    RAISE NOTICE '   - get_performance_summary(): Résumé des métriques de performance';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Politiques RLS activées pour la sécurité';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Système de monitoring prêt à l''utilisation !';
END $$;
