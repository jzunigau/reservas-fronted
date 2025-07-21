-- ====================================================
-- SCRIPT PARA CORREGIR EL CONSTRAINT DE TIPO_BLOQUE
-- ====================================================

-- 1. ELIMINAR EL CONSTRAINT ACTUAL
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_tipo_bloque_check;

-- 2. CREAR NUEVO CONSTRAINT CON LOS VALORES CORRECTOS
ALTER TABLE reservas ADD CONSTRAINT reservas_tipo_bloque_check 
CHECK (tipo_bloque IN ('completo', '1hora', '2hora', 'parcial'));

-- 3. VERIFICAR QUE EL CONSTRAINT SE APLICÓ CORRECTAMENTE
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'reservas'::regclass 
AND conname = 'reservas_tipo_bloque_check';

-- 4. TAMBIÉN ARREGLAMOS EL SUB_BLOQUE PARA QUE SEA MÁS FLEXIBLE
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_sub_bloque_check;
ALTER TABLE reservas ADD CONSTRAINT reservas_sub_bloque_check 
CHECK (sub_bloque IN ('1° hora', '2° hora', '1', '2', 'primera', 'segunda'));

-- 5. VERIFICAR QUE LOS CONSTRAINTS SE APLICARON CORRECTAMENTE
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'reservas'::regclass 
AND conname LIKE '%tipo_bloque%' OR conname LIKE '%sub_bloque%';
