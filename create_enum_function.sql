-- Fonction pour récupérer les types ENUM depuis l'API
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_enum_types()
RETURNS TABLE (
    type_name TEXT,
    enum_values TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.typname::TEXT as type_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder)::TEXT[] as enum_values
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname IN ('order_status', 'payment_status', 'delivery_status')
    GROUP BY t.typname
    ORDER BY t.typname;
END;
$$;

-- Test de la fonction
SELECT * FROM get_enum_types();
