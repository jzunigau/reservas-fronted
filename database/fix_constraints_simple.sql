-- SCRIPT SIMPLE PARA CORREGIR CONSTRAINTS
-- Ejecutar en Supabase SQL Editor

-- 1. ELIMINAR CONSTRAINT DE TIPO_BLOQUE
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_tipo_bloque_check;

-- 2. CREAR NUEVO CONSTRAINT DE TIPO_BLOQUE
ALTER TABLE reservas ADD CONSTRAINT reservas_tipo_bloque_check 
CHECK (tipo_bloque IN ('completo', '1hora', '2hora', 'parcial'));

-- 3. ELIMINAR CONSTRAINT DE SUB_BLOQUE  
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_sub_bloque_check;

-- 4. CREAR NUEVO CONSTRAINT DE SUB_BLOQUE
ALTER TABLE reservas ADD CONSTRAINT reservas_sub_bloque_check 
CHECK (sub_bloque IN ('1° hora', '2° hora', '1', '2', 'primera', 'segunda'));
