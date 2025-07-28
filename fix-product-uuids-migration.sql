-- Migration pour corriger et forcer des UUIDs valides pour tous les produits
-- Cette migration résout définitivement le problème des IDs invalides

-- 1. Activer l'extension uuid-ossp si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Vérifier les produits avec des IDs potentiellement problématiques
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Compter les produits avec des IDs NULL ou invalides
    SELECT COUNT(*) INTO invalid_count
    FROM products 
    WHERE id IS NULL;
    
    RAISE NOTICE 'Produits avec ID NULL: %', invalid_count;
    
    -- Si des produits ont des IDs NULL, les corriger
    IF invalid_count > 0 THEN
        RAISE NOTICE 'Correction des produits avec ID NULL...';
        
        UPDATE products 
        SET id = uuid_generate_v4()
        WHERE id IS NULL;
        
        RAISE NOTICE 'Correction terminée: % produits corrigés', invalid_count;
    END IF;
END $$;

-- 3. Créer une fonction pour générer automatiquement des UUIDs
CREATE OR REPLACE FUNCTION generate_product_uuid()
RETURNS TRIGGER AS $$
BEGIN
    -- Si l'ID est NULL lors de l'insertion, générer un UUID
    IF NEW.id IS NULL THEN
        NEW.id = uuid_generate_v4();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer un trigger pour auto-générer les UUIDs
DROP TRIGGER IF EXISTS products_uuid_trigger ON products;
CREATE TRIGGER products_uuid_trigger
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION generate_product_uuid();

-- 5. Ajouter une contrainte pour s'assurer que l'ID n'est jamais NULL
ALTER TABLE products 
ALTER COLUMN id SET NOT NULL;

-- 6. Ajouter un commentaire pour documenter
COMMENT ON TRIGGER products_uuid_trigger ON products IS 
'Auto-génère un UUID valide pour chaque nouveau produit si l''ID est NULL';

-- 7. Vérification finale
DO $$
DECLARE
    total_products INTEGER;
    valid_uuids INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM products;
    
    SELECT COUNT(*) INTO valid_uuids 
    FROM products 
    WHERE id IS NOT NULL 
    AND char_length(id::text) = 36;
    
    RAISE NOTICE 'Vérification finale:';
    RAISE NOTICE 'Total produits: %', total_products;
    RAISE NOTICE 'UUIDs valides: %', valid_uuids;
    
    IF total_products = valid_uuids THEN
        RAISE NOTICE '✅ Tous les produits ont des UUIDs valides!';
    ELSE
        RAISE WARNING '⚠️ Certains produits ont encore des IDs invalides';
    END IF;
END $$;

-- 8. Créer une vue pour les produits valides (optionnel)
CREATE OR REPLACE VIEW valid_products AS
SELECT * FROM products 
WHERE id IS NOT NULL 
AND name IS NOT NULL 
AND name != ''
AND is_active = true;

COMMENT ON VIEW valid_products IS 
'Vue des produits avec des données valides et complètes';

-- 9. Fonction utilitaire pour valider un produit
CREATE OR REPLACE FUNCTION is_valid_product(product_row products)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        product_row.id IS NOT NULL 
        AND product_row.name IS NOT NULL 
        AND product_row.name != ''
        AND product_row.is_active = true
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_valid_product(products) IS 
'Fonction pour valider qu''un produit a toutes les données requises';
