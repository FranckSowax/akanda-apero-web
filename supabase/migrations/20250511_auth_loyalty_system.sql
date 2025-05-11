-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer une politique RLS pour les profils
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre aux utilisateurs de lire et modifier uniquement leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table des points de fidélité
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(50) NOT NULL DEFAULT 'Citron',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer une politique RLS pour les points de fidélité
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre aux utilisateurs de voir uniquement leurs propres points
CREATE POLICY "Les utilisateurs peuvent voir leurs propres points" ON loyalty_points
  FOR SELECT USING (auth.uid() = user_id);

-- Seul le service (fonctions) peut mettre à jour les points de fidélité
CREATE POLICY "Service peut insérer des points" ON loyalty_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service peut mettre à jour des points" ON loyalty_points
  FOR UPDATE USING (auth.uid() = user_id);

-- Table historique des transactions de points
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer une politique RLS pour les transactions de points
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre aux utilisateurs de voir uniquement leurs propres transactions
CREATE POLICY "Les utilisateurs peuvent voir leurs propres transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Seul le service peut insérer des transactions
CREATE POLICY "Service peut insérer des transactions" ON loyalty_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at
BEFORE UPDATE ON loyalty_points
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
