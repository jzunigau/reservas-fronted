-- ====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS PARA SUPABASE
-- Sistema de Reservas de Laboratorio Escolar
-- ====================================================

-- 1. CREAR TABLA DE USUARIOS
-- ====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'profesor' CHECK (rol IN ('admin', 'profesor')),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- 2. CREAR TABLA DE LABORATORIOS
-- ====================================================
CREATE TABLE IF NOT EXISTS laboratorios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  capacidad INTEGER DEFAULT 30,
  ubicacion VARCHAR(100),
  equipamiento TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para laboratorios
CREATE INDEX IF NOT EXISTS idx_laboratorios_activo ON laboratorios(activo);
CREATE INDEX IF NOT EXISTS idx_laboratorios_nombre ON laboratorios(nombre);

-- Insertar laboratorios predeterminados
INSERT INTO laboratorios (nombre, capacidad, ubicacion, equipamiento) VALUES
('Lab. Física', 30, 'Piso 2 - Ala Norte', 'Equipamiento completo de física: mecheros Bunsen, balanzas, dinamómetros, multímetros'),
('Lab. Química', 25, 'Piso 1 - Ala Sur', 'Campana extractora, reactivos básicos, material de vidrio, balanzas analíticas'),
('Lab. Biología', 28, 'Piso 3 - Ala Este', 'Microscopios, preparaciones, incubadora, autoclave, material de disección'),
('Lab. Informática 1', 35, 'Piso 2 - Ala Sur', '35 computadoras, proyector, pizarra digital, software educativo'),
('Lab. Informática 2', 30, 'Piso 2 - Ala Sur', '30 computadoras, impresora 3D, kit de robótica, software de programación'),
('Lab. Tecnología', 25, 'Piso 1 - Taller', 'Herramientas básicas, taladros, sierras, material de construcción, banco de trabajo')
ON CONFLICT (nombre) DO NOTHING;

-- 3. CREAR TABLA DE RESERVAS
-- ====================================================
CREATE TABLE IF NOT EXISTS reservas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  laboratorio_id BIGINT NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  bloque INTEGER NOT NULL CHECK (bloque BETWEEN 1 AND 5),
  sub_bloque VARCHAR(20) NOT NULL CHECK (sub_bloque IN ('1° hora', '2° hora')),
  dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')),
  tipo_bloque VARCHAR(20) DEFAULT 'completo' CHECK (tipo_bloque IN ('completo', 'parcial')),
  curso VARCHAR(100) NOT NULL,
  asignatura VARCHAR(100) NOT NULL,
  profesor VARCHAR(100) NOT NULL,
  laboratorio VARCHAR(100) NOT NULL, -- Redundante pero útil para consultas rápidas
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'pendiente', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas de reservas
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario_id ON reservas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_laboratorio_id ON reservas(laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_bloque ON reservas(fecha, bloque, sub_bloque);

-- Índice compuesto para verificar disponibilidad rápidamente
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_disponibilidad 
ON reservas(fecha, bloque, sub_bloque, dia_semana, laboratorio_id) 
WHERE estado IN ('confirmada', 'pendiente');

-- 4. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ====================================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER trigger_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_laboratorios_updated_at
  BEFORE UPDATE ON laboratorios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- 5. CREAR USUARIO ADMINISTRADOR POR DEFECTO
-- ====================================================
-- Nota: La contraseña 'admin123' tiene hash: $2b$10$8K1p/a0dMLnXxkm4.WPLNOr9JKdQXePwRx0g8I8v8QYnRX6fqLxwu
INSERT INTO usuarios (username, email, password, rol, nombre, apellido) VALUES
('admin', 'admin@escuela.com', '$2b$10$8K1p/a0dMLnXxkm4.WPLNOr9JKdQXePwRx0g8I8v8QYnRX6fqLxwu', 'admin', 'Administrador', 'Sistema'),
('profesor1', 'profesor1@escuela.com', '$2b$10$8K1p/a0dMLnXxkm4.WPLNOr9JKdQXePwRx0g8I8v8QYnRX6fqLxwu', 'profesor', 'Juan', 'Pérez'),
('profesor2', 'profesor2@escuela.com', '$2b$10$8K1p/a0dMLnXxkm4.WPLNOr9JKdQXePwRx0g8I8v8QYnRX6fqLxwu', 'profesor', 'María', 'González')
ON CONFLICT (email) DO NOTHING;

-- 6. HABILITAR ROW LEVEL SECURITY (RLS) PARA SEGURIDAD
-- ====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo pueden ver/editar su propio perfil, admins ven todo
CREATE POLICY usuarios_policy ON usuarios
  USING (
    auth.uid()::text = id::text OR 
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text AND u.rol = 'admin'
    )
  );

