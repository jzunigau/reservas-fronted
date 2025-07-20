-- Verificar estado de RLS y políticas

-- 1. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS_Habilitado",
    forcerowsecurity as "RLS_Forzado"
FROM pg_tables 
WHERE tablename IN ('usuarios', 'laboratorios', 'reservas');

-- 2. Listar todas las políticas existentes
SELECT 
    tablename as "Tabla", 
    policyname as "Política", 
    permissive as "Permisiva", 
    roles as "Roles", 
    cmd as "Comando",
    qual as "Condición",
    with_check as "Con_Check"
FROM pg_policies 
WHERE tablename IN ('usuarios', 'laboratorios', 'reservas')
ORDER BY tablename, policyname;

-- 3. Probar consulta simple a usuarios
SELECT 
    COUNT(*) as "Total_Usuarios",
    COUNT(CASE WHEN rol = 'admin' THEN 1 END) as "Admins",
    COUNT(CASE WHEN rol = 'profesor' THEN 1 END) as "Profesores"
FROM usuarios;
