const { validationResult } = require('express-validator');
const {
  validateCreatePunto,
  validateUpdatePunto
} = require('./validators/puntos.validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      error: 'Validación fallida',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = {
  validateCreatePunto,
  validateUpdatePunto,
  handleValidationErrors
};
