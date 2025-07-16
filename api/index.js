const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Ruta para obtener laboratorios
app.get('/api/laboratorios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM laboratorios ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener laboratorios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener reservas
app.get('/api/reservas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, l.nombre as laboratorio_nombre 
      FROM reservas r 
      JOIN laboratorios l ON r.laboratorio_id = l.id 
      ORDER BY r.fecha DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para crear una reserva
app.post('/api/reservas', async (req, res) => {
  try {
    const { laboratorio_id, fecha, hora_inicio, hora_fin, motivo, solicitante } = req.body;
    
    // Verificar si ya existe una reserva para ese laboratorio en esa fecha y hora
    const existingReservation = await pool.query(
      'SELECT * FROM reservas WHERE laboratorio_id = $1 AND fecha = $2 AND hora_inicio = $3',
      [laboratorio_id, fecha, hora_inicio]
    );

    if (existingReservation.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una reserva para este laboratorio en esta fecha y hora' });
    }

    const result = await pool.query(
      'INSERT INTO reservas (laboratorio_id, fecha, hora_inicio, hora_fin, motivo, solicitante) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [laboratorio_id, fecha, hora_inicio, hora_fin, motivo, solicitante]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para eliminar una reserva
app.delete('/api/reservas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para autenticación (simplificada para desarrollo)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Credenciales de prueba
  if (email === 'admin@test.com' && password === 'admin123') {
    res.json({
      success: true,
      user: {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        name: 'Administrador'
      },
      token: 'fake-jwt-token-for-development'
    });
  } else if (email === 'user@test.com' && password === 'user123') {
    res.json({
      success: true,
      user: {
        id: 2,
        email: 'user@test.com',
        role: 'user',
        name: 'Usuario'
      },
      token: 'fake-jwt-token-for-development'
    });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app; 