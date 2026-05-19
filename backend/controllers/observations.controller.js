const db = require('../database/connection');

/**
 * Controller para observaciones y auditoría de puntos
 * Gestiona comentarios, cambios de estado y registro de cambios
 */

/**
 * POST /api/puntos/:id/observations
 * Crea una nueva observación/comentario en un punto
 */
exports.createObservation = async (req, res) => {
  try {
    const { id: puntoId } = req.params;
    const { comentario, prioridad } = req.body;
    const usuarioId = req.user.id;

    // Validaciones
    if (!comentario || comentario.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario es requerido' });
    }

    if (comentario.length > 500) {
      return res.status(400).json({ message: 'El comentario no debe exceder 500 caracteres' });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    const prioridadFinal = validPriorities.includes(prioridad) ? prioridad : 'MEDIUM';

    // Verificar que el punto existe
    const [puntos] = await db.execute('SELECT id, usuario_id FROM puntos WHERE id = ?', [puntoId]);
    if (puntos.length === 0) {
      return res.status(404).json({ message: 'Punto no encontrado' });
    }

    const punto = puntos[0];

    // Verificar permisos: capturista solo puede comentar sus propios puntos, admin todo
    if (req.user.rol !== 'admin' && punto.usu_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para comentar este punto' });
    }

    // Insertar observación
    const query = `
      INSERT INTO observaciones_puntos (punto_id, usuario_id, comentario, prioridad)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [puntoId, usuarioId, comentario.trim(), prioridadFinal]);

    res.status(201).json({
      id: result.insertId,
      punto_id: puntoId,
      usuario_id: usuarioId,
      comentario,
      prioridad: prioridadFinal,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en createObservation:', error);
    res.status(500).json({ message: 'Error al crear observación', error: error.message });
  }
};

/**
 * GET /api/puntos/:id/observations
 * Obtiene la última observación de un punto
 */
exports.getObservation = async (req, res) => {
  try {
    const { id: puntoId } = req.params;

    const query = `
      SELECT 
        op.id,
        op.punto_id,
        op.usuario_id,
        op.comentario,
        op.prioridad,
        op.created_at,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM observaciones_puntos op
      LEFT JOIN usuarios u ON op.usuario_id = u.id
      WHERE op.punto_id = ?
      ORDER BY op.created_at DESC
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [puntoId]);

    if (rows.length === 0) {
      return res.json(null);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getObservation:', error);
    res.status(500).json({ message: 'Error al obtener observación', error: error.message });
  }
};

/**
 * PUT /api/puntos/:id/observations/:obsId
 * Edita una observación existente (admin only)
 */
exports.updateObservation = async (req, res) => {
  try {
    const { id: puntoId, obsId } = req.params;
    const { comentario, prioridad } = req.body;

    // Solo admin puede editar observaciones
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden editar observaciones' });
    }

    // Validaciones
    if (!comentario || comentario.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario es requerido' });
    }

    if (comentario.length > 500) {
      return res.status(400).json({ message: 'El comentario no debe exceder 500 caracteres' });
    }

    // Verificar que la observación existe
    const [obs] = await db.execute(
      'SELECT id FROM observaciones_puntos WHERE id = ? AND punto_id = ?',
      [obsId, puntoId]
    );

    if (obs.length === 0) {
      return res.status(404).json({ message: 'Observación no encontrada' });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    const prioridadFinal = validPriorities.includes(prioridad) ? prioridad : 'MEDIUM';

    const query = `
      UPDATE observaciones_puntos
      SET comentario = ?, prioridad = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND punto_id = ?
    `;

    await db.execute(query, [comentario.trim(), prioridadFinal, obsId, puntoId]);

    res.json({ message: 'Observación actualizada exitosamente' });
  } catch (error) {
    console.error('Error en updateObservation:', error);
    res.status(500).json({ message: 'Error al actualizar observación', error: error.message });
  }
};

/**
 * PATCH /api/puntos/:id/state
 * Cambia el estado de un punto (admin only) y registra en auditoría
 */
exports.updatePuntoState = async (req, res) => {
  try {
    const { id: puntoId } = req.params;
    const { estado, comentario } = req.body;
    const usuarioId = req.user.id;

    // Solo admin puede cambiar estado
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden cambiar el estado' });
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'revisión', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: `Estado inválido. Válidos: ${estadosValidos.join(', ')}` });
    }

    // Obtener estado actual del punto
    const [puntos] = await db.execute('SELECT estado FROM puntos WHERE id = ?', [puntoId]);
    if (puntos.length === 0) {
      return res.status(404).json({ message: 'Punto no encontrado' });
    }

    const estadoAnterior = puntos[0].estado;

    // No hacer nada si el estado es igual
    if (estadoAnterior === estado) {
      return res.json({ message: 'El punto ya tiene este estado' });
    }

    // Actualizar estado en tabla puntos
    const updateQuery = 'UPDATE puntos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await db.execute(updateQuery, [estado, puntoId]);

    // Registrar en auditoría
    const auditQuery = `
      INSERT INTO auditoria_puntos (punto_id, usuario_id, estado_anterior, estado_nuevo, comentario)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(auditQuery, [
      puntoId,
      usuarioId,
      estadoAnterior,
      estado,
      comentario || null
    ]);

    res.json({
      id: puntoId,
      estado_anterior: estadoAnterior,
      estado_nuevo: estado,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en updatePuntoState:', error);
    res.status(500).json({ message: 'Error al cambiar estado', error: error.message });
  }
};

/**
 * GET /api/puntos/:id/audit
 * Obtiene el historial de cambios de estado (auditoría) de un punto
 */
exports.getAuditHistory = async (req, res) => {
  try {
    const { id: puntoId } = req.params;

    const query = `
      SELECT 
        ap.id,
        ap.punto_id,
        ap.estado_anterior,
        ap.estado_nuevo,
        ap.comentario,
        ap.created_at,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM auditoria_puntos ap
      LEFT JOIN usuarios u ON ap.usuario_id = u.id
      WHERE ap.punto_id = ?
      ORDER BY ap.created_at DESC
    `;

    const [rows] = await db.execute(query, [puntoId]);

    res.json(rows);
  } catch (error) {
    console.error('Error en getAuditHistory:', error);
    res.status(500).json({ message: 'Error al obtener historial de auditoría', error: error.message });
  }
};
