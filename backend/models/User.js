const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: [true, 'El ID de empresa es obligatorio']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['admin', 'contador', 'usuario'],
    default: 'usuario'
  },
  permisos: {
    facturas: {
      crear: { type: Boolean, default: true },
      leer: { type: Boolean, default: true },
      actualizar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    clientes: {
      crear: { type: Boolean, default: true },
      leer: { type: Boolean, default: true },
      actualizar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    productos: {
      crear: { type: Boolean, default: true },
      leer: { type: Boolean, default: true },
      actualizar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    contratos: {
      crear: { type: Boolean, default: false },
      leer: { type: Boolean, default: true },
      actualizar: { type: Boolean, default: false },
      eliminar: { type: Boolean, default: false }
    },
    configuracion: {
      leer: { type: Boolean, default: false },
      actualizar: { type: Boolean, default: false }
    }
  },
  activo: {
    type: Boolean,
    default: true
  },
  ultimo_acceso: {
    type: Date,
    default: Date.now
  },
  intentos_login: {
    type: Number,
    default: 0
  },
  bloqueado_hasta: Date,
  token_reset: String,
  token_reset_expira: Date
}, {
  timestamps: true,
  collection: 'users'
});

// Índices para optimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ empresaId: 1 });
userSchema.index({ rol: 1 });

// Middleware pre-save para hashear contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function(passwordCandidata) {
  return await bcrypt.compare(passwordCandidata, this.password);
};

// Método para verificar si el usuario está bloqueado
userSchema.methods.estaBloqueado = function() {
  return this.bloqueado_hasta && this.bloqueado_hasta > Date.now();
};

// Método para incrementar intentos de login fallidos
userSchema.methods.incrementarIntentosLogin = async function() {
  // Si ya pasó el tiempo de bloqueo, resetear
  if (this.bloqueado_hasta && this.bloqueado_hasta < Date.now()) {
    return this.updateOne({
      $unset: { bloqueado_hasta: 1 },
      $set: { intentos_login: 1 }
    });
  }
  
  const updates = { $inc: { intentos_login: 1 } };
  
  // Bloquear después de 5 intentos fallidos por 2 horas
  if (this.intentos_login + 1 >= 5 && !this.estaBloqueado()) {
    updates.$set = { bloqueado_hasta: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Método para resetear intentos de login
userSchema.methods.resetearIntentosLogin = function() {
  return this.updateOne({
    $unset: { intentos_login: 1, bloqueado_hasta: 1 }
  });
};

// Método para configurar permisos según rol
userSchema.methods.configurarPermisosPorRol = function() {
  switch (this.rol) {
    case 'admin':
      this.permisos = {
        facturas: { crear: true, leer: true, actualizar: true, eliminar: true },
        clientes: { crear: true, leer: true, actualizar: true, eliminar: true },
        productos: { crear: true, leer: true, actualizar: true, eliminar: true },
        contratos: { crear: true, leer: true, actualizar: true, eliminar: true },
        configuracion: { leer: true, actualizar: true }
      };
      break;
    case 'contador':
      this.permisos = {
        facturas: { crear: true, leer: true, actualizar: true, eliminar: false },
        clientes: { crear: true, leer: true, actualizar: true, eliminar: false },
        productos: { crear: true, leer: true, actualizar: true, eliminar: false },
        contratos: { crear: true, leer: true, actualizar: false, eliminar: false },
        configuracion: { leer: true, actualizar: false }
      };
      break;
    default: // usuario
      this.permisos = {
        facturas: { crear: true, leer: true, actualizar: false, eliminar: false },
        clientes: { crear: true, leer: true, actualizar: false, eliminar: false },
        productos: { crear: false, leer: true, actualizar: false, eliminar: false },
        contratos: { crear: false, leer: true, actualizar: false, eliminar: false },
        configuracion: { leer: false, actualizar: false }
      };
  }
};

// Middleware pre-save para configurar permisos
userSchema.pre('save', function(next) {
  if (this.isModified('rol')) {
    this.configurarPermisosPorRol();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);