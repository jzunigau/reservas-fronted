-- Fix para políticas RLS de la tabla usuarios
-- Elimina políticas problemáticas y crea políticas simples

-- 1. Eliminar todas las políticas existentes de usuarios
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON usuarios;
DROP POLICY IF EXISTS "Enable read access for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuarios;
DROP POLICY IF EXISTS "Enable update for users based on email" ON usuarios;

-- 2. Crear políticas simples y seguras
-- Política de lectura: permitir a usuarios autenticados leer sus propios datos
CREATE POLICY "usuarios_select_simple" ON usuarios
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email OR auth.role() = 'service_role');

-- Política de inserción: permitir solo a service_role
CREATE POLICY "usuarios_insert_simple" ON usuarios
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Política de actualización: permitir a usuarios actualizar sus propios datos
CREATE POLICY "usuarios_update_simple" ON usuarios
    FOR UPDATE
    USING (auth.jwt() ->> 'email' = email OR auth.role() = 'service_role')
    WITH CHECK (auth.jwt() ->> 'email' = email OR auth.role() = 'service_role');

-- 3. Asegurar que RLS esté habilitado
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'usuarios';
