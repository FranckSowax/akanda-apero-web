-- Configuration d'un utilisateur admin pour Akanda Apéro
-- Créé le 12 mai 2025

-- Vérifier que la table user_roles existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    CREATE TABLE public.user_roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, role)
    );
  END IF;
END
$$;

-- Créer un utilisateur admin
-- Pour tous les utilisateurs existants dans le système, leur donner le rôle admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- IMPORTANT : Vérifier que vous avez bien un utilisateur admin
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'ATTENTION : Aucun utilisateur admin n''existe dans le système. Vous devez créer au moins un utilisateur dans Supabase Authentication avant d''exécuter ce script.';
  ELSE
    RAISE NOTICE 'OK : % utilisateur(s) admin configuré(s) avec succès', admin_count;
  END IF;
END
$$;
