const { body } = require('express-validator');

const tiposPermitidos = [
  'bardas',
  'lonas',
  'espectaculares',
  'vehiculos',
  'comites',
  'casillas'
];

const tiposPermitidosMensaje =
  'Tipo inválido. Opciones: bardas, lonas, espectaculares, vehiculos, comites, casillas';

const validateCreatePunto = [
  body('tipo')
    .trim()
    .notEmpty()
    .withMessage('El tipo de punto es obligatorio')
    .isIn(tiposPermitidos)
    .withMessage(tiposPermitidosMensaje),

  body('lat')
    .trim()
    .notEmpty()
    .withMessage('La latitud es obligatoria')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),

  body('lng')
    .trim()
    .notEmpty()
    .withMessage('La longitud es obligatoria')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180'),

  body('distrito')
    .trim()
    .notEmpty()
    .withMessage('El distrito es obligatorio'),

  body('seccion')
    .optional({ checkFalsy: true })
    .trim(),

  body('calle')
    .optional({ checkFalsy: true })
    .trim(),

  body('colonia')
    .optional({ checkFalsy: true })
    .trim(),

  body('municipio')
    .optional({ checkFalsy: true })
    .trim(),

  body('encargado')
    .optional({ checkFalsy: true })
    .trim(),

  body('url')
    .optional({ checkFalsy: true })
    .trim()
];

const validateUpdatePunto = [
  body('tipo')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(tiposPermitidos)
    .withMessage(tiposPermitidosMensaje),

  body('lat')
    .optional({ checkFalsy: true })
    .trim()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),

  body('lng')
    .optional({ checkFalsy: true })
    .trim()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180'),

  body('distrito')
    .optional({ checkFalsy: true })
    .trim(),

  body('seccion')
    .optional({ checkFalsy: true })
    .trim(),

  body('calle')
    .optional({ checkFalsy: true })
    .trim(),

  body('colonia')
    .optional({ checkFalsy: true })
    .trim(),

  body('municipio')
    .optional({ checkFalsy: true })
    .trim(),

  body('encargado')
    .optional({ checkFalsy: true })
    .trim(),

  body('url')
    .optional({ checkFalsy: true })
    .trim()
];

module.exports = {
  validateCreatePunto,
  validateUpdatePunto
};
