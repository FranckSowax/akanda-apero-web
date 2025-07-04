-- =====================================================
-- CORRECTION DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- Akanda Apéro - Résolution des erreurs d'autorisation
-- =====================================================

-- Désactiver temporairement RLS pour configuration
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON product_options;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON product_options;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON product_options;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON product_options;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON order_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON order_items;

DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON customers;

-- =====================================================
-- POLITIQUES PERMISSIVES POUR LE DÉVELOPPEMENT
-- =====================================================

-- Supprimer les nouvelles politiques si elles existent déjà
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Allow all operations on product_options" ON product_options;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;

-- PRODUCTS - Accès complet pour tous
CREATE POLICY "Allow all operations on products" ON products
FOR ALL USING (true) WITH CHECK (true);

-- PRODUCT_OPTIONS - Accès complet pour tous
CREATE POLICY "Allow all operations on product_options" ON product_options
FOR ALL USING (true) WITH CHECK (true);

-- CATEGORIES - Accès complet pour tous
CREATE POLICY "Allow all operations on categories" ON categories
FOR ALL USING (true) WITH CHECK (true);

-- ORDERS - Accès complet pour tous
CREATE POLICY "Allow all operations on orders" ON orders
FOR ALL USING (true) WITH CHECK (true);

-- ORDER_ITEMS - Accès complet pour tous
CREATE POLICY "Allow all operations on order_items" ON order_items
FOR ALL USING (true) WITH CHECK (true);

-- CUSTOMERS - Accès complet pour tous
CREATE POLICY "Allow all operations on customers" ON customers
FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- RÉACTIVER RLS SUR TOUTES LES TABLES
-- =====================================================

-- Réactiver RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VÉRIFICATION DES POLITIQUES
-- =====================================================

-- Afficher toutes les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- =====================================================
-- POLITIQUES SUPABASE STORAGE (POUR UPLOAD D'IMAGES)
-- =====================================================

-- Politique pour permettre l'upload d'images dans le bucket 'images' (utilisé par l'app)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true) 
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload d'images dans le bucket 'products'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload d'images dans le bucket 'product-options'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-options', 'product-options', true) 
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques Storage si elles existent
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;

-- Créer des politiques permissives pour le Storage (développement)
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Allow public delete" ON storage.objects
  FOR DELETE USING (true);

CREATE POLICY "Allow public update" ON storage.objects
  FOR UPDATE USING (true);

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
ATTENTION : Ces politiques sont très permissives et destinées au développement.

Pour la PRODUCTION, vous devriez implémenter des politiques plus restrictives :

1. LECTURE (SELECT) : Accessible à tous
2. ÉCRITURE (INSERT/UPDATE/DELETE) : Seulement pour les utilisateurs authentifiés avec rôle admin

Exemple de politiques de production :

-- Lecture publique
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);

-- Écriture admin seulement
CREATE POLICY "Admin write access" ON products 
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  auth.jwt() ->> 'email' IN ('admin@akanda-apero.com')
) 
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR 
  auth.jwt() ->> 'email' IN ('admin@akanda-apero.com')
);

*/

-- Message de confirmation
SELECT 'Politiques RLS mises à jour avec succès ! Toutes les opérations CRUD sont maintenant autorisées.' as status;
