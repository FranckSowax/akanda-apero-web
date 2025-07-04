-- =====================================================
-- SCRIPT DE RÉINITIALISATION SUPABASE
-- ⚠️  ATTENTION : Ce script supprime TOUTES les données
-- =====================================================

-- ÉTAPE 1: Désactiver RLS temporairement pour éviter les erreurs
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer toutes les politiques RLS existantes
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ÉTAPE 3: Supprimer tous les triggers
DO $$ 
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND trigger_name NOT LIKE 'RI_%' -- Garder les triggers de contraintes
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 
                      trig.trigger_name, trig.event_object_table);
    END LOOP;
END $$;

-- ÉTAPE 4: Supprimer toutes les fonctions personnalisées
DO $$ 
DECLARE
    func RECORD;
BEGIN
    FOR func IN 
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_name NOT LIKE 'pg_%'
        AND routine_name NOT LIKE 'uuid_%'
    LOOP
        EXECUTE format('DROP %s IF EXISTS %I CASCADE', 
                      func.routine_type, func.routine_name);
    END LOOP;
END $$;

-- ÉTAPE 5: Supprimer toutes les séquences personnalisées
DO $$ 
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', seq.sequence_name);
    END LOOP;
END $$;

-- ÉTAPE 6: Supprimer toutes les tables dans l'ordre correct (contraintes)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cart_sessions CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS kit_ingredients CASCADE;
DROP TABLE IF EXISTS cocktail_kits CASCADE;
DROP TABLE IF EXISTS bundle_items CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS product_options CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ÉTAPE 7: Supprimer tous les types ENUM personnalisés
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS promotion_type CASCADE;

-- ÉTAPE 8: Supprimer tous les index personnalisés restants
DO $$ 
DECLARE
    idx RECORD;
BEGIN
    FOR idx IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', idx.indexname);
    END LOOP;
END $$;

-- ÉTAPE 9: Nettoyer les données auth si nécessaire (OPTIONNEL - DÉCOMMENTER SI BESOIN)
-- ⚠️  ATTENTION: Ceci supprime TOUS les utilisateurs authentifiés
-- DELETE FROM auth.users WHERE email NOT LIKE '%@supabase.io';

-- ÉTAPE 10: Réinitialiser les compteurs de séquences système si nécessaire
-- SELECT setval(pg_get_serial_sequence('auth.users', 'id'), 1, false);

-- ÉTAPE 11: Cache vidé automatiquement à la fin de la transaction
-- (DISCARD ALL ne peut pas s'exécuter dans un bloc de transaction)

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

-- Vérifier qu'il ne reste plus de tables personnalisées
DO $$ 
DECLARE
    table_count INTEGER;
    table_rec RECORD;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Tables restantes dans public: %', table_count;
    
    IF table_count > 0 THEN
        RAISE NOTICE 'Liste des tables restantes:';
        FOR table_rec IN 
            SELECT t.table_name 
            FROM information_schema.tables t
            WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
        LOOP
            RAISE NOTICE '- %', table_rec.table_name;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ Base de données complètement nettoyée!';
    END IF;
END $$;

-- Vérifier les types ENUM restants
DO $$ 
DECLARE
    enum_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enum_count
    FROM pg_type 
    WHERE typtype = 'e' 
    AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    RAISE NOTICE 'Types ENUM restants: %', enum_count;
    
    IF enum_count = 0 THEN
        RAISE NOTICE '✅ Tous les types ENUM ont été supprimés!';
    END IF;
END $$;

-- Vérifier les fonctions restantes
DO $$ 
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_name NOT LIKE 'pg_%'
    AND routine_name NOT LIKE 'uuid_%';
    
    RAISE NOTICE 'Fonctions personnalisées restantes: %', func_count;
    
    IF func_count = 0 THEN
        RAISE NOTICE '✅ Toutes les fonctions personnalisées ont été supprimées!';
    END IF;
END $$;

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

/*
🔥 COMMENT UTILISER CE SCRIPT :

1. **SAUVEGARDE** : Assurez-vous d'avoir une sauvegarde si nécessaire
2. **Supabase Dashboard** : Allez dans SQL Editor
3. **Exécuter** : Copiez-collez ce script et exécutez-le
4. **Vérifier** : Regardez les messages de confirmation
5. **Nouveau schéma** : Vous pouvez maintenant exécuter supabase_schema.sql

⚠️  AVERTISSEMENTS :
- Ce script supprime TOUTES les données
- Les utilisateurs auth.users sont préservés par défaut
- Irréversible sans sauvegarde
- Testez d'abord sur un environnement de développement

✅ APRÈS EXÉCUTION :
- Base complètement vide
- Prête pour le nouveau schéma
- Aucun conflit de noms
- Performance optimale
*/
