-- Eliminar constraint problemático de sub_bloque
-- Ejecutar en Supabase SQL Editor

-- Ver qué constraints existen en la tabla reservas
SELECT 
    conname as "Constraint Name",
    contype as "Type",
    pg_get_constraintdef(oid) as "Definition"
FROM pg_constraint 
WHERE conrelid = 'reservas'::regclass;

-- Eliminar el constraint problemático de sub_bloque
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_sub_bloque_check;

-- Verificar que se eliminó
SELECT 
    conname as "Constraint Name",
    contype as "Type",
    pg_get_constraintdef(oid) as "Definition"
FROM pg_constraint 
WHERE conrelid = 'reservas'::regclass
AND conname LIKE '%sub_bloque%';

-- Mensaje de confirmación
SELECT 'Constraint sub_bloque eliminado - Reservas listas para funcionar' as "Resultado";
