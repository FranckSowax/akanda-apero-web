-- Migration pour ajouter les associations produit-catégorie manquantes
-- À exécuter depuis le SQL Editor de Supabase avec des droits d'administrateur

-- Désactiver temporairement les politiques RLS pour cette opération
BEGIN;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;

-- BIERE : ID 517502b3-a953-4895-b3bf-a561cb25279b

-- Associer Heineken à la catégorie Bières
INSERT INTO product_categories (product_id, category_id) 
VALUES ('32fdf162-abc7-4756-b218-7de4bbd833b7', '517502b3-a953-4895-b3bf-a561cb25279b')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Associer Desperados à la catégorie Bières
INSERT INTO product_categories (product_id, category_id) 
VALUES ('3d63d47e-cf0b-47b6-99d9-c9d9d618d9e7', '517502b3-a953-4895-b3bf-a561cb25279b')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- ALCOOLS : ID 490e73ca-be67-481b-8301-d1597a9d80d8

-- Ajouter Jack Daniel's à la catégorie Alcools
INSERT INTO product_categories (product_id, category_id) 
VALUES ('8152337d-8196-4f76-823a-a723b28cb7a8', '490e73ca-be67-481b-8301-d1597a9d80d8')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Ajouter Vodka Absolut à la catégorie Alcools
INSERT INTO product_categories (product_id, category_id) 
VALUES ('dfcc0704-373e-4cbd-9933-d73f911c343e', '490e73ca-be67-481b-8301-d1597a9d80d8')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- MEILLEURES VENTES (BESTSELLER) : ID ba41a37b-b3f6-4213-bf2f-6867f82be889
-- Associer les produits populaires à la catégorie Meilleures Ventes

INSERT INTO product_categories (product_id, category_id) 
VALUES ('add394d6-b1a1-4bd3-baf5-7656f1abf00b', 'ba41a37b-b3f6-4213-bf2f-6867f82be889')
ON CONFLICT (product_id, category_id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id) 
VALUES ('32fdf162-abc7-4756-b218-7de4bbd833b7', 'ba41a37b-b3f6-4213-bf2f-6867f82be889')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- LIQUEURS : ID 38d7592d-c8e9-4acb-b0c4-183f2345a135
-- Ajouter Jack Daniel's aussi à la catégorie Liqueurs (catégorie secondaire)
INSERT INTO product_categories (product_id, category_id) 
VALUES ('8152337d-8196-4f76-823a-a723b28cb7a8', '38d7592d-c8e9-4acb-b0c4-183f2345a135')
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Réactiver les politiques RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
COMMIT;
