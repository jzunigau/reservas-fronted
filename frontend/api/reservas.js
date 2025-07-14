import { Pool } from 'pg';
import { authenticateServerless } from '../../backend/middleware/authServerless.js';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reservas_laboratorio',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export default async function handler(req, res) {
    // GET /api/reservas
    if (req.method === 'GET' && !req.query.fecha && !req.query.year && !req.query.month && !req.query.disponibilidad && !req.query.stats && !req.query.laboratorios) {
        try {
            const client = await pool.connect();
            const result = await client.query(`
                SELECT 
                    r.id,
                    r.fecha,
                    r.bloque,
                    r.sub_bloque as "subBloque",
                    r.dia_semana as dia,
                    r.tipo_bloque as "tipoBloque",
                    r.curso,
                    r.asignatura,
                    r.profesor,
                    r.laboratorio,
                    r.estado,
                    r.created_at as "fechaCreacion"
                FROM reservas r
                WHERE r.estado IN ('confirmada', 'pendiente')
                ORDER BY r.fecha DESC, r.bloque ASC
            `);
            client.release();
            return res.status(200).json({
                success: true,
                data: result.rows,
                message: 'Reservas obtenidas exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // GET /api/reservas?fecha=YYYY-MM-DD
    if (req.method === 'GET' && req.query.fecha) {
        try {
            const { fecha } = req.query;
            const client = await pool.connect();
            const result = await client.query(`
                SELECT 
                    r.id,
                    r.fecha,
                    r.bloque,
                    r.sub_bloque as "subBloque",
                    r.dia_semana as dia,
                    r.tipo_bloque as "tipoBloque",
                    r.curso,
                    r.asignatura,
                    r.profesor,
                    r.laboratorio,
                    r.estado,
                    r.created_at as "fechaCreacion"
                FROM reservas r
                WHERE r.fecha = $1 AND r.estado IN ('confirmada', 'pendiente')
                ORDER BY r.bloque ASC, r.sub_bloque ASC
            `, [fecha]);
            client.release();
            return res.status(200).json({
                success: true,
                data: result.rows,
                message: `Reservas para ${fecha} obtenidas exitosamente`
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // GET /api/reservas?year=YYYY&month=MM
    if (req.method === 'GET' && req.query.year && req.query.month) {
        try {
            const { year, month } = req.query;
            const client = await pool.connect();
            const result = await client.query(`
                SELECT 
                    r.id,
                    r.fecha,
                    r.bloque,
                    r.sub_bloque as "subBloque",
                    r.dia_semana as dia,
                    r.tipo_bloque as "tipoBloque",
                    r.curso,
                    r.asignatura,
                    r.profesor,
                    r.laboratorio,
                    r.estado,
                    r.created_at as "fechaCreacion"
                FROM reservas r
                WHERE EXTRACT(YEAR FROM r.fecha) = $1 AND EXTRACT(MONTH FROM r.fecha) = $2
                AND r.estado IN ('confirmada', 'pendiente')
                ORDER BY r.fecha ASC, r.bloque ASC
            `, [year, month]);
            client.release();
            return res.status(200).json({
                success: true,
                data: result.rows,
                message: `Reservas para ${month}/${year} obtenidas exitosamente`
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // GET /api/reservas?disponibilidad=1&fecha=YYYY-MM-DD&bloque=...&subBloque=...&dia=...
    if (req.method === 'GET' && req.query.disponibilidad) {
        try {
            const { fecha, bloque, subBloque, dia } = req.query;
            const client = await pool.connect();
            const result = await client.query(`
                SELECT COUNT(*) as count
                FROM reservas r
                WHERE r.fecha = $1 
                AND r.bloque = $2 
                AND r.sub_bloque = $3 
                AND r.dia_semana = $4 
                AND r.estado IN ('confirmada', 'pendiente')
            `, [fecha, bloque, subBloque, dia]);
            client.release();
            const disponible = parseInt(result.rows[0].count) === 0;
            return res.status(200).json({
                success: true,
                data: {
                    disponible,
                    fecha,
                    bloque,
                    subBloque,
                    dia
                },
                message: disponible ? 'Horario disponible' : 'Horario ocupado'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // POST /api/reservas (crear nueva reserva, requiere autenticación)
    if (req.method === 'POST') {
        const user = await authenticateServerless(req, res);
        if (!user) return;
        try {
            const {
                fecha,
                bloque,
                subBloque,
                dia,
                tipoBloque,
                curso,
                asignatura,
                profesor,
                laboratorio
            } = req.body;
            if (!fecha || !bloque || !subBloque || !dia || !curso || !asignatura || !profesor || !laboratorio) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                // Verificar disponibilidad
                const disponibilidadResult = await client.query(`
                    SELECT COUNT(*) as count
                    FROM reservas r
                    WHERE r.fecha = $1 
                    AND r.bloque = $2 
                    AND r.sub_bloque = $3 
                    AND r.dia_semana = $4 
                    AND r.estado IN ('confirmada', 'pendiente')
                `, [fecha, bloque, subBloque, dia]);
                if (parseInt(disponibilidadResult.rows[0].count) > 0) {
                    await client.query('ROLLBACK');
                    client.release();
                    return res.status(409).json({
                        success: false,
                        message: 'El horario seleccionado ya está ocupado'
                    });
                }
                // Obtener laboratorio_id
                const laboratorioResult = await client.query(`
                    SELECT id FROM laboratorios WHERE nombre = $1 LIMIT 1
                `, [laboratorio]);
                let laboratorio_id = 1;
                if (laboratorioResult.rows.length > 0) {
                    laboratorio_id = laboratorioResult.rows[0].id;
                }
                // Crear la reserva
                const insertResult = await client.query(`
                    INSERT INTO reservas (
                        usuario_id, laboratorio_id, fecha, bloque, sub_bloque, dia_semana,
                        tipo_bloque, curso, asignatura, profesor, laboratorio, estado
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmada')
                    RETURNING id
                `, [
                    user.id,
                    laboratorio_id,
                    fecha,
                    bloque,
                    subBloque,
                    dia,
                    tipoBloque || 'completo',
                    curso,
                    asignatura,
                    profesor,
                    laboratorio
                ]);
                // Obtener la reserva creada
                const reservaResult = await client.query(`
                    SELECT 
                        r.id,
                        r.fecha,
                        r.bloque,
                        r.sub_bloque as "subBloque",
                        r.dia_semana as dia,
                        r.tipo_bloque as "tipoBloque",
                        r.curso,
                        r.asignatura,
                        r.profesor,
                        r.laboratorio,
                        r.estado,
                        r.created_at as "fechaCreacion"
                    FROM reservas r
                    WHERE r.id = $1
                `, [insertResult.rows[0].id]);
                await client.query('COMMIT');
                client.release();
                return res.status(201).json({
                    success: true,
                    data: reservaResult.rows[0],
                    message: 'Reserva creada exitosamente'
                });
            } catch (innerError) {
                await client.query('ROLLBACK');
                client.release();
                throw innerError;
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // PUT /api/reservas?id=ID (actualizar estado, requiere autenticación)
    if (req.method === 'PUT' && req.query.id) {
        const user = await authenticateServerless(req, res);
        if (!user) return;
        try {
            const { id } = req.query;
            const { estado } = req.body;
            if (!estado || !['confirmada', 'pendiente', 'cancelada'].includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado inválido. Estados permitidos: confirmada, pendiente, cancelada'
                });
            }
            const client = await pool.connect();
            // Verificar que la reserva existe y pertenece al usuario (o es admin)
            const reservaExistente = await client.query(`
                SELECT id FROM reservas WHERE id = $1 AND (usuario_id = $2 OR $3 = 'admin')
            `, [id, user.id, user.rol]);
            if (reservaExistente.rows.length === 0) {
                client.release();
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada o no tienes permisos para modificarla'
                });
            }
            // Actualizar la reserva
            await client.query(`
                UPDATE reservas SET estado = $1, updated_at = NOW()
                WHERE id = $2
            `, [estado, id]);
            // Obtener la reserva actualizada
            const reservaActualizada = await client.query(`
                SELECT 
                    r.id,
                    r.fecha,
                    r.bloque,
                    r.sub_bloque as "subBloque",
                    r.dia_semana as dia,
                    r.tipo_bloque as "tipoBloque",
                    r.curso,
                    r.asignatura,
                    r.profesor,
                    r.laboratorio,
                    r.estado,
                    r.created_at as "fechaCreacion"
                FROM reservas r
                WHERE r.id = $1
            `, [id]);
            client.release();
            return res.status(200).json({
                success: true,
                data: reservaActualizada.rows[0],
                message: 'Reserva actualizada exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // DELETE /api/reservas?id=ID (cancelar reserva, requiere autenticación)
    if (req.method === 'DELETE' && req.query.id) {
        const user = await authenticateServerless(req, res);
        if (!user) return;
        try {
            const { id } = req.query;
            const client = await pool.connect();
            // Verificar que la reserva existe y pertenece al usuario (o es admin)
            const reservaExistente = await client.query(`
                SELECT id FROM reservas WHERE id = $1 AND (usuario_id = $2 OR $3 = 'admin')
            `, [id, user.id, user.rol]);
            if (reservaExistente.rows.length === 0) {
                client.release();
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada o no tienes permisos para eliminarla'
                });
            }
            // Marcar como cancelada
            await client.query(`
                UPDATE reservas SET estado = 'cancelada', updated_at = NOW()
                WHERE id = $1
            `, [id]);
            client.release();
            return res.status(200).json({
                success: true,
                message: 'Reserva cancelada exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // GET /api/reservas?stats=general (obtener estadísticas)
    if (req.method === 'GET' && req.query.stats === 'general') {
        try {
            const client = await pool.connect();
            const result = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM reservas WHERE estado IN ('confirmada', 'pendiente')) as total_reservas,
                    (SELECT COUNT(*) FROM reservas WHERE fecha = CURRENT_DATE AND estado IN ('confirmada', 'pendiente')) as reservas_hoy,
                    (SELECT COUNT(DISTINCT profesor) FROM reservas WHERE estado IN ('confirmada', 'pendiente')) as profesores_activos,
                    (SELECT COUNT(*) FROM laboratorios WHERE activo = TRUE) as laboratorios_disponibles,
                    (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) as usuarios_activos
            `);
            client.release();
            return res.status(200).json({
                success: true,
                data: result.rows[0],
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // GET /api/reservas?laboratorios=1 (obtener laboratorios disponibles)
    if (req.method === 'GET' && req.query.laboratorios) {
        try {
            const client = await pool.connect();
            const result = await client.query(`
                SELECT id, nombre, capacidad, equipamiento
                FROM laboratorios
                WHERE activo = TRUE
                ORDER BY nombre ASC
            `);
            client.release();
            return res.status(200).json({
                success: true,
                data: result.rows,
                message: 'Laboratorios obtenidos exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    // Si el método no está permitido
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Método ${req.method} no permitido`);
} 