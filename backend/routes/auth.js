const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Empresa = require('../models/Empresa');
const { auth } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'docusmart-super-secret-key-2024-panama-jwt-256-bits';

// @route   POST /api/auth/register
// @desc    Registrar nueva empresa y usuario admin
// @access  Public
router.post('/register', [
  body('empresa.ruc')
    .matches(/^\d{1,2}-\d{1,4}-\d{1,6}$/)
    .withMessage('Formato de RUC inválido (ej: 8-123-456789)'),
  body('empresa.nombre')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nombre de empresa debe tener entre 2 y 200 caracteres'),
  body('empresa.email')
    .isEmail()
    .withMessage('Email de empresa inválido'),
  body('usuario.nombre')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('usuario.email')
    .isEmail()
    .withMessage('Email inválido'),
  body('usuario.password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { empresa, usuario } = req.body;

    // Verificar si la empresa ya existe
    const empresaExistente = await Empresa.findOne({ 
      $or: [{ ruc: empresa.ruc }, { email: empresa.email }] 
    });
    
    if (empresaExistente) {
      return res.status(400).json({
        error: 'Empresa ya registrada',
        message: 'Ya existe una empresa con este RUC o email'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email: usuario.email });
    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Usuario ya registrado',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear empresa
    const nuevaEmpresa = new Empresa({
      ruc: empresa.ruc,
      nombre: empresa.nombre,
      direccion: empresa.direccion,
      telefono: empresa.telefono,
      email: empresa.email,
      plan: empresa.plan || 'basico'
    });

    await nuevaEmpresa.save();

    // Crear usuario admin
    const nuevoUsuario = new User({
      empresaId: nuevaEmpresa._id,
      nombre: usuario.nombre,
      email: usuario.email,
      password: usuario.password,
      rol: 'admin'
    });

    await nuevoUsuario.save();

    // Generar JWT
    const payload = {
      user: {
        id: nuevoUsuario._id,
        empresaId: nuevaEmpresa._id,
        rol: nuevoUsuario.rol
      }
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Empresa y usuario registrados exitosamente',
      token,
      user: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        empresaId: nuevaEmpresa._id,
        empresa: {
          nombre: nuevaEmpresa.nombre,
          ruc: nuevaEmpresa.ruc,
          plan: nuevaEmpresa.plan
        }
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo completar el registro'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Autenticar usuario
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').exists().withMessage('Contraseña requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await User.findOne({ email }).populate('empresaId');
    if (!usuario) {
      return res.status(400).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si está bloqueado
    if (usuario.estaBloqueado()) {
      return res.status(423).json({
        error: 'Cuenta bloqueada',
        message: 'Demasiados intentos fallidos. Intenta más tarde.'
      });
    }

    // Verificar contraseña
    const esPasswordValida = await usuario.compararPassword(password);
    if (!esPasswordValida) {
      await usuario.incrementarIntentosLogin();
      return res.status(400).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si usuario y empresa están activos
    if (!usuario.activo || !usuario.empresaId.estaActiva()) {
      return res.status(403).json({
        error: 'Cuenta inactiva',
        message: 'Tu cuenta o empresa está inactiva'
      });
    }

    // Reset intentos de login y actualizar último acceso
    await usuario.resetearIntentosLogin();
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    // Generar JWT
    const payload = {
      user: {
        id: usuario._id,
        empresaId: usuario.empresaId._id,
        rol: usuario.rol
      }
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        permisos: usuario.permisos,
        empresaId: usuario.empresaId._id,
        empresa: {
          nombre: usuario.empresaId.nombre,
          ruc: usuario.empresaId.ruc,
          plan: usuario.empresaId.plan
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo completar el login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id)
      .select('-password')
      .populate('empresaId', 'nombre ruc plan activa');

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        permisos: usuario.permisos,
        ultimo_acceso: usuario.ultimo_acceso,
        empresa: usuario.empresaId
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Renovar token JWT
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario || !usuario.activo) {
      return res.status(403).json({
        error: 'Usuario inactivo'
      });
    }

    const payload = {
      user: {
        id: usuario._id,
        empresaId: usuario.empresaId,
        rol: usuario.rol
      }
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Token renovado',
      token
    });

  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;