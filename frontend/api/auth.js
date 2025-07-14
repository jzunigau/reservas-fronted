import { pool } from '../../backend/config/database.js';
import { generateToken } from '../../backend/config/jwt.js';
import { hashPassword, comparePassword } from '../../backend/utils/helpers.js';
import { authenticateServerless } from '../../backend/middleware/authServerless.js';
import { requireAdminServerless } from '../../backend/middleware/rolesServerless.js';

export default async function handler(req, res) {
  // LOGIN
  if (
    req.method === 'POST' &&
    (req.url === '/api/auth' || req.url === '/api/auth/login' || req.url === '/api/auth/')
  ) {
    const { usuario, email, password } = req.body;
    if (!(usuario || email) || !password) {
      return res.status(400).json({ message: 'Usuario/email y contraseña requeridos' });
    }
    try {
      // Buscar por email o por nombre de usuario
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1 OR nombre = $2',
        [email || usuario, usuario || email]
      );
      const user = result.rows[0];
      if (!user || !user.activo) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      const token = generateToken({ userId: user.id });
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ message: 'Error interno', error: error.message });
    }
  }

  // REGISTRO (solo admin)
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    const admin = await authenticateServerless(req, res);
    if (!admin) return;
    if (!requireAdminServerless(admin, res)) return;
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    try {
      const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      const passwordHash = await hashPassword(password);
      const result = await pool.query(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES ($1, $2, $3, $4, true) RETURNING id, nombre, email, rol',
        [nombre, email, passwordHash, rol]
      );
      return res.status(201).json({
        user: result.rows[0],
        message: 'Usuario registrado exitosamente'
      });
    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Método ${req.method} no permitido`);
} 