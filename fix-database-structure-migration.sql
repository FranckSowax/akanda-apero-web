-- Migration pour corriger la structure de la base de données
-- Résout les erreurs de colonnes manquantes dans order_items et deliveries

-- 1. Vérifier et corriger la table order_items
DO $$
BEGIN
    -- Ajouter la colonne total_price si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'total_price'
    ) THEN
        ALTER TABLE order_items ADD COLUMN total_price DECIMAL(10,2);
        RAISE NOTICE 'Colonne total_price ajoutée à order_items';
        
        -- Calculer total_price pour les enregistrements existants
        UPDATE order_items 
        SET total_price = quantity * unit_price 
        WHERE total_price IS NULL;
        
        RAISE NOTICE 'Valeurs total_price calculées pour les enregistrements existants';
    ELSE
        RAISE NOTICE 'Colonne total_price existe déjà dans order_items';
    END IF;
END $$;

-- 2. Créer ou vérifier la table deliveries
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    delivery_person_id UUID,
    status VARCHAR(50) DEFAULT 'En préparation',
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 4. Créer un trigger pour mettre à jour total_price automatiquement
CREATE OR REPLACE FUNCTION update_order_item_total_price()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_price = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_order_item_total_price ON order_items;
CREATE TRIGGER trigger_update_order_item_total_price
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_item_total_price();

-- 5. Créer un trigger pour updated_at sur deliveries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deliveries_updated_at ON deliveries;
CREATE TRIGGER trigger_update_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Insérer des données de test pour deliveries si la table est vide
DO $$
DECLARE
    delivery_count INTEGER;
    sample_order_id UUID;
BEGIN
    SELECT COUNT(*) INTO delivery_count FROM deliveries;
    
    IF delivery_count = 0 THEN
        -- Prendre un ordre existant pour créer une livraison de test
        SELECT id INTO sample_order_id FROM orders LIMIT 1;
        
        IF sample_order_id IS NOT NULL THEN
            INSERT INTO deliveries (
                order_id, 
                status, 
                estimated_delivery_time,
                delivery_address,
                delivery_phone,
                delivery_notes
            ) VALUES (
                sample_order_id,
                'En préparation',
                NOW() + INTERVAL '45 minutes',
                'Adresse de test, Libreville',
                '+24177123456',
                'Livraison de test créée par migration'
            );
            
            RAISE NOTICE 'Livraison de test créée pour l''ordre: %', sample_order_id;
        END IF;
    END IF;
END $$;

-- 7. Vérifications finales
DO $$
DECLARE
    order_items_count INTEGER;
    deliveries_count INTEGER;
    missing_total_price INTEGER;
BEGIN
    SELECT COUNT(*) INTO order_items_count FROM order_items;
    SELECT COUNT(*) INTO deliveries_count FROM deliveries;
    SELECT COUNT(*) INTO missing_total_price FROM order_items WHERE total_price IS NULL;
    
    RAISE NOTICE 'Vérification finale:';
    RAISE NOTICE 'Order items: %', order_items_count;
    RAISE NOTICE 'Deliveries: %', deliveries_count;
    RAISE NOTICE 'Order items sans total_price: %', missing_total_price;
    
    IF missing_total_price = 0 THEN
        RAISE NOTICE '✅ Tous les order_items ont un total_price valide';
    ELSE
        RAISE WARNING '⚠️ % order_items n''ont pas de total_price', missing_total_price;
    END IF;
END $$;

-- 8. Commentaires pour documentation
COMMENT ON TABLE deliveries IS 'Table des livraisons avec statuts et informations de livraison';
COMMENT ON COLUMN order_items.total_price IS 'Prix total calculé automatiquement (quantity × unit_price)';
COMMENT ON TRIGGER trigger_update_order_item_total_price ON order_items IS 'Calcule automatiquement total_price lors des INSERT/UPDATE';