-- Política para laboratorios: todos pueden leer, solo admins pueden modificar
CREATE POLICY laboratorios_read_policy ON laboratorios
  FOR SELECT USING (true);

CREATE POLICY laboratorios_write_policy ON laboratorios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text AND u.rol = 'admin'
    )
  );

-- Política para reservas: usuarios ven sus reservas + todas para lectura, admins ven todo
CREATE POLICY reservas_read_policy ON reservas
  FOR SELECT USING (true); -- Todos pueden ver todas las reservas (calendario público)

CREATE POLICY reservas_write_policy ON reservas
  FOR ALL USING (
    usuario_id::text = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text AND u.rol = 'admin'
    )
  );

-- 7. CREAR VISTAS ÚTILES PARA CONSULTAS COMUNES
-- ====================================================

-- Vista de reservas con información completa
CREATE OR REPLACE VIEW vista_reservas_completas AS
SELECT 
  r.id,
  r.fecha,
  r.bloque,
  r.sub_bloque,
  r.dia_semana,
  r.tipo_bloque,
  r.curso,
  r.asignatura,
  r.profesor,
  r.observaciones,
  r.estado,
  r.created_at,
  r.updated_at,
  u.nombre as usuario_nombre,
  u.apellido as usuario_apellido,
  u.email as usuario_email,
  l.nombre as laboratorio_nombre,
  l.capacidad as laboratorio_capacidad,
  l.ubicacion as laboratorio_ubicacion
FROM reservas r
JOIN usuarios u ON r.usuario_id = u.id
JOIN laboratorios l ON r.laboratorio_id = l.id;

-- Vista de estadísticas del sistema
CREATE OR REPLACE VIEW vista_estadisticas AS
SELECT 
  (SELECT COUNT(*) FROM reservas WHERE estado IN ('confirmada', 'pendiente')) as total_reservas,
  (SELECT COUNT(*) FROM reservas WHERE fecha = CURRENT_DATE AND estado IN ('confirmada', 'pendiente')) as reservas_hoy,
  (SELECT COUNT(*) FROM usuarios WHERE activo = true AND rol = 'profesor') as profesores_activos,
  (SELECT COUNT(*) FROM laboratorios WHERE activo = true) as laboratorios_disponibles,
  (SELECT COUNT(*) FROM usuarios WHERE activo = true) as usuarios_activos;

-- 8. INSERTAR DATOS DE EJEMPLO (OPCIONAL)
-- ====================================================
-- Algunas reservas de ejemplo para testing
INSERT INTO reservas (usuario_id, laboratorio_id, fecha, bloque, sub_bloque, dia_semana, curso, asignatura, profesor, laboratorio) VALUES
(2, 1, CURRENT_DATE + INTERVAL '1 day', 1, '1° hora', 'Martes', '3° Medio A', 'Física', 'Juan Pérez', 'Lab. Física'),
(2, 2, CURRENT_DATE + INTERVAL '2 days', 2, '2° hora', 'Miércoles', '2° Medio B', 'Química', 'Juan Pérez', 'Lab. Química'),
(3, 3, CURRENT_DATE + INTERVAL '3 days', 3, '1° hora', 'Jueves', '1° Medio C', 'Biología', 'María González', 'Lab. Biología')
ON CONFLICT DO NOTHING;

-- ====================================================
-- SCRIPT COMPLETADO
-- ====================================================

-- Verificar que todo se creó correctamente
SELECT 'Usuarios creados:' as tabla, COUNT(*) as cantidad FROM usuarios
UNION ALL
SELECT 'Laboratorios creados:' as tabla, COUNT(*) as cantidad FROM laboratorios
UNION ALL
SELECT 'Reservas creadas:' as tabla, COUNT(*) as cantidad FROM reservas;

-- Mostrar estadísticas
SELECT * FROM vista_estadisticas;
