-- Création de la table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'stock', 'payment', 'delivery', 'system', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  link TEXT,
  metadata JSONB
);

-- Index pour accélérer les requêtes sur les notifications non lues
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Index pour accélérer les requêtes sur le type de notification
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Index pour accélérer les recherches par utilisateur
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Fonction pour créer une notification lors de changements de stock
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le stock passe sous un seuil critique (10 unités)
  IF NEW.stock <= 10 THEN
    INSERT INTO public.notifications (
      title,
      message,
      type,
      priority,
      link,
      metadata
    ) VALUES (
      CASE 
        WHEN NEW.stock = 0 THEN 'Rupture de stock'
        ELSE 'Stock faible'
      END,
      CASE 
        WHEN NEW.stock = 0 THEN 'Le produit "' || NEW.name || '" est en rupture de stock'
        ELSE 'Le produit "' || NEW.name || '" a un stock faible (' || NEW.stock || ' restants)'
      END,
      'stock',
      CASE 
        WHEN NEW.stock <= 3 THEN 'high'
        ELSE 'medium'
      END,
      '/admin/products',
      jsonb_build_object('productId', NEW.id, 'stock', NEW.stock)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour les notifications de stock faible
DROP TRIGGER IF EXISTS trigger_low_stock ON public.products;
CREATE TRIGGER trigger_low_stock
AFTER UPDATE OF stock ON public.products
FOR EACH ROW
EXECUTE FUNCTION notify_low_stock();

-- Fonction pour créer une notification lors de la création d'une commande
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    title,
    message,
    type,
    priority,
    link,
    metadata
  ) VALUES (
    'Nouvelle commande',
    'Une nouvelle commande #' || substring(NEW.id::text, 1, 8) || ' a été placée',
    'order',
    'high',
    '/admin/orders',
    jsonb_build_object('orderId', NEW.id, 'total', NEW.total)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour les notifications de nouvelles commandes
DROP TRIGGER IF EXISTS trigger_new_order ON public.orders;
CREATE TRIGGER trigger_new_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION notify_new_order();

-- Fonction pour créer une notification lors du changement de statut d'une commande
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne pas déclencher si c'est une insertion (déjà géré par trigger_new_order)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Si le statut a changé
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (
      title,
      message,
      type,
      priority,
      link,
      metadata
    ) VALUES (
      'Statut de commande mis à jour',
      'La commande #' || substring(NEW.id::text, 1, 8) || ' est maintenant "' || NEW.status || '"',
      'order',
      'medium',
      '/admin/orders',
      jsonb_build_object('orderId', NEW.id, 'status', NEW.status)
    );
  END IF;

  -- Si le statut de paiement a changé
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status 
     AND NEW.payment_status IN ('succeeded', 'failed') THEN
    INSERT INTO public.notifications (
      title,
      message,
      type,
      priority,
      link,
      metadata
    ) VALUES (
      CASE 
        WHEN NEW.payment_status = 'succeeded' THEN 'Paiement confirmé'
        ELSE 'Paiement refusé'
      END,
      CASE 
        WHEN NEW.payment_status = 'succeeded' THEN 'Le paiement pour la commande #' || substring(NEW.id::text, 1, 8) || ' a été confirmé'
        ELSE 'Le paiement pour la commande #' || substring(NEW.id::text, 1, 8) || ' a été refusé'
      END,
      'payment',
      CASE 
        WHEN NEW.payment_status = 'succeeded' THEN 'medium'
        ELSE 'high'
      END,
      '/admin/orders',
      jsonb_build_object('orderId', NEW.id, 'paymentStatus', NEW.payment_status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour les notifications de changement de statut des commandes
DROP TRIGGER IF EXISTS trigger_order_status_change ON public.orders;
CREATE TRIGGER trigger_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_status_change();

-- Sécurité RLS: Seuls les admins peuvent voir toutes les notifications, les utilisateurs ne voient que les leurs
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do anything with notifications"
  ON public.notifications
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can only see their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- API publique pour les notifications
GRANT SELECT, INSERT ON public.notifications TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.notifications_id_seq TO anon, authenticated;
