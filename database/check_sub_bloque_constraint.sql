-- Ver la definición exacta del constraint sub_bloque
SELECT 
    conname as "Constraint Name",
    pg_get_constraintdef(oid) as "Definition"
FROM pg_constraint 
WHERE conrelid = 'reservas'::regclass
AND conname LIKE '%sub_bloque%';

-- Ver los valores permitidos en sub_bloque
-- Si hay un ENUM o CHECK constraint, esto nos dirá qué valores acepta
