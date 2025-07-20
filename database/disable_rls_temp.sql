-- SOLUCIÓN TEMPORAL: Deshabilitar RLS en tabla usuarios
-- Usar solo para pruebas de desarrollo

-- Deshabilitar RLS temporalmente
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- NOTA: Esto es solo para desarrollo/pruebas
-- En producción deberías usar políticas RLS correctas
