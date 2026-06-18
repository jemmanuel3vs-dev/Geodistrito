const db = require('../database/connection');

const DEFAULT_DASHBOARD = {
  total: 0,
  tipos: {
    bardas: 0,
    lonas: 0,
    comites: 0,
    casillas: 0,
    espectaculares: 0,
    vehiculos: 0
  },
  distritos: {
    20: 0,
    21: 0,
    22: 0,
    23: 0,
    24: 0
  }
};

const DASHBOARD_QUERY = `
  SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN LOWER(TRIM(tipo)) = 'bardas' THEN 1 ELSE 0 END) AS bardas,
    SUM(CASE WHEN LOWER(TRIM(tipo)) = 'lonas' THEN 1 ELSE 0 END) AS lonas,
    SUM(CASE WHEN LOWER(TRIM(tipo)) = 'comites' THEN 1 ELSE 0 END) AS comites,
    SUM(CASE WHEN LOWER(TRIM(tipo)) = 'casillas' THEN 1 ELSE 0 END) AS casillas,
    SUM(CASE WHEN LOWER(TRIM(tipo)) = 'espectaculares' THEN 1 ELSE 0 END) AS espectaculares,
    SUM(CASE WHEN LOWER(TRIM(tipo)) IN ('vehiculos', 'vehículos') THEN 1 ELSE 0 END) AS vehiculos,
    SUM(CASE WHEN TRIM(REPLACE(LOWER(COALESCE(distrito, '')), 'distrito', '')) = '20' THEN 1 ELSE 0 END) AS distrito_20,
    SUM(CASE WHEN TRIM(REPLACE(LOWER(COALESCE(distrito, '')), 'distrito', '')) = '21' THEN 1 ELSE 0 END) AS distrito_21,
    SUM(CASE WHEN TRIM(REPLACE(LOWER(COALESCE(distrito, '')), 'distrito', '')) = '22' THEN 1 ELSE 0 END) AS distrito_22,
    SUM(CASE WHEN TRIM(REPLACE(LOWER(COALESCE(distrito, '')), 'distrito', '')) = '23' THEN 1 ELSE 0 END) AS distrito_23,
    SUM(CASE WHEN TRIM(REPLACE(LOWER(COALESCE(distrito, '')), 'distrito', '')) = '24' THEN 1 ELSE 0 END) AS distrito_24
  FROM puntos
`;

function toNumber(value) {
  return Number(value) || 0;
}

function formatDashboardRow(row = {}) {
  return {
    total: toNumber(row.total),
    tipos: {
      bardas: toNumber(row.bardas),
      lonas: toNumber(row.lonas),
      comites: toNumber(row.comites),
      casillas: toNumber(row.casillas),
      espectaculares: toNumber(row.espectaculares),
      vehiculos: toNumber(row.vehiculos)
    },
    distritos: {
      20: toNumber(row.distrito_20),
      21: toNumber(row.distrito_21),
      22: toNumber(row.distrito_22),
      23: toNumber(row.distrito_23),
      24: toNumber(row.distrito_24)
    }
  };
}

async function getDashboard(req, res) {
  try {
    const [rows] = await db.execute(DASHBOARD_QUERY);

    return res.json(
      formatDashboardRow(rows[0] || DEFAULT_DASHBOARD)
    );
  } catch (error) {
    return res.status(500).json({
      error: 'Error obteniendo dashboard'
    });
  }
}

module.exports = {
  getDashboard,
  DASHBOARD_QUERY
};
