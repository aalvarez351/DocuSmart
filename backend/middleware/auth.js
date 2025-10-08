const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación JWT
const auth = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const usuario = await User.findById(decoded.user.id).populate('empresaId');
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Verificar que la empresa está activa
    if (!usuario.empresaId.estaActiva()) {
      return res.status(403).json({
        error: 'Empresa inactiva',
        message: 'La empresa asociada está inactiva o vencida'
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: usuario._id,
      empresaId: usuario.empresaId._id,
      rol: usuario.rol,
      permisos: usuario.permisos,
      empresa: usuario.empresaId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }

    console.error('Error en middleware auth:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere rol: ${rolesPermitidos.join(' o ')}`
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const requirePermission = (modulo, accion) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado'
      });
    }

    const permisos = req.user.permisos;
    
    if (!permisos[modulo] || !permisos[modulo][accion]) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: `No tienes permiso para ${accion} en ${modulo}`
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario pertenece a la empresa
const requireSameCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado'
    });
  }

  // Si hay empresaId en los parámetros, verificar que coincida
  if (req.params.empresaId && req.params.empresaId !== req.user.empresaId.toString()) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No puedes acceder a datos de otra empresa'
    });
  }

  next();
};

// Middleware para logging de acciones
const logAction = (accion) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`[${new Date().toISOString()}] Usuario ${req.user.id} (${req.user.rol}) realizó: ${accion}`);
    }
    next();
  };
};

module.exports = {
  auth,
  requireRole,
  requirePermission,
  requireSameCompany,
  logAction
};