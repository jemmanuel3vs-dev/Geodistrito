const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const importRoutes =
require('./routes/import.routes');

const puntosRoutes = require('./routes/puntos.routes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones' }
});

app.use(limiter);

/* =========================
   ARCHIVOS ESTÁTICOS
========================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

/* =========================
   RUTAS API
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/puntos', puntosRoutes);
app.use('/api/import', importRoutes);
/* =========================
   RUTA TEST
========================= */
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'GeoDistrito API funcionando ✅' });
});

module.exports = app;
