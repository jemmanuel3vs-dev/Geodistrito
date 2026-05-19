const db = require('../database/connection');

/**
 * Construye condiciones SQL a partir de filtros query comunes.
 */
function buildStatsFilters(query = {}) {
  const conditions = [];
  const params = [];

  if (query.estado) {
    conditions.push('p.estado = ?');
    params.push(query.estado);
  }

  if (query.tipo) {
    conditions.push('p.tipo = ?');
    params.push(query.tipo);
  }

  if (query.distrito) {
    conditions.push('p.distrito = ?');
    params.push(query.distrito);
  }

  if (query.municipio) {
    conditions.push('p.municipio = ?');
    params.push(query.municipio);
  }

  if (query.seccion) {
    conditions.push('p.seccion = ?');
    params.push(query.seccion);
  }

  if (query.encargado) {
    conditions.push('p.encargado LIKE ?');
    params.push(`%${query.encargado}%`);
  }

  if (query.usuario_id) {
    conditions.push('p.usuario_id = ?');
    params.push(query.usuario_id);
  }

  return {
    filterSql: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

/**
 * Controller para estadísticas GIS del proyecto GeoDistrito
 * Proporciona agregaciones de datos para dashboard y análisis
 */

/**
 * GET /api/puntos/stats/overview
 * Retorna estadísticas generales del sistema
 */
exports.getOverviewStats = async (req, res) => {
  try {
    const { filterSql, params } = buildStatsFilters(req.query);
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_puntos,
        COUNT(DISTINCT p.distrito) as total_distritos,
        COUNT(DISTINCT p.seccion) as total_secciones,
        COUNT(DISTINCT p.municipio) as total_municipios,
        COUNT(DISTINCT p.encargado) as total_comites,
        COUNT(DISTINCT u.id) as usuarios_activos
      FROM puntos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ${filterSql}
    `;
    
    const [rows] = await db.execute(query, params);
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error en getOverviewStats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas generales', error: error.message });
  }
};

/**
 * GET /api/puntos/stats/by-district?estado=pendiente
 * Retorna cantidad de puntos por distrito con filtros opcionales
 */
exports.getStatsByDistrict = async (req, res) => {
  try {
    const { filterSql, params } = buildStatsFilters(req.query);
    const query = `
      SELECT 
        p.distrito,
        COUNT(*) as cantidad,
        COUNT(DISTINCT p.tipo) as tipos_diferentes
      FROM puntos p
      ${filterSql}
      GROUP BY p.distrito
      ORDER BY cantidad DESC
    `;
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getStatsByDistrict:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas por distrito', error: error.message });
  }
};

/**
 * GET /api/puntos/stats/by-type?estado=completado
 * Retorna cantidad de puntos por tipo de punto
 */
exports.getStatsByType = async (req, res) => {
  try {
    const { filterSql, params } = buildStatsFilters(req.query);
    const query = `
      SELECT 
        p.tipo,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM puntos p2 ${filterSql}), 2) as porcentaje
      FROM puntos p
      ${filterSql}
      GROUP BY p.tipo
      ORDER BY cantidad DESC
    `;
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getStatsByType:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas por tipo', error: error.message });
  }
};

/**
 * GET /api/puntos/stats/by-municipality?estado=revisión
 * Retorna cantidad de puntos por municipio
 */
exports.getStatsByMunicipality = async (req, res) => {
  try {
    const { filterSql, params } = buildStatsFilters(req.query);
    const query = `
      SELECT 
        p.municipio,
        COUNT(*) as cantidad,
        COUNT(DISTINCT p.distrito) as distritos_count,
        COUNT(DISTINCT p.tipo) as tipos_count
      FROM puntos p
      ${filterSql}
      GROUP BY p.municipio
      ORDER BY cantidad DESC
      LIMIT 20
    `;
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getStatsByMunicipality:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas por municipio', error: error.message });
  }
};

/**
 * GET /api/puntos/stats/activity-by-date?days=30&estado=pendiente
 * Retorna cantidad de puntos registrados por día (últimos N días)
 */
exports.getActivityByDate = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const filters = { ...req.query };
    delete filters.days;

    const { filterSql, params } = buildStatsFilters(filters);
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM puntos p
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const queryParams = [days];
    if (filterSql) {
      query += ` AND ${filterSql.replace(/^WHERE\s+/i, '')}`;
      queryParams.push(...params);
    }

    query += ` GROUP BY DATE(created_at) ORDER BY date DESC`;

    const [rows] = await db.execute(query, queryParams);
    res.json(rows.reverse()); // Ordenar ascendente por fecha
  } catch (error) {
    console.error('Error en getActivityByDate:', error);
    res.status(500).json({ message: 'Error al obtener actividad por fecha', error: error.message });
  }
};

/**
 * GET /api/puntos/stats/by-user?estado=completado
 * Retorna cantidad de puntos por usuario capturista
 */
exports.getStatsByUser = async (req, res) => {
  try {
    const { filterSql, params } = buildStatsFilters(req.query);
    const query = `
      SELECT 
        u.nombre as usuario,
        u.email,
        COUNT(*) as cantidad,
        COUNT(DISTINCT p.tipo) as tipos,
        COUNT(DISTINCT p.estado) as estados_diferentes
      FROM puntos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ${filterSql}
      GROUP BY p.usuario_id, u.nombre, u.email
      ORDER BY cantidad DESC
      LIMIT 20
    `;
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getStatsByUser:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas por usuario', error: error.message });
  }
};

/**
 * GET /api/puntos/stats/by-state
 * Retorna cantidad de puntos por estado
 */
exports.getStatsByState = async (req, res) => {
  try {
    const query = `
      SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM puntos), 2) as porcentaje
      FROM puntos
      GROUP BY estado
      ORDER BY FIELD(estado, 'pendiente', 'revisión', 'completado', 'cancelado')
    `;
    
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error en getStatsByState:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas por estado', error: error.message });
  }
};
