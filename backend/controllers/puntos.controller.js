const db = require('../database/connection');

/* =========================
   CREAR PUNTO - VERSIÓN ADAPTADA A TU TABLA
========================= */
async function createPunto(req, res) {
  try {
    console.log("📥 Body:", req.body);
    console.log("📎 Archivo:", req.file ? req.file.filename : "No hay");

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

    if (!tipo || !lat || !lng || !distrito) {
      return res.status(400).json({ 
        error: 'Faltan datos obligatorios (tipo, lat, lng, distrito)' 
      });
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = req.file
  ? `${baseUrl}/uploads/${req.file.filename}`
  : req.body.url || null;

    const sql = `
      INSERT INTO puntos 
      (tipo, latitud, longitud, distrito, seccion, calle, colonia, municipio, encargado, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      tipo,
      parseFloat(lat),
      parseFloat(lng),
      distrito,
      seccion || null,
      calle || null,
      colonia || null,
      municipio || null,
      encargado || null,
      imageUrl
    ]);

    res.json({
      ok: true,
      id: result.insertId,
      imageUrl
    });

  } catch (error) {
    console.error("❌ ERROR createPunto:", error.message);
    console.error("Código de error:", error.code);
    
    res.status(500).json({
      error: 'Error al guardar el punto',
      detalle: error.message
    });
  }
}

/* =========================
   OBTENER PUNTOS
========================= */
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
        created_at
      FROM puntos 
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo puntos' });
  }
}

module.exports = { getPuntos, createPunto };