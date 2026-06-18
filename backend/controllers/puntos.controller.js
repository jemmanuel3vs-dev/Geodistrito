const db = require('../database/connection');
const { createImageUrl } = require('../services/file.service');

const PUNTO_SELECT = `
  SELECT
    id,
    tipo,
    latitud AS lat,
    longitud AS lng,
    distrito,
    seccion,
    calle,
    colonia,
    municipio,
    encargado,
    url,
    estado,
    usuario_id,
    created_at,
    updated_at
  FROM puntos
`;

function sendError(res, status, message, details = null) {

  const payload = {
    ok: false,
    error: message
  };

  if (details) {
    payload.details = details;
  }

  return res.status(status).json(payload);

}

function isValidId(id) {

  return Number.isInteger(Number(id)) && Number(id) > 0;

}

async function findPuntoById(id) {

  const [rows] = await db.execute(
    `${PUNTO_SELECT} WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;

}

function cleanNullableText(value) {

  if (value === undefined) {
    return undefined;
  }

  const text = String(value).trim();

  return text || null;

}

function nextTextValue(value, currentValue) {

  if (value === undefined) {
    return currentValue;
  }

  return cleanNullableText(value);

}

/* CREAR PUNTO */
async function createPunto(req, res) {

  try {

    const {

      tipo,
      lat,
      lng,
      distrito,
      seccion,
      calle,
      colonia,
      municipio,
      encargado

    } = req.body;

    // Validar campos obligatorios
    if (!tipo || tipo.trim() === '') {
      return res.status(400).json({
        ok: false,
        error: 'El tipo de punto es obligatorio'
      });
    }

    if (!lat || isNaN(parseFloat(lat))) {
      return res.status(400).json({
        ok: false,
        error: 'La latitud es obligatoria y debe ser un número válido'
      });
    }

    if (!lng || isNaN(parseFloat(lng))) {
      return res.status(400).json({
        ok: false,
        error: 'La longitud es obligatoria y debe ser un número válido'
      });
    }

   if (!distrito || distrito.trim() === '') {
  return res.status(400).json({
    ok: false,
    error: 'El distrito es obligatorio'
  });
}

/* =====================================
   PROTECCIÓN CONTRA DUPLICADOS
===================================== */

const [duplicados] = await db.execute(
  `
  SELECT id
  FROM puntos
  WHERE
    tipo = ?
    AND latitud = ?
    AND longitud = ?
    AND created_at >= DATE_SUB(
      NOW(),
      INTERVAL 10 SECOND
    )
  LIMIT 1
  `,
  [
    tipo,
    parseFloat(lat),
    parseFloat(lng)
  ]
);

if (duplicados.length > 0) {

  console.warn(
    '⚠️ Punto duplicado detectado'
  );

  return res.status(409).json({

    ok: false,

    error:
      'Ya existe un punto similar registrado recientemente'

  });

}

/* =====================================
   CONTINÚA EL FLUJO NORMAL
===================================== */

    const imageUrl =
      req.file
        ? createImageUrl(req.file.filename)
        : req.body.url || null;

    // Obtener usuario_id del token (agregado en FASE 4)
    const usuarioId = req.user ? req.user.id : null;

    const sql = `
      INSERT INTO puntos
      (
        tipo,
        latitud,
        longitud,
        distrito,
        seccion,
        calle,
        colonia,
        municipio,
        encargado,
        url,
        usuario_id,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(

      sql,

      [

        tipo,
        parseFloat(lat),
        parseFloat(lng),
        distrito,
        seccion || null,
        calle || null,
        colonia || null,
        municipio || null,
        encargado || null,
        imageUrl,
        usuarioId,
        'pendiente'

      ]

    );

    res.json({

      ok: true,

      id: result.insertId,

      imageUrl

    });

  } catch (error) {

    console.error('❌ Error al guardar punto:', error);

    sendError(
      res,
      500,
      'Error guardando punto: ' + error.message
    );

  }

}

/* OBTENER PUNTOS */
async function getPuntos(req, res) {

  try {

    const [rows] = await db.execute(`
      ${PUNTO_SELECT}
      ORDER BY id DESC
    `);

    res.json({
      ok: true,
      data: rows
    });

  } catch (error) {

    console.error(error);

    sendError(
      res,
      500,
      'Error obteniendo puntos'
    );

  }

}

/* OBTENER PUNTO POR ID */
async function getPuntoById(req, res) {

  try {

    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, 'ID inválido');
    }

    const punto = await findPuntoById(id);

    if (!punto) {
      return sendError(res, 404, 'Punto no encontrado');
    }

    return res.json({
      ok: true,
      data: punto
    });

  } catch (error) {

    console.error(error);

    return sendError(
      res,
      500,
      'Error obteniendo punto'
    );

  }

}

/* ACTUALIZAR PUNTO */
async function updatePunto(req, res) {

  try {

    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, 'ID inválido');
    }

    const {

      tipo,
      distrito,
      seccion,
      calle,
      colonia,
      municipio,
      encargado,
      url

    } = req.body;

    const current = await findPuntoById(id);

    if (!current) {
      return sendError(res, 404, 'Punto no encontrado');
    }

    const nextTipo =
      tipo === undefined
      ? current.tipo
      : String(tipo).trim();

    if (!nextTipo) {
      return sendError(
        res,
        400,
        'El tipo de punto es obligatorio'
      );
    }

    // Si se subió una imagen nueva, usarla; si no, mantener el valor actual
    const nextUrl = req.file
      ? createImageUrl(req.file.filename)
      : nextTextValue(url, current.url);

    const sql = `
      UPDATE puntos
      SET
        tipo = ?,
        distrito = ?,
        seccion = ?,
        calle = ?,
        colonia = ?,
        municipio = ?,
        encargado = ?,
        url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(

      sql,

      [

        nextTipo,
        nextTextValue(distrito, current.distrito),
        nextTextValue(seccion, current.seccion),
        nextTextValue(calle, current.calle),
        nextTextValue(colonia, current.colonia),
        nextTextValue(municipio, current.municipio),
        nextTextValue(encargado, current.encargado),
        nextUrl,
        id

      ]

    );

    const updated = await findPuntoById(id);

    res.json({

      ok: true,

      message:
      'Punto actualizado',

      data:
      updated

    });

  } catch (error) {

    console.error(error);

    sendError(res, 500, 'Error actualizando punto');

  }

}

/* ELIMINAR PUNTO */
async function deletePunto(req, res) {

  try {

    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, 'ID inválido');
    }

    const [result] = await db.execute(

      'DELETE FROM puntos WHERE id = ?',

      [id]

    );

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Punto no encontrado');
    }

    res.json({

      ok: true,

      message:
      'Punto eliminado'

    });

  } catch (error) {

    console.error(error);

    sendError(res, 500, 'Error eliminando punto');

  }

}

module.exports = {

  getPuntos,
  getPuntoById,
  createPunto,
  updatePunto,
  deletePunto

};
