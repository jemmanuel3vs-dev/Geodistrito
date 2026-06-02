
function errorMiddleware(error, req, res, next) {

  console.error('ERROR:', error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Imagen demasiado pesada'
    });
  }

  res.status(500).json({
    error: error.message || 'Error interno del servidor'
  });

}

module.exports = errorMiddleware;
