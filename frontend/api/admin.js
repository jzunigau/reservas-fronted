import { pool } from '../../backend/config/database.js';
import { authenticateServerless } from '../../backend/middleware/authServerless.js';
import { requireAdminServerless } from '../../backend/middleware/rolesServerless.js';
import { hashPassword } from '../../backend/utils/helpers.js';

export default async function handler(req, res) {
  // Listar usuarios (solo admin)
  if (req.method === 'GET') {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
    try {
      const result = await pool.query('SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY nombre ASC');
      return res.status(200).json({ data: result.rows });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  // Crear usuario (solo admin)
  if (req.method === 'POST') {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
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
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES ($1, $2, $3, $4, true) RETURNING id, nombre, email, rol, activo',
        [nombre, email, passwordHash, rol]
      );
      return res.status(201).json({ usuario: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  // Actualizar usuario (solo admin)
  if (req.method === 'PUT' && req.query.id) {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
    const { nombre, email, password, rol, activo } = req.body;
    try {
      let passwordHash = null;
      if (password) {
        passwordHash = await hashPassword(password);
      }
      const result = await pool.query(
        'UPDATE usuarios SET nombre = COALESCE($1, nombre), email = COALESCE($2, email), password = COALESCE($3, password), rol = COALESCE($4, rol), activo = COALESCE($5, activo) WHERE id = $6 RETURNING id, nombre, email, rol, activo',
        [nombre, email, passwordHash, rol, activo, req.query.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.status(200).json({ usuario: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  // Eliminar usuario (solo admin)
  if (req.method === 'DELETE' && req.query.id) {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
    try {
      const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email, rol, activo', [req.query.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.status(200).json({ message: 'Usuario eliminado', usuario: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Método ${req.method} no permitido`);
} 