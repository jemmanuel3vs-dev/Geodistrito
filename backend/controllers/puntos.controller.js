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

    if (

      !tipo ||
      !lat ||
      !lng ||
      !distrito

    ) {

      return res.status(400).json({

        error:
        'Faltan datos obligatorios'

      });

    }

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

    res.json({

      ok: true,

      id: result.insertId,

      imageUrl

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      'Error guardando punto'

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