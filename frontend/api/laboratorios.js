import { pool } from '../../backend/config/database.js';
import { authenticateServerless } from '../../backend/middleware/authServerless.js';
import { requireAdminServerless } from '../../backend/middleware/rolesServerless.js';

export default async function handler(req, res) {
  // LISTAR LABORATORIOS
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT id, nombre, capacidad, equipamiento, activo FROM laboratorios ORDER BY nombre ASC');
      return res.status(200).json({ data: result.rows });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  // CREAR LABORATORIO (solo admin)
  if (req.method === 'POST') {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
    const { nombre, capacidad, equipamiento } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO laboratorios (nombre, capacidad, equipamiento, activo) VALUES ($1, $2, $3, true) RETURNING *',
        [nombre, capacidad || null, equipamiento || null]
      );
      return res.status(201).json({ laboratorio: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  // ACTUALIZAR LABORATORIO (solo admin)
  if (req.method === 'PUT' && req.query.id) {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
    const { nombre, capacidad, equipamiento, activo } = req.body;
    try {
      const result = await pool.query(
        'UPDATE laboratorios SET nombre = COALESCE($1, nombre), capacidad = COALESCE($2, capacidad), equipamiento = COALESCE($3, equipamiento), activo = COALESCE($4, activo) WHERE id = $5 RETURNING *',
        [nombre, capacidad, equipamiento, activo, req.query.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Laboratorio no encontrado' });
      }
      return res.status(200).json({ laboratorio: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  // ELIMINAR LABORATORIO (solo admin)
  if (req.method === 'DELETE' && req.query.id) {
    const user = await authenticateServerless(req, res);
    if (!user) return;
    if (!requireAdminServerless(user, res)) return;
    try {
      const result = await pool.query('DELETE FROM laboratorios WHERE id = $1 RETURNING *', [req.query.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Laboratorio no encontrado' });
      }
      return res.status(200).json({ message: 'Laboratorio eliminado', laboratorio: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Método ${req.method} no permitido`);
} 