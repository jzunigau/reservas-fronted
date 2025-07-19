-- ====================================================
-- INSERTAR USUARIOS DE PRUEBA
-- Sistema de Reservas de Laboratorio Escolar
-- ====================================================

-- IMPORTANTE: Ejecutar este script en la consola SQL de Supabase

-- 1. INSERTAR USUARIO ADMINISTRADOR
-- ====================================================
INSERT INTO usuarios (
  username, 
  email, 
  password, 
  rol, 
  nombre, 
  apellido, 
  activo
) VALUES (
  'admin',
  'admin.coco.jezu@gmail.com',
  'admin123',  -- En producción esto debería estar hasheado
  'admin',
  'Administrador',
  'Sistema',
  true
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  rol = EXCLUDED.rol,
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- 2. INSERTAR USUARIO PROFESOR
-- ====================================================
INSERT INTO usuarios (
  username, 
  email, 
  password, 
  rol, 
  nombre, 
  apellido, 
  activo
) VALUES (
  'profesor',
  'profesor.coco.jezu@gmail.com',
  'profesor123',  -- En producción esto debería estar hasheado
  'profesor',
  'Profesor de Prueba',
  'Sistema',
  true
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  rol = EXCLUDED.rol,
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- 3. VERIFICAR LOS USUARIOS INSERTADOS
-- ====================================================
SELECT 
  id,
  username,
  email,
  rol,
  nombre,
  apellido,
  activo,
  created_at
FROM usuarios 
WHERE email IN ('admin.coco.jezu@gmail.com', 'profesor.coco.jezu@gmail.com')
ORDER BY rol DESC;

-- ====================================================
-- INSTRUCCIONES PARA EJECUTAR:
-- 
-- 1. Ve a tu proyecto de Supabase
-- 2. Ve a "SQL Editor"
-- 3. Copia y pega este script completo
-- 4. Haz clic en "Run"
-- 5. Deberías ver los 2 usuarios creados al final
-- ====================================================
