-- Script pour vérifier les valeurs enum existantes
-- Exécutez ce script pour voir quelles valeurs de statut sont autorisées

-- 1. Vérifier si l'enum order_status existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'order_status'
    ) THEN
        RAISE NOTICE '✅ Enum order_status existe';
    ELSE
        RAISE NOTICE '❌ Enum order_status n''existe pas';
    END IF;
END $$;

-- 2. Lister toutes les valeurs de l'enum order_status
SELECT 
    enumlabel as status_value,
    enumsortorder as sort_order
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'order_status'
)
ORDER BY enumsortorder;

-- 3. Vérifier le type de la colonne status dans orders
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'status'
AND table_schema = 'public';

-- 4. Afficher quelques exemples de statuts existants dans la table
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY count DESC
LIMIT 10;
