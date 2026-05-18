const express =
require('express');

const router =
express.Router();

const upload =
require(
  '../middleware/upload'
);

const {

  getPuntos,
  createPunto

} = require(
  '../controllers/puntos.controller'
);

/* =========================
   GET
========================= */

router.get(
  '/',
  getPuntos
);

/* =========================
   POST
========================= */

router.post(

  '/',

  upload.single('image'),

  createPunto

);

module.exports =
router;