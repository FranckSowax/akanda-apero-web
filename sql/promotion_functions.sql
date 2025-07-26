-- Fonctions SQL supplémentaires pour le système de promotions
-- À exécuter après setup_promotions_table.sql

-- Fonction pour incrémenter l'utilisation d'un code promo
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE promotions 
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les promotions actives
CREATE OR REPLACE FUNCTION get_active_promotions()
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  image_url TEXT,
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_featured BOOLEAN,
  promo_code VARCHAR(50),
  max_uses INTEGER,
  current_uses INTEGER,
  min_order_amount DECIMAL(10,2),
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.discount_percentage,
    p.discount_amount,
    p.image_url,
    p.background_color,
    p.text_color,
    p.start_date,
    p.end_date,
    p.is_featured,
    p.promo_code,
    p.max_uses,
    p.current_uses,
    p.min_order_amount,
    p.sort_order
  FROM promotions p
  WHERE p.is_active = true
    AND p.start_date <= NOW()
    AND p.end_date >= NOW()
  ORDER BY p.sort_order ASC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour valider un code promo
CREATE OR REPLACE FUNCTION validate_promo_code(
  code VARCHAR(50),
  order_amount DECIMAL(10,2) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  min_order_amount DECIMAL(10,2),
  max_uses INTEGER,
  current_uses INTEGER,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  promo_record RECORD;
BEGIN
  -- Rechercher la promotion
  SELECT * INTO promo_record
  FROM promotions p
  WHERE p.promo_code = code
    AND p.is_active = true
    AND p.start_date <= NOW()
    AND p.end_date >= NOW();

  -- Si aucune promotion trouvée
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::VARCHAR(255), NULL::INTEGER, NULL::DECIMAL(10,2),
      NULL::DECIMAL(10,2), NULL::INTEGER, NULL::INTEGER,
      false, 'Code promo invalide ou expiré'::TEXT;
    RETURN;
  END IF;

  -- Vérifier les limites d'utilisation
  IF promo_record.max_uses IS NOT NULL AND promo_record.current_uses >= promo_record.max_uses THEN
    RETURN QUERY SELECT 
      promo_record.id, promo_record.title, promo_record.discount_percentage, 
      promo_record.discount_amount, promo_record.min_order_amount,
      promo_record.max_uses, promo_record.current_uses,
      false, 'Limite d''utilisation atteinte'::TEXT;
    RETURN;
  END IF;

  -- Vérifier le montant minimum
  IF promo_record.min_order_amount IS NOT NULL AND 
     order_amount IS NOT NULL AND 
     order_amount < promo_record.min_order_amount THEN
    RETURN QUERY SELECT 
      promo_record.id, promo_record.title, promo_record.discount_percentage, 
      promo_record.discount_amount, promo_record.min_order_amount,
      promo_record.max_uses, promo_record.current_uses,
      false, ('Montant minimum requis: ' || promo_record.min_order_amount || '€')::TEXT;
    RETURN;
  END IF;

  -- Code promo valide
  RETURN QUERY SELECT 
    promo_record.id, promo_record.title, promo_record.discount_percentage, 
    promo_record.discount_amount, promo_record.min_order_amount,
    promo_record.max_uses, promo_record.current_uses,
    true, 'Code promo valide'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour les statistiques des promotions
CREATE OR REPLACE VIEW promotion_stats AS
SELECT 
  COUNT(*) as total_promotions,
  COUNT(*) FILTER (WHERE is_active = true AND start_date <= NOW() AND end_date >= NOW()) as active_promotions,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_promotions,
  COUNT(*) FILTER (WHERE end_date < NOW()) as expired_promotions,
  COALESCE(SUM(current_uses), 0) as total_uses,
  ROUND(
    CASE 
      WHEN COUNT(*) FILTER (WHERE max_uses IS NOT NULL) > 0 
      THEN (COALESCE(SUM(current_uses), 0)::DECIMAL / NULLIF(SUM(max_uses) FILTER (WHERE max_uses IS NOT NULL), 0)) * 100
      ELSE 0 
    END, 2
  ) as usage_rate
FROM promotions;

-- Trigger pour nettoyer automatiquement les promotions expirées (optionnel)
CREATE OR REPLACE FUNCTION cleanup_expired_promotions()
RETURNS void AS $$
BEGIN
  -- Désactiver les promotions expirées depuis plus de 30 jours
  UPDATE promotions 
  SET is_active = false, 
      updated_at = NOW()
  WHERE end_date < (NOW() - INTERVAL '30 days')
    AND is_active = true;
    
  -- Log du nettoyage
  RAISE NOTICE 'Nettoyage des promotions expirées effectué à %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Créer un job cron pour le nettoyage automatique (si pg_cron est disponible)
-- SELECT cron.schedule('cleanup-expired-promotions', '0 2 * * *', 'SELECT cleanup_expired_promotions();');

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION increment_promo_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_promotions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR(50), DECIMAL(10,2)) TO anon, authenticated;
GRANT SELECT ON promotion_stats TO authenticated;
