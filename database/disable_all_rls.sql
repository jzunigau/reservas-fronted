-- Deshabilitar RLS en todas las tablas para desarrollo
-- Ejecutar en Supabase SQL Editor

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorios DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó en todas
SELECT 
    tablename as "Tabla",
    rowsecurity as "RLS_Habilitado",
    CASE 
        WHEN rowsecurity = false THEN '✅ Deshabilitado'
        ELSE '❌ Aún habilitado'
    END as "Estado"
FROM pg_tables 
WHERE tablename IN ('usuarios', 'laboratorios', 'reservas')
ORDER BY tablename;

-- Mensaje de confirmación
SELECT 'RLS deshabilitado en todas las tablas - Sistema listo para pruebas' as "Resultado";
