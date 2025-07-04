-- Système de commandes (orders) pour Akanda Apero
-- Créé le 11 mai 2025

-- Vérifier si la table des produits existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table principale des commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  promo_code TEXT,
  order_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Confirmée', 'En préparation', 'En cours', 'Livrée', 'Annulée')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed')),
  payment_method TEXT,
  payment_intent_id TEXT,
  notes TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  delivery_time TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour générer automatiquement un numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Format: AP-YYYYMMDD-XXXX où XXXX est un nombre aléatoire entre 1000 et 9999
  NEW.order_number := 'AP-' || 
                      TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour générer automatiquement le numéro de commande
CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- Fonction pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour la mise à jour de la date de modification
CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Fonction pour calculer le total d'une commande
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  order_total DECIMAL(10, 2);
BEGIN
  -- Calculer le total à partir des articles de la commande
  SELECT COALESCE(SUM(total_price), 0) INTO order_total
  FROM public.order_items
  WHERE order_id = NEW.order_id;
  
  -- Mettre à jour le total et le sous-total de la commande
  UPDATE public.orders
  SET subtotal = order_total,
      total = order_total + COALESCE(shipping_fee, 0) + COALESCE(tax, 0) - COALESCE(discount, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour le calcul du total d'une commande après insertion d'un article
CREATE TRIGGER trigger_calculate_order_total_after_insert
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_total();

-- Déclencheur pour le calcul du total d'une commande après mise à jour d'un article
CREATE TRIGGER trigger_calculate_order_total_after_update
AFTER UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_total();

-- Déclencheur pour le calcul du total d'une commande après suppression d'un article
CREATE TRIGGER trigger_calculate_order_total_after_delete
AFTER DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_total();



-- Accorder les privilèges appropriés
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.order_items TO anon;


