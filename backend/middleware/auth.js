const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'docusmart-super-secret-key-2024-panama-jwt-256-bits';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user || !user.activo) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuario no encontrado o inactivo'
      });
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticación inválido'
    });
  }
};

module.exports = { auth };