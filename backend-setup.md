# Configuración del Backend

## 📋 Pasos para configurar el backend

### 1. Crear proyecto en Supabase
- Ve a [supabase.com](https://supabase.com)
- Crea una nueva organización
- Crea un nuevo proyecto
- Guarda las credenciales de conexión

### 2. Configurar base de datos
```sql
-- Ejecutar en Supabase SQL Editor
-- Crear tabla de usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'profesor',
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de reservas
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha DATE NOT NULL,
  bloque VARCHAR(50) NOT NULL,
  sub_bloque VARCHAR(50) NOT NULL,
  dia VARCHAR(20) NOT NULL,
  laboratorio VARCHAR(100) NOT NULL,
  asignatura VARCHAR(100) NOT NULL,
  profesor VARCHAR(100) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Variables de entorno para Vercel
En el dashboard de Vercel, configura estas variables:

```
DATABASE_URL=postgresql://usuario:password@host:puerto/database
JWT_SECRET=tu_jwt_secret_muy_seguro
NODE_ENV=production
```

### 4. Crear usuario admin
```sql
-- Generar hash de contraseña con bcrypt
-- Usar: https://bcrypt-generator.com/
INSERT INTO usuarios (username, email, password, rol, nombre, apellido)
VALUES (
  'admin',
  'admin@escuela.com',
  '$2b$10$...', -- Hash de tu contraseña
  'admin',
  'Administrador',
  'Sistema'
);
```

## 🔗 Enlaces útiles
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Bcrypt Generator](https://bcrypt-generator.com/)

## 📞 Soporte
- Documentación: README_PRODUCTION.md
- Variables de entorno: env-config.md 