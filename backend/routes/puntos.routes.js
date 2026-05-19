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
  createPunto,
  updatePunto,
  deletePunto

} = require(
  '../controllers/puntos.controller'
);

const {
  getOverviewStats,
  getStatsByDistrict,
  getStatsByType,
  getStatsByMunicipality,
  getActivityByDate,
  getStatsByUser,
  getStatsByState
} = require(
  '../controllers/stats.controller'
);

const {
  createObservation,
  getObservation,
  updateObservation,
  updatePuntoState,
  getAuditHistory
} = require(
  '../controllers/observations.controller'
);

const {
  verifyToken,
  requireRole
} = require(
  '../middleware/auth.middleware'
);

/*  GET */

router.get(
  '/',
  getPuntos
);

/* POST */

router.post(

  '/',

  verifyToken,
  requireRole('admin', 'capturista'),
  upload.single('image'),

  createPunto

);

/* PUT*/

router.put(

  '/:id',

  verifyToken,
  requireRole('admin'),
  updatePunto

);

/* DELETE */

router.delete(

  '/:id',

  verifyToken,
  requireRole('admin'),
  deletePunto

);

/* ========== ENDPOINTS ESTADÍSTICAS (FASE 4) ========== */

/* GET /api/puntos/stats/overview */
router.get('/stats/overview', getOverviewStats);

/* GET /api/puntos/stats/by-district */
router.get('/stats/by-district', getStatsByDistrict);

/* GET /api/puntos/stats/by-type */
router.get('/stats/by-type', getStatsByType);

/* GET /api/puntos/stats/by-municipality */
router.get('/stats/by-municipality', getStatsByMunicipality);

/* GET /api/puntos/stats/activity-by-date */
router.get('/stats/activity-by-date', getActivityByDate);

/* GET /api/puntos/stats/by-user */
router.get('/stats/by-user', getStatsByUser);

/* GET /api/puntos/stats/by-state */
router.get('/stats/by-state', getStatsByState);

/* ========== ENDPOINTS OBSERVACIONES & AUDITORÍA (FASE 4) ========== */

/* POST /api/puntos/:id/observations - Crear observación */
router.post(
  '/:id/observations',
  verifyToken,
  createObservation
);

/* GET /api/puntos/:id/observations - Obtener última observación */
router.get(
  '/:id/observations',
  getObservation
);

/* PUT /api/puntos/:id/observations/:obsId - Editar observación (admin) */
router.put(
  '/:id/observations/:obsId',
  verifyToken,
  requireRole('admin'),
  updateObservation
);

/* PATCH /api/puntos/:id/state - Cambiar estado (admin) */
router.patch(
  '/:id/state',
  verifyToken,
  requireRole('admin'),
  updatePuntoState
);

/* GET /api/puntos/:id/audit - Obtener historial de cambios */
router.get(
  '/:id/audit',
  verifyToken,
  getAuditHistory
);

module.exports =
router;