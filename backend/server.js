const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const puntosRoutes = require('./routes/puntos.routes');

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   ARCHIVOS ESTÁTICOS
========================= */
// Carpeta uploads (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir el frontend (importante)
app.use(express.static(path.join(__dirname, '../frontend')));

/* =========================
   RUTAS API
========================= */
app.use('/api/puntos', puntosRoutes);

/* =========================
   RUTA TEST
========================= */
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'GeoDistrito API funcionando ✅' });
});

/* =========================
   MANEJO DE ERRORES
========================= */
app.use((error, req, res, next) => {
  console.error('ERROR:', error);
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Imagen demasiado pesada' });
  }
  res.status(500).json({ error: error.message || 'Error interno del servidor' });
});

/* =========================
   INICIAR SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});