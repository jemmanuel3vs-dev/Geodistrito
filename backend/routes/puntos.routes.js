const express =
require('express');

const router =
express.Router();

const upload =
require(
  '../middleware/upload'
);

const {
  validateCreatePunto,
  validateUpdatePunto,
  handleValidationErrors
} = require(
  '../middleware/validator.middleware'
);

const {

  getPuntos,
  getPuntoById,
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

/* ======================================================
   PUNTOS
====================================================== */

/* GET */

router.get(
  '/',
  getPuntos
);

router.get(
  '/:id',
  getPuntoById
);

/* POST */

// In development (local) we allow creating puntos without auth to ease testing.
// In other environments keep the verifyToken+requireRole middlewares.
const postAuthMiddlewares = [];
// Disable auth for POST in dev, or when explicitly requested via DISABLE_AUTH
const disableAuth = process.env.NODE_ENV === 'development' || process.env.DISABLE_AUTH === 'true';
if (!disableAuth) {
  postAuthMiddlewares.push(verifyToken, requireRole('admin', 'capturista'));
}

const adminAuthMiddlewares = [];

if (!disableAuth) {
  adminAuthMiddlewares.push(verifyToken, requireRole('admin'));
}

router.post(
  '/',
  ...postAuthMiddlewares,
  upload.single('image'),
  validateCreatePunto,
  handleValidationErrors,
  createPunto
);

/* PUT */

router.put(

  '/:id',

  ...adminAuthMiddlewares,

  validateUpdatePunto,
  handleValidationErrors,

  updatePunto

);

/* DELETE */

router.delete(

  '/:id',

  ...adminAuthMiddlewares,

  deletePunto

);

/* ======================================================
   ESTADÍSTICAS (FASE 4)
====================================================== */

/* GET /api/puntos/stats/overview */

router.get(
  '/stats/overview',
  getOverviewStats
);

/* GET /api/puntos/stats/by-district */

router.get(
  '/stats/by-district',
  getStatsByDistrict
);

/* GET /api/puntos/stats/by-type */

router.get(
  '/stats/by-type',
  getStatsByType
);

/* GET /api/puntos/stats/by-municipality */

router.get(
  '/stats/by-municipality',
  getStatsByMunicipality
);

/* GET /api/puntos/stats/activity-by-date */

router.get(
  '/stats/activity-by-date',
  getActivityByDate
);

/* GET /api/puntos/stats/by-user */

router.get(
  '/stats/by-user',
  getStatsByUser
);

/* GET /api/puntos/stats/by-state */

router.get(
  '/stats/by-state',
  getStatsByState
);

/* ======================================================
   OBSERVACIONES & AUDITORÍA (FASE 4)
====================================================== */

/* POST /api/puntos/:id/observations */

router.post(
  '/:id/observations',
  verifyToken,
  createObservation
);

/* GET /api/puntos/:id/observations */

router.get(

  '/:id/observations',

  getObservation

);

/* PUT /api/puntos/:id/observations/:obsId */

router.put(

  '/:id/observations/:obsId',

  verifyToken,
  requireRole('admin'),

  updateObservation

);

/* PATCH /api/puntos/:id/state */

router.patch(

  '/:id/state',

  verifyToken,
  requireRole('admin'),

  updatePuntoState

);

/* GET /api/puntos/:id/audit */

router.get(

  '/:id/audit',

  verifyToken,

  getAuditHistory

);

module.exports =
router;
