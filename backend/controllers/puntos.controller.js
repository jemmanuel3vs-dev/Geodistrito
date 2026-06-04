const db = require('../database/connection');

/* CREAR PUNTO */
async function createPunto(req, res) {

  try {

    console.log(
      "📥 Body:",
      req.body
    );

    console.log(
      "📎 Archivo:",
      req.file
      ? req.file.filename
      : "No hay"
    );

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
      console.log('❌ Validación fallida: falta TIPO');
      return res.status(400).json({
        error: 'El tipo de punto es obligatorio'
      });
    }

    if (!lat || isNaN(parseFloat(lat))) {
      console.log('❌ Validación fallida: latitud inválida');
      return res.status(400).json({
        error: 'La latitud es obligatoria y debe ser un número válido'
      });
    }

    if (!lng || isNaN(parseFloat(lng))) {
      console.log('❌ Validación fallida: longitud inválida');
      return res.status(400).json({
        error: 'La longitud es obligatoria y debe ser un número válido'
      });
    }

   if (!distrito || distrito.trim() === '') {
  console.log('❌ Validación fallida: falta DISTRITO');
  return res.status(400).json({
    error: 'El distrito es obligatorio'
  });
}

console.log('✅ Validación exitosa para:', {
  tipo,
  lat,
  lng,
  distrito
});

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

    error:
      'Ya existe un punto similar registrado recientemente'

  });

}

/* =====================================
   CONTINÚA EL FLUJO NORMAL
===================================== */

const baseUrl =

  process.env.BACKEND_URL

  ||

  `http://localhost:${process.env.PORT || 3000}`;

    const imageUrl =

      req.file

      ? `${baseUrl}/uploads/${req.file.filename}`

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

    console.log('✅ Punto insertado en BD - ID:', result.insertId);
    console.log('📸 URL de imagen:', imageUrl);

    res.json({

      ok: true,

      id: result.insertId,

      imageUrl

    });

  } catch (error) {

    console.error('❌ Error al guardar punto:', error);

    res.status(500).json({

      error:
      'Error guardando punto: ' + error.message

    });

  }

}

/* OBTENER PUNTOS */
async function getPuntos(req, res) {

  try {

    const [rows] = await db.execute(`

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

      ORDER BY id DESC

    `);

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      'Error obteniendo puntos'

    });

  }

}

/* ACTUALIZAR PUNTO */
async function updatePunto(req, res) {

  try {

    const { id } = req.params;

    const {

      tipo,
      distrito,
      seccion,
      calle,
      colonia,
      municipio,
      encargado

    } = req.body;

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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute(

      sql,

      [

        tipo,
        distrito,
        seccion,
        calle,
        colonia,
        municipio,
        encargado,
        id

      ]

    );

    res.json({

      ok: true,

      message:
      'Punto actualizado'

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      'Error actualizando punto'

    });

  }

}

/* ELIMINAR PUNTO */
async function deletePunto(req, res) {

  try {

    const { id } = req.params;

    await db.execute(

      'DELETE FROM puntos WHERE id = ?',

      [id]

    );

    res.json({

      ok: true,

      message:
      'Punto eliminado'

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      'Error eliminando punto'

    });

  }

}

module.exports = {

  getPuntos,
  createPunto,
  updatePunto,
  deletePunto

};