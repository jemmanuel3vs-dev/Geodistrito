const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no definido');
}

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token requerido'
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Formato Bearer inválido'
    });
  }

  const token = authHeader.substring(7).trim();

  try {

    const decoded = jwt.verify(
      token,
      JWT_SECRET,
      {
        algorithms: ['HS256']
      }
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      error: 'Token inválido o expirado'
    });

  }

}

function requireRole(...allowedRoles) {

  return (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        error: 'No autenticado'
      });

    }

    if (!allowedRoles.includes(req.user.rol)) {

      return res.status(403).json({
        error: 'No autorizado'
      });

    }

    next();

  };

}

module.exports = {
  verifyToken,
  requireRole
};